import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { SensorChart } from '../shared/SensorChart';
import { Download, FileDown, ArrowUpDown, Edit, Save, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Plus, Trash2 } from 'lucide-react';
import { generateMockSensorData } from '../mockData';
import { useAuth } from '../AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface SensorDataWithNotes {
  id: string;
  farmerId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  phase: string;
  note?: string;
  description?: string;
}

export const FarmerHistory: React.FC = () => {
  const { user } = useAuth();
  const [historicalData, setHistoricalData] = useState<SensorDataWithNotes[]>(() => {
    const data = generateMockSensorData(user?.id || 'f1', 7);
    // Map phase to Primordia/Muda/Matang
    return data.map((item, index) => ({
      ...item,
      phase: index % 3 === 0 ? 'Primordia' : index % 3 === 1 ? 'Muda' : 'Matang',
      note: item.note || '',
      description: ''
    }));
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ note: '', description: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>(undefined);
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>(undefined);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const itemsPerPage = 10;

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchQuery, sortOrder]);

  // Filter data by date range and search
  const filteredData = historicalData.filter((data) => {
    const dataDate = new Date(data.timestamp);
    
    // Date range filter
    if (startDate && dataDate < startDate) return false;
    if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (dataDate > endDateWithTime) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const dateStr = dataDate.toLocaleString('id-ID').toLowerCase();
      const phaseStr = data.phase.toLowerCase();
      const noteStr = (data.note || '').toLowerCase();
      const tempStr = data.temperature.toString();
      const humStr = data.humidity.toString();
      
      if (!dateStr.includes(query) && 
          !phaseStr.includes(query) && 
          !noteStr.includes(query) &&
          !tempStr.includes(query) &&
          !humStr.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

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
      case 'primordia':
        return { bg: '#eab308', text: '#ffffff' }; // yellow-500
      case 'muda':
        return { bg: '#f97316', text: '#ffffff' }; // orange-500
      case 'matang':
        return { bg: '#22c55e', text: '#ffffff' }; // green-500
      default:
        return { bg: '#9ca3af', text: '#ffffff' }; // gray
    }
  };

  const handleSaveEdit = (dataId: string) => {
    setHistoricalData(prev => prev.map(item => 
      item.id === dataId 
        ? { ...item, note: editForm.note, description: editForm.description }
        : item
    ));
    toast.success('Data berhasil disimpan');
    setEditingItem(null);
    setEditForm({ note: '', description: '' });
  };

  const handleDelete = (dataId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setHistoricalData(prev => prev.filter(item => item.id !== dataId));
      toast.success('Data berhasil dihapus');
    }
  };

  const handleExport = () => {
    if (!exportStartDate || !exportEndDate) {
      toast.error('Pilih tanggal mulai dan tanggal akhir terlebih dahulu');
      return;
    }

    const exportData = historicalData.filter((data) => {
      const dataDate = new Date(data.timestamp);
      return dataDate >= exportStartDate! && dataDate <= exportEndDate!;
    });

    if (exportData.length === 0) {
      toast.error('Tidak ada data untuk diekspor pada rentang tanggal tersebut');
      return;
    }

    const headers = ['Tanggal & Waktu', 'Suhu (°C)', 'Kelembaban (%)', 'Fase', 'Catatan'];
    const rows = exportData.map(data => [
      new Date(data.timestamp).toLocaleString('id-ID'),
      data.temperature.toFixed(1),
      data.humidity.toFixed(1),
      data.phase,
      data.note || ''
    ]);

    if (exportFormat === 'csv') {
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `data-sensor-${format(exportStartDate, 'yyyy-MM-dd')}-${format(exportEndDate, 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Data berhasil diekspor ke CSV');
    } else if (exportFormat === 'excel') {
      try {
        console.log('Starting Excel export...', { dataCount: exportData.length });
        
        // Create workbook and worksheet
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        
        // Set column widths for better readability
        worksheet['!cols'] = [
          { wch: 20 }, // Tanggal & Waktu
          { wch: 12 }, // Suhu
          { wch: 15 }, // Kelembaban
          { wch: 12 }, // Fase
          { wch: 30 }  // Catatan
        ];
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Sensor');
        
        console.log('Workbook created, writing to buffer...');
        
        // Write workbook to buffer
        const wbout = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          bookSST: false
        });
        
        console.log('Buffer created, size:', wbout.length);
        
        // Create blob from buffer
        const blob = new Blob([wbout], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        console.log('Blob created, size:', blob.size);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `data-sensor-${format(exportStartDate, 'yyyy-MM-dd')}-${format(exportEndDate, 'yyyy-MM-dd')}.xlsx`;
        link.setAttribute('download', fileName);
        link.style.display = 'none';
        
        console.log('Link created, triggering download...', fileName);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        console.log('Download triggered');
        
        // Clean up
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        
        toast.success('Data berhasil diekspor ke Excel');
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        toast.error('Gagal mengekspor data ke Excel. Silakan coba lagi atau gunakan format CSV.');
      }
    } else if (exportFormat === 'pdf') {
      try {
        console.log('Starting PDF export...', { dataCount: exportData.length });
        
        // Create new PDF document
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        console.log('PDF document created');
        
        // Add title
        doc.setFontSize(16);
        doc.setTextColor(184, 38, 1); // #B82601
        doc.text('Data Sensor - Riwayat', 14, 15);
        
        // Add date range
        doc.setFontSize(10);
        doc.setTextColor(90, 74, 50); // #5A4A32
        const dateRangeText = `Periode: ${format(exportStartDate, 'dd MMM yyyy', { locale: id })} - ${format(exportEndDate, 'dd MMM yyyy', { locale: id })}`;
        doc.text(dateRangeText, 14, 22);
        
        console.log('Title and date range added');
        
        // Prepare table data
        const tableData = exportData.map(data => [
          new Date(data.timestamp).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          `${data.temperature.toFixed(1)}°C`,
          `${data.humidity.toFixed(1)}%`,
          data.phase,
          data.note || '-'
        ]);
        
        console.log('Table data prepared, rows:', tableData.length);
        
        // Check if autoTable is available
        const autoTableFn = (doc as any).autoTable || autoTable;
        if (typeof autoTableFn === 'function') {
          console.log('autoTable function found, creating table...');
          
          // Add table using autoTable
          autoTableFn(doc, {
            head: [headers],
            body: tableData,
            startY: 28,
            styles: {
              fontSize: 8,
              cellPadding: 2,
              textColor: [45, 36, 22], // #2D2416
            },
            headStyles: {
              fillColor: [255, 122, 0], // #FF7A00
              textColor: [255, 255, 255],
              fontStyle: 'bold',
            },
            alternateRowStyles: {
              fillColor: [250, 245, 239], // #FAF5EF
            },
            columnStyles: {
              0: { cellWidth: 50 }, // Tanggal & Waktu
              1: { cellWidth: 30 }, // Suhu
              2: { cellWidth: 35 }, // Kelembaban
              3: { cellWidth: 30 }, // Fase
              4: { cellWidth: 60 }, // Catatan
            },
            margin: { top: 28, left: 14, right: 14 },
          });
          
          console.log('Table added successfully');
        } else {
          console.error('autoTable function not found!');
          throw new Error('autoTable plugin tidak ter-load. Pastikan jspdf-autotable sudah terinstall.');
        }
        
        // Save PDF
        const fileName = `data-sensor-${format(exportStartDate, 'yyyy-MM-dd')}-${format(exportEndDate, 'yyyy-MM-dd')}.pdf`;
        console.log('Saving PDF as:', fileName);
        doc.save(fileName);
        
        console.log('PDF saved successfully');
        toast.success('Data berhasil diekspor ke PDF');
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        toast.error(`Gagal mengekspor data ke PDF: ${errorMessage}`);
      }
    }
    
    setExportDialogOpen(false);
  };

  // Get chart data for date range
  const getChartData = () => {
    if (startDate && endDate) {
      return historicalData.filter((data) => {
        const dataDate = new Date(data.timestamp);
        return dataDate >= startDate && dataDate <= endDate;
      });
    }
    return historicalData;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 style={{ color: 'var(--secondary-dark-red)' }}>Riwayat & Ekspor Data</h2>
          <p style={{ color: 'var(--neutral-gray)' }}>
            Lihat riwayat data sensor dan ekspor untuk analisis lebih lanjut
          </p>
        </div>
        
        <Button
          onClick={() => setExportDialogOpen(true)}
          className="gradient-autumn-cta text-white hover-lift autumn-glow font-semibold"
        >
          <Download className="h-4 w-4 mr-2" />
          Ekspor Data
        </Button>
      </div>

      {/* Historical Charts */}
      <SensorChart
        data={getChartData()}
        title={startDate && endDate 
          ? `Grafik Historis ${format(startDate, 'dd MMM yyyy', { locale: id })} - ${format(endDate, 'dd MMM yyyy', { locale: id })}`
          : "Grafik Historis 7 Hari Terakhir"}
        showTemperature={true}
        showHumidity={true}
      />

      {/* Data Table */}
      <Card className="autumn-card border-[#FF7A00]/10">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-[#B82601] font-bold">Tabel Riwayat Data</CardTitle>
              <div className="flex flex-wrap gap-2">
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
            
            {/* Search and Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari data sensor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#FF7A00]/20 text-[#2D2416] font-semibold hover:bg-[#FF7A00]/10"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {startDate && endDate 
                      ? `${format(startDate, 'dd MMM', { locale: id })} - ${format(endDate, 'dd MMM yyyy', { locale: id })}`
                      : 'Pilih Rentang Tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white max-w-[90vw] sm:max-w-none" align="end">
                  <div className="p-4">
                    {/* Preset Options */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <Label className="text-xs font-semibold text-gray-600 mb-2 block">Pilihan Cepat</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            setStartDate(today);
                            setEndDate(today);
                          }}
                          className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                        >
                          Hari Ini
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const weekAgo = new Date(today);
                            weekAgo.setDate(today.getDate() - 7);
                            setStartDate(weekAgo);
                            setEndDate(today);
                          }}
                          className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                        >
                          7 Hari Terakhir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const monthAgo = new Date(today);
                            monthAgo.setDate(today.getDate() - 30);
                            setStartDate(monthAgo);
                            setEndDate(today);
                          }}
                          className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                        >
                          30 Hari Terakhir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const weekAgo = new Date(today);
                            weekAgo.setDate(today.getDate() - 7);
                            setStartDate(weekAgo);
                            setEndDate(today);
                          }}
                          className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                        >
                          Minggu Ini
                        </Button>
                      </div>
                    </div>
                    
                    {/* Date Pickers - Side by Side on larger screens */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="flex-1">
                        <Label className="text-xs font-semibold text-[#B82601] mb-2 block">Tanggal Mulai</Label>
                        <div className="border border-[#FF7A00]/20 rounded-lg p-2">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            className="rounded-md"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs font-semibold text-[#B82601] mb-2 block">Tanggal Akhir</Label>
                        <div className="border border-[#FF7A00]/20 rounded-lg p-2">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => startDate ? date < startDate : false}
                            initialFocus
                            className="rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      {(startDate || endDate) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStartDate(undefined);
                            setEndDate(undefined);
                          }}
                          className="flex-1 text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                        >
                          Reset
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setDateFilterOpen(false);
                        }}
                        className="flex-1 text-xs h-8 gradient-autumn-cta text-white"
                      >
                        Terapkan
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((data) => {
                    const phaseColor = getPhaseColor(data.phase);
                    return (
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
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: phaseColor.bg }}
                          >
                            {data.phase}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#2D2416] font-medium max-w-xs truncate">
                          {data.note || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(data.id);
                                setEditForm({ 
                                  note: data.note || '', 
                                  description: data.description || '' 
                                });
                              }}
                              className="text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(data.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paginatedData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-[#FF7A00]/20 gap-4">
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
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: Math.min(totalPages, 17) }, (_, i) => i + 1).map((page) => (
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

      {/* Edit Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="autumn-card border-[#FF7A00]/10 max-w-2xl">
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
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder="Tambahkan catatan untuk data ini..."
                rows={4}
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => editingItem && handleSaveEdit(editingItem)}
                className="flex-1 gradient-orange-warm text-white hover-lift autumn-shadow font-bold shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="flex-1 border-[#FF7A00]/20 text-[#5A4A32] hover:bg-[#FF7A00]/10 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="autumn-card border-[#FF7A00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#B82601] font-bold text-xl">Ekspor Data</DialogTitle>
            <DialogDescription className="text-[#5A4A32] font-medium">
              Pilih rentang tanggal dan format file untuk ekspor data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#2D2416] font-semibold mb-2 block">Format File</Label>
              <Select value={exportFormat} onValueChange={(value: 'excel' | 'csv' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Preset Options */}
            <div className="pb-3 border-b border-gray-200">
              <Label className="text-xs font-semibold text-gray-600 mb-2 block">Pilihan Cepat</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setExportStartDate(today);
                    setExportEndDate(today);
                  }}
                  className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                >
                  Hari Ini
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    setExportStartDate(weekAgo);
                    setExportEndDate(today);
                  }}
                  className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                >
                  7 Hari Terakhir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today);
                    monthAgo.setDate(today.getDate() - 30);
                    setExportStartDate(monthAgo);
                    setExportEndDate(today);
                  }}
                  className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                >
                  30 Hari Terakhir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    setExportStartDate(weekStart);
                    setExportEndDate(today);
                  }}
                  className="text-xs h-8 border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                >
                  Minggu Ini
                </Button>
              </div>
            </div>
            
            {/* Date Pickers */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-[#B82601] mb-2 block">Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportStartDate ? format(exportStartDate, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={exportStartDate}
                      onSelect={setExportStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#B82601] mb-2 block">Tanggal Akhir</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#FF7A00]/20 hover:bg-[#FF7A00]/10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportEndDate ? format(exportEndDate, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={exportEndDate}
                      onSelect={setExportEndDate}
                      disabled={(date) => exportStartDate ? date < exportStartDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleExport}
                className="flex-1 gradient-orange-warm text-white hover-lift autumn-shadow font-bold shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Ekspor
              </Button>
              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(false)}
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
