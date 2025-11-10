import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { SensorChart } from '../shared/SensorChart';
import { Download, FileDown, ArrowUpDown, Edit, Save, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { generateMockSensorData } from '../mockData';
import { useAuth } from '../AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner@2.0.3';

export const FarmerHistory: React.FC = () => {
  const { user } = useAuth();
  const [historicalData] = useState(generateMockSensorData(user?.id || 'f1', 7));
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const itemsPerPage = 10;

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, sortOrder]);

  // Filter data by selected date
  const filteredData = selectedDate
    ? historicalData.filter((data) => {
        const dataDate = new Date(data.timestamp);
        return (
          dataDate.getFullYear() === selectedDate.getFullYear() &&
          dataDate.getMonth() === selectedDate.getMonth() &&
          dataDate.getDate() === selectedDate.getDate()
        );
      })
    : historicalData;

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'inokulasi':
        return 'bg-[#FF7A00] text-white';
      case 'pertumbuhan':
        return 'bg-[#9A7400] text-white';
      case 'panen':
        return 'bg-[#B82601] text-white';
      default:
        return 'bg-[#E8A600] text-white';
    }
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    toast.success(`Mengekspor data ke format ${format.toUpperCase()}...`);
    // In real app, would generate and download file
  };

  const handleSaveNote = (dataId: string) => {
    // In real app, would save to backend
    toast.success('Catatan berhasil disimpan');
    setEditingNote(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: 'var(--secondary-dark-red)' }}>Riwayat & Ekspor Data</h2>
          <p style={{ color: 'var(--neutral-gray)' }}>
            Lihat riwayat data sensor dan ekspor untuk analisis lebih lanjut
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('excel')}
            variant="outline"
            className="border-[var(--primary-orange)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            className="border-[var(--primary-gold)]"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            className="border-[var(--secondary-olive)]"
          >
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Historical Charts */}
      <SensorChart
        data={historicalData}
        title="Grafik Historis 7 Hari Terakhir"
        showTemperature={true}
        showHumidity={true}
      />

      {/* Data Table */}
      <Card className="autumn-card border-[#FF7A00]/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-[#B82601] font-bold">Tabel Riwayat Data</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#FF7A00]/20 text-[#2D2416] font-semibold hover:bg-[#FF7A00]/10"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {selectedDate ? selectedDate.toLocaleDateString('id-ID') : 'Pilih Tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                        className="w-full"
                      >
                        Reset Filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10 font-semibold"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                ({sortOrder === 'asc' ? 'Terlama' : 'Terbaru'})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#FF7A00]/20">
                  <TableHead className="text-[#B82601] font-bold">Tanggal & Waktu</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Suhu (°C)</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Kelembaban (%)</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Fase</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Catatan</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#5A4A32]">
                      Tidak ada data untuk tanggal yang dipilih
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((data) => (
                    <TableRow key={data.id} className="border-[#FF7A00]/10">
                      <TableCell className="text-[#2D2416] font-medium">
                        {new Date(data.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-[#2D2416] font-medium">{data.temperature.toFixed(1)}</TableCell>
                      <TableCell className="text-[#2D2416] font-medium">{data.humidity.toFixed(1)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(data.phase)}`}>
                          {data.phase}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#2D2416] font-medium">
                        {data.note || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNote(data.id);
                            setNoteText(data.note || '');
                          }}
                          className="text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paginatedData.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#FF7A00]/20">
              <div className="text-sm text-[#5A4A32] font-medium">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, sortedData.length)} dari {sortedData.length} data
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#FF7A00]/20 text-[#FF7A00] hover:bg-[#FF7A00]/10 font-semibold disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page 
                        ? "gradient-autumn-cta text-white font-bold shadow-lg" 
                        : "border-[#FF7A00]/20 text-[#5A4A32] hover:bg-[#FF7A00]/10 font-semibold"}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-[#FF7A00]/20 text-[#FF7A00] hover:bg-[#FF7A00]/10 font-semibold disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Note Dialog */}
      <Dialog open={editingNote !== null} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="autumn-card border-[#FF7A00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#B82601] font-bold text-xl">Edit Catatan</DialogTitle>
            <DialogDescription className="text-[#5A4A32] font-medium">
              Tambahkan atau ubah catatan untuk data sensor ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#2D2416] font-semibold">Catatan</Label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Tambahkan catatan untuk data ini..."
                rows={4}
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => editingNote && handleSaveNote(editingNote)}
                className="flex-1 gradient-orange-warm text-white hover-lift autumn-shadow font-bold shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingNote(null)}
                className="flex-1 border-[#FF7A00]/20 text-[#5A4A32] hover:bg-[#FF7A00]/10 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
