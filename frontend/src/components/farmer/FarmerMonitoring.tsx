import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { StatCard } from '../shared/StatCard';
import { SensorChart } from '../shared/SensorChart';
import { Thermometer, Droplets, Video, Play, Square, Calendar as CalendarIcon, TrendingUp, Upload, Camera, Save } from 'lucide-react';
import { generateMockSensorData } from '../mockData';
import { useAuth } from '../AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export const FarmerMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [sensorData, setSensorData] = useState(generateMockSensorData(user?.id || 'f1', 1));

  // ML Detection states
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveForm, setSaveForm] = useState({
    title: '',
    description: '',
    baglogId: 'Baglog #1',
    tags: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Detected growth phase (sinkron dengan hasil deteksi)
  const [detectedPhase, setDetectedPhase] = useState<string | null>(null);

  // Historical data states
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [historicalData, setHistoricalData] = useState(() => {
    const days = 7;
    return generateMockSensorData(user?.id || 'f1', days);
  });

  useEffect(() => {
    if (isSimulationRunning) {
      const interval = setInterval(() => {
        const newData = generateMockSensorData(user?.id || 'f1', 1);
        setSensorData(prev => [...prev.slice(-24), ...newData]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSimulationRunning, user?.id]);

  const latestData = sensorData[sensorData.length - 1];

  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const newHistoricalData = generateMockSensorData(user?.id || 'f1', diffDays);
      setHistoricalData(newHistoricalData);
    }
  };

  // ML Detection functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCurrentImage(imageData);
      setDetectionResults(null);
    };
    reader.readAsDataURL(file);
  };

  const captureFromWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCurrentImage(imageData);
        setDetectionResults(null);
      }
    }
  };

  const runDetection = async () => {
    if (!currentImage) {
      toast.error('Pilih atau ambil foto terlebih dahulu');
      return;
    }

    setIsDetecting(true);
    try {
      const formData = new FormData();
      // Convert base64 to blob
      const response = await fetch(currentImage);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');

      const res = await fetch('http://localhost:3000/api/ml/detect', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Detection API error:', errorData);
        throw new Error(errorData.error || errorData.details || `HTTP ${res.status}: Detection failed`);
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Detection failed');
      }
      
      setDetectionResults(data);
      
      // Update fase pertumbuhan berdasarkan hasil deteksi
      if (data.detections && data.detections.length > 0) {
        // Ambil fase dengan jumlah terbanyak
        const phaseCounts = {
          'Primordia': data.summary?.Primordia || 0,
          'Muda': data.summary?.Muda || 0,
          'Matang': data.summary?.Matang || 0
        };
        
        // Tentukan fase dominan berdasarkan jumlah terbanyak
        let dominantPhase = 'Pertumbuhan';
        const maxCount = Math.max(phaseCounts.Primordia, phaseCounts.Muda, phaseCounts.Matang);
        
        if (maxCount > 0) {
          // Prioritas: Matang > Muda > Primordia (jika jumlah sama)
          if (phaseCounts.Matang > 0 && phaseCounts.Matang >= phaseCounts.Muda && phaseCounts.Matang >= phaseCounts.Primordia) {
            dominantPhase = 'Matang (Siap Panen)';
          } else if (phaseCounts.Muda > 0 && phaseCounts.Muda >= phaseCounts.Primordia) {
            dominantPhase = 'Muda';
          } else if (phaseCounts.Primordia > 0) {
            dominantPhase = 'Primordia';
          }
        }
        
        setDetectedPhase(dominantPhase);
        
        // Update sensor data dengan fase terdeteksi (untuk konsistensi)
        if (sensorData.length > 0) {
          const updatedData = [...sensorData];
          updatedData[updatedData.length - 1] = {
            ...updatedData[updatedData.length - 1],
            phase: dominantPhase
          };
          setSensorData(updatedData);
        }
      } else {
        // Jika tidak ada deteksi, reset ke null agar pakai fase default
        setDetectedPhase(null);
      }
      
      toast.success(`Deteksi berhasil! Ditemukan ${data.total_detections || 0} jamur`);
    } catch (error: any) {
      console.error('Detection error:', error);
      const errorMessage = error.message || 'Gagal melakukan deteksi';
      
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        toast.error('Endpoint tidak ditemukan. Pastikan backend berjalan dan sudah di-restart setelah update.');
      } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ML service')) {
        toast.error('ML service tidak berjalan. Jalankan: python ml_api_service.py');
      } else {
        toast.error(`${errorMessage}. Pastikan ML service berjalan di port 5000.`);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!currentImage || !detectionResults) {
      toast.error('Tidak ada hasil deteksi untuk disimpan');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      const response = await fetch(currentImage);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');
      formData.append('farmerId', user?.id || '');
      formData.append('title', saveForm.title || `Deteksi Jamur - ${new Date().toLocaleDateString('id-ID')}`);
      formData.append('description', saveForm.description);
      formData.append('baglogId', saveForm.baglogId);
      formData.append('tags', saveForm.tags);

      const res = await fetch('http://localhost:3000/api/gallery/images', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      toast.success('Foto berhasil disimpan ke galeri!');
      setSaveDialogOpen(false);
      setSaveForm({ title: '', description: '', baglogId: 'Baglog #1', tags: '' });
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Gagal menyimpan ke galeri');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#B82601]">Dashboard Monitoring</h2>
        <p className="text-[#5A4A32]">
          Pantau kondisi budidaya jamur kuping Anda secara real-time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Suhu Saat Ini"
          value={`${latestData?.temperature.toFixed(1)}°C`}
          icon={Thermometer}
          gradientClass="gradient-teal-violet"
          iconColor="var(--primary-orange)"
          trend={{ value: '2.5% dari kemarin', isPositive: true }}
        />
        <StatCard
          title="Kelembaban Saat Ini"
          value={`${latestData?.humidity.toFixed(1)}%`}
          icon={Droplets}
          gradientClass="gradient-cyan-blue"
          iconColor="var(--primary-orange)"
          trend={{ value: '1.2% dari kemarin', isPositive: false }}
        />
        <StatCard
          title="Fase Pertumbuhan"
          value={
            detectedPhase !== null && detectionResults && detectionResults.total_detections > 0
              ? detectedPhase 
              : (latestData?.phase === 'Inokulasi' ? '-' : (latestData?.phase || '-'))
          }
          icon={Video}
          gradientClass={
            detectedPhase !== null && detectionResults && detectionResults.total_detections > 0
              ? detectedPhase.includes('Matang') 
                ? 'gradient-teal-violet' 
                : detectedPhase === 'Muda'
                ? 'gradient-orange-warm'
                : 'gradient-yellow-gold'
              : 'gradient-purple-pink'
          }
          iconColor="var(--primary-orange)"
          trend={detectionResults && detectionResults.total_detections > 0 ? {
            value: `${detectionResults.total_detections} jamur terdeteksi`,
            isPositive: true
          } : undefined}
        />
      </div>

      {/* Camera Simulation & ML Detection */}
      <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#B82601] font-bold">Simulasi Kamera & Computer Vision</CardTitle>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-[#FF7A00]/20 hover:border-[#FF7A00]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Foto
              </Button>
              <Button
                onClick={runDetection}
                disabled={!currentImage || isDetecting}
                className="gradient-autumn-cta text-white hover-lift autumn-glow font-semibold"
              >
                {isDetecting ? (
                  <>
                    <Square className="h-4 w-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Deteksi
                  </>
                )}
              </Button>
              {detectionResults && (
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Simpan ke Galeri
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Simpan ke Galeri Pertumbuhan</DialogTitle>
                      <DialogDescription>
                        Simpan hasil deteksi ke galeri untuk dokumentasi
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Judul</Label>
                        <Input
                          id="title"
                          value={saveForm.title}
                          onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                          placeholder="Contoh: Deteksi Jamur - Hari ke-7"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          value={saveForm.description}
                          onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                          placeholder="Catatan tentang kondisi pertumbuhan..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="baglogId">Baglog</Label>
                          <Select
                            value={saveForm.baglogId}
                            onValueChange={(value) => setSaveForm({ ...saveForm, baglogId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['Baglog #1', 'Baglog #2', 'Baglog #3', 'Baglog #4', 'Baglog #5'].map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tags">Tags</Label>
                          <Input
                            id="tags"
                            value={saveForm.tags}
                            onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                            placeholder="pertumbuhan, optimal"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleSaveToGallery}
                        disabled={isSaving}
                        className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                      >
                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {currentImage ? (
              <div className="relative w-full h-full">
                {/* Display image with detections */}
                <img
                  src={detectionResults?.image_with_detections ? 
                    `data:image/jpeg;base64,${detectionResults.image_with_detections}` : 
                    currentImage}
                  alt="Mushroom detection"
                  className="w-full h-full object-contain"
                />
                
                {/* Draw bounding boxes overlay if we have detections but no annotated image */}
                {detectionResults && detectionResults.detections && detectionResults.detections.length > 0 && !detectionResults.image_with_detections && (
                  <div className="absolute inset-0 pointer-events-none">
                    {detectionResults.detections.map((det: any, idx: number) => {
                      const [x1, y1, x2, y2] = det.bbox;
                      const color = det.class === 'Primordia' ? 'yellow' : 
                                   det.class === 'Muda' ? 'orange' : 'green';
                      return (
                        <div
                          key={idx}
                          className="absolute border-2"
                          style={{
                            left: `${x1}px`,
                            top: `${y1}px`,
                            width: `${x2 - x1}px`,
                            height: `${y2 - y1}px`,
                            borderColor: color,
                            pointerEvents: 'none'
                          }}
                        >
                          <div 
                            className="absolute -top-6 left-0 px-2 py-1 text-xs font-bold text-white rounded"
                            style={{ backgroundColor: color }}
                          >
                            {det.class} {(det.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Detection Summary Overlay */}
                {detectionResults && (
                  <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg min-w-[220px] shadow-lg border border-white/20">
                    <p className="font-bold mb-3 text-lg">Hasil Deteksi</p>
                    {detectionResults.summary && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <span>Primordia:</span>
                          </div>
                          <span className="font-bold text-yellow-400">{detectionResults.summary.Primordia || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span>Muda:</span>
                          </div>
                          <span className="font-bold text-orange-500">{detectionResults.summary.Muda || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Matang:</span>
                          </div>
                          <span className="font-bold text-green-500">{detectionResults.summary.Matang || 0}</span>
                        </div>
                        <div className="border-t border-white/30 mt-3 pt-3 flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg">{detectionResults.total_detections || 0}</span>
                        </div>
                      </div>
                    )}
                    {(!detectionResults.summary || detectionResults.total_detections === 0) && (
                      <div className="text-center py-4">
                        <p className="text-yellow-400 text-sm">⚠️ Tidak ada jamur terdeteksi</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Coba foto dengan pencahayaan lebih baik atau turunkan threshold
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload foto atau ambil foto untuk deteksi</p>
                </div>
              </div>
            )}
            {/* Hidden canvas for webcam capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Detection Details */}
          {detectionResults && detectionResults.detections && detectionResults.detections.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#FF7A00]/5 to-[#E8A600]/5 rounded-lg border border-[#FF7A00]/10">
              <p className="font-semibold text-[#B82601] mb-2">Detail Deteksi:</p>
              <div className="space-y-2">
                {detectionResults.detections.map((det: any, idx: number) => {
                  const getBadgeStyle = () => {
                    if (det.class === 'Primordia') {
                      return { backgroundColor: '#eab308', color: '#ffffff' }; // yellow-500
                    } else if (det.class === 'Muda') {
                      return { backgroundColor: '#f97316', color: '#ffffff' }; // orange-500
                    } else {
                      return { backgroundColor: '#22c55e', color: '#ffffff' }; // green-500
                    }
                  };
                  
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className="border-transparent hover:opacity-90"
                          style={getBadgeStyle()}
                        >
                          {det.class}
                        </Badge>
                        <span>Confidence: {(det.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-[#5A4A32]">
                        {det.harvest_days > 0 ? `Panen: +${det.harvest_days} hari` : 'Siap Panen!'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <p className="text-sm mt-4" style={{ color: 'var(--neutral-gray)' }}>
            AI Computer Vision mendeteksi fase pertumbuhan dan kondisi kesehatan jamur secara otomatis
          </p>
        </CardContent>
      </Card>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          data={sensorData}
          title="Grafik Suhu Real-Time"
          showTemperature={true}
          showHumidity={false}
        />
        <SensorChart
          data={sensorData}
          title="Grafik Kelembaban Real-Time"
          showTemperature={false}
          showHumidity={true}
        />
      </div>

      {/* Historical Data Section */}
      <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-autumn-hero flex items-center justify-center autumn-shadow">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl text-[#B82601] font-bold">Grafik Historis (Custom Range)</CardTitle>
              <p className="text-sm text-[#5A4A32] mt-1">Pilih rentang tanggal untuk melihat data historis suhu dan kelembaban</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date Range Picker */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gradient-to-r from-[#FF7A00]/5 to-[#E8A600]/5 rounded-xl border border-[#FF7A00]/10">
            <div className="flex-1">
              <label className="text-sm font-semibold text-[#B82601] mb-2 block">Tanggal Mulai</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-medium border-[#FF7A00]/20 hover:border-[#FF7A00] hover:bg-[#FF7A00]/5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#FF7A00]" />
                    {startDate ? format(startDate, 'dd MMMM yyyy', { locale: id }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-semibold text-[#B82601] mb-2 block">Tanggal Akhir</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-medium border-[#FF7A00]/20 hover:border-[#FF7A00] hover:bg-[#FF7A00]/5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#FF7A00]" />
                    {endDate ? format(endDate, 'dd MMMM yyyy', { locale: id }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleApplyDateFilter}
                className="gradient-autumn-cta text-white hover-lift autumn-glow font-semibold w-full md:w-auto px-8"
                disabled={!startDate || !endDate}
              >
                Tampilkan Grafik
              </Button>
            </div>
          </div>

          {/* Historical Chart */}
          {startDate && endDate && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4 p-3 bg-[#E8A600]/10 rounded-lg border border-[#E8A600]/20">
                <p className="text-sm font-semibold text-[#5A4A32]">
                  Menampilkan data dari <span className="text-[#B82601]">{format(startDate, 'dd MMM yyyy', { locale: id })}</span> hingga <span className="text-[#B82601]">{format(endDate, 'dd MMM yyyy', { locale: id })}</span>
                </p>
                <Badge className="bg-[#9A7400] text-white font-semibold">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} hari
                </Badge>
              </div>
              <SensorChart
                data={historicalData}
                title="Grafik Suhu & Kelembaban Historis"
                showTemperature={true}
                showHumidity={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
