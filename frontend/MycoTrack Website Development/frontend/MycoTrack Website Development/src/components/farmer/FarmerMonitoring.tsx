import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { StatCard } from '../shared/StatCard';
import { SensorChart } from '../shared/SensorChart';
import { Thermometer, Droplets, Video, Play, Square, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { generateMockSensorData } from '../mockData';
import { useAuth } from '../AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const FarmerMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [sensorData, setSensorData] = useState(generateMockSensorData(user?.id || 'f1', 1));
  const [devices, setDevices] = useState({
    fan: false,
    mist: false,
    heater: false,
    light: false
  });

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
          trend={{ value: '2.5% dari kemarin', isPositive: true }}
        />
        <StatCard
          title="Kelembaban Saat Ini"
          value={`${latestData?.humidity.toFixed(1)}%`}
          icon={Droplets}
          gradientClass="gradient-cyan-blue"
          trend={{ value: '1.2% dari kemarin', isPositive: false }}
        />
        <StatCard
          title="Fase Pertumbuhan"
          value={latestData?.phase || 'Pertumbuhan'}
          icon={Video}
          gradientClass="gradient-purple-pink"
        />
      </div>

      {/* Camera Simulation */}
      <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#B82601] font-bold">Simulasi Kamera & Computer Vision</CardTitle>
            <Button
              onClick={() => setIsSimulationRunning(!isSimulationRunning)}
              className={isSimulationRunning 
                ? 'bg-[#B82601] hover:bg-[#8B1C01] text-white font-semibold' 
                : 'gradient-autumn-cta text-white hover-lift autumn-glow font-semibold'
              }
            >
              {isSimulationRunning ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Simulasi
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulasi
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <img
              src="https://images.unsplash.com/photo-1735282260417-cb781d757604?w=800"
              alt="Mushroom cultivation"
              className="w-full h-full object-cover"
            />
            {isSimulationRunning && (
              <>
                {/* Bounding boxes simulation */}
                <div className="absolute top-1/4 left-1/4 w-32 h-24 border-2 border-[var(--primary-orange)] rounded">
                  <Badge className="absolute -top-6 left-0 bg-[var(--primary-orange)]">
                    Fase: {latestData?.phase}
                  </Badge>
                </div>
                <div className="absolute top-1/2 right-1/4 w-28 h-20 border-2 border-[var(--primary-gold)] rounded">
                  <Badge className="absolute -top-6 left-0 bg-[var(--primary-gold)]">
                    Sehat 95%
                  </Badge>
                </div>
                {/* Live indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">LIVE</span>
                </div>
              </>
            )}
          </div>
          <p className="text-sm mt-4" style={{ color: 'var(--neutral-gray)' }}>
            AI Computer Vision mendeteksi fase pertumbuhan dan kondisi kesehatan jamur secara otomatis
          </p>
        </CardContent>
      </Card>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          data={sensorData.slice(-12)}
          title="Grafik Suhu Real-Time"
          showTemperature={true}
          showHumidity={false}
        />
        <SensorChart
          data={sensorData.slice(-12)}
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

      {/* Manual Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Kontrol Manual Perangkat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p>Kipas Angin</p>
                <p className="text-sm" style={{ color: 'var(--neutral-gray)' }}>
                  Sirkulasi Udara
                </p>
              </div>
              <Switch
                checked={devices.fan}
                onCheckedChange={(checked) => setDevices({ ...devices, fan: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p>Sistem Kabut</p>
                <p className="text-sm" style={{ color: 'var(--neutral-gray)' }}>
                  Kelembaban
                </p>
              </div>
              <Switch
                checked={devices.mist}
                onCheckedChange={(checked) => setDevices({ ...devices, mist: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p>Pemanas</p>
                <p className="text-sm" style={{ color: 'var(--neutral-gray)' }}>
                  Suhu
                </p>
              </div>
              <Switch
                checked={devices.heater}
                onCheckedChange={(checked) => setDevices({ ...devices, heater: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p>Lampu LED</p>
                <p className="text-sm" style={{ color: 'var(--neutral-gray)' }}>
                  Pencahayaan
                </p>
              </div>
              <Switch
                checked={devices.light}
                onCheckedChange={(checked) => setDevices({ ...devices, light: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
