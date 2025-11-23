import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Eye, Calendar, Tag, Plus, Filter, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuth } from '../AuthContext';

interface GalleryImage {
  id: string;
  url: string;
  annotatedUrl?: string;
  title: string;
  description: string;
  date: string;
  baglogId: string;
  stage: string;
  tags: string[];
  detections?: {
    summary: {
      Primordia?: number;
      Muda?: number;
      Matang?: number;
    };
    total: number;
    details: Array<{
      class: string;
      confidence: number;
      bbox: number[];
      harvest_days: number;
    }>;
  };
}

const mockImages: GalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400',
    title: 'Jamur Kuping - Hari ke-7',
    description: 'Pertumbuhan awal jamur kuping di baglog #1. Miselium mulai berkembang dengan baik.',
    date: '2025-10-28',
    baglogId: 'Baglog #1',
    stage: 'Awal',
    tags: ['pertumbuhan', 'miselium', 'baglog-1']
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1595587637401-f8f030dad3e9?w=400',
    title: 'Jamur Kuping - Hari ke-14',
    description: 'Jamur mulai membentuk tubuh buah. Kondisi kelembaban optimal terjaga.',
    date: '2025-11-04',
    baglogId: 'Baglog #1',
    stage: 'Pertumbuhan',
    tags: ['tubuh-buah', 'optimal']
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=400',
    title: 'Jamur Kuping - Siap Panen',
    description: 'Jamur kuping mencapai ukuran ideal untuk dipanen (diameter 8-10cm).',
    date: '2025-11-11',
    baglogId: 'Baglog #1',
    stage: 'Panen',
    tags: ['siap-panen', 'optimal', 'ukuran-ideal']
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1599493758267-c6c884c7071f?w=400',
    title: 'Hasil Panen Perdana',
    description: 'Total hasil panen 2.5kg dari baglog #1. Kualitas sangat baik.',
    date: '2025-11-12',
    baglogId: 'Baglog #1',
    stage: 'Panen',
    tags: ['hasil-panen', 'kualitas-bagus']
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400',
    title: 'Baglog #2 - Pembukaan',
    description: 'Pembukaan baglog baru untuk siklus berikutnya.',
    date: '2025-11-13',
    baglogId: 'Baglog #2',
    stage: 'Awal',
    tags: ['baglog-baru', 'pembukaan']
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1595587637401-f8f03e0dad3e9?w=400',
    title: 'Monitoring Kelembaban',
    description: 'Dokumentasi kondisi ruangan dengan kelembaban 85%.',
    date: '2025-11-14',
    baglogId: 'Baglog #2',
    stage: 'Pertumbuhan',
    tags: ['monitoring', 'kelembaban']
  }
];

const stages = ['Semua', 'Awal', 'Pertumbuhan', 'Panen'];

export const GrowthGallery: React.FC = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    baglogId: 'Baglog #1',
    stage: 'Awal',
    tags: '',
    file: null as File | null
  });

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/gallery/images?farmerId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Convert API URLs to full URLs
          const imagesWithUrls = data.images.map((img: any) => ({
            ...img,
            url: img.url.startsWith('http') ? img.url : `http://localhost:3000${img.url}`,
            annotatedUrl: img.annotatedUrl ? 
              (img.annotatedUrl.startsWith('http') ? img.annotatedUrl : `http://localhost:3000${img.annotatedUrl}`) :
              undefined
          }));
          setImages(imagesWithUrls);
        } else {
          console.error('Failed to fetch images');
          // Fallback to mock data if API fails
          setImages(mockImages);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to mock data
        setImages(mockImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [user?.id]);

  const handleUploadImage = async () => {
    if (!newImage.file) {
      toast.error('Harap pilih foto!');
      return;
    }

    if (!user?.id) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', newImage.file);
      formData.append('farmerId', user.id);
      formData.append('title', newImage.title || `Foto Jamur - ${new Date().toLocaleDateString('id-ID')}`);
      formData.append('description', newImage.description);
      formData.append('baglogId', newImage.baglogId);
      formData.append('tags', newImage.tags);

      const response = await fetch('http://localhost:3000/api/gallery/images', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Add new image to list
      const newImg: GalleryImage = {
        ...data.image,
        url: data.image.url.startsWith('http') ? data.image.url : `http://localhost:3000${data.image.url}`,
        annotatedUrl: data.image.annotatedUrl ? 
          (data.image.annotatedUrl.startsWith('http') ? data.image.annotatedUrl : `http://localhost:3000${data.image.annotatedUrl}`) :
          undefined
    };

      setImages([newImg, ...images]);
      setNewImage({ title: '', description: '', baglogId: 'Baglog #1', stage: 'Awal', tags: '', file: null });
    setIsUploadOpen(false);
      toast.success('Foto berhasil diunggah dan dianalisis!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Gagal mengunggah foto');
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/gallery/images/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

    setImages(images.filter(img => img.id !== id));
    setSelectedImage(null);
    toast.success('Foto berhasil dihapus!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus foto');
    }
  };

  const handleDownloadImage = (image: GalleryImage) => {
    toast.success('Foto sedang diunduh...');
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = selectedStage === 'Semua' || img.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const groupedImages = filteredImages.reduce((acc, img) => {
    if (!acc[img.baglogId]) {
      acc[img.baglogId] = [];
    }
    acc[img.baglogId].push(img);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="h-6 w-6" style={{ color: 'var(--primary-orange)' }} />
              <div>
                <CardTitle>Galeri Pertumbuhan Jamur</CardTitle>
                <p className="text-sm opacity-60 mt-1">
                  Dokumentasi visual progress budidaya Anda
                </p>
              </div>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Foto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Foto Pertumbuhan</DialogTitle>
                  <DialogDescription>
                    Unggah foto dokumentasi pertumbuhan jamur kuping Anda
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imageFile">Pilih Foto</Label>
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewImage({ ...newImage, file });
                        }
                      }}
                      className="mt-2"
                    />
                    {newImage.file && (
                      <p className="text-sm text-green-600 mt-2">✓ {newImage.file.name}</p>
                    )}
                    <p className="text-xs opacity-50 mt-2">JPG, PNG maks. 5MB. Foto akan otomatis dianalisis dengan AI</p>
                  </div>

                  <div>
                    <Label htmlFor="title">Judul Foto</Label>
                    <Input
                      id="title"
                      placeholder="Contoh: Jamur Kuping - Hari ke-7"
                      value={newImage.title}
                      onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Catatan tentang kondisi pertumbuhan..."
                      value={newImage.description}
                      onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="baglogId">Baglog</Label>
                      <Select 
                        value={newImage.baglogId} 
                        onValueChange={(value) => setNewImage({ ...newImage, baglogId: value })}
                      >
                        <SelectTrigger className="mt-2">
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
                      <Label htmlFor="stage">Tahap</Label>
                      <Select 
                        value={newImage.stage} 
                        onValueChange={(value) => setNewImage({ ...newImage, stage: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.filter(s => s !== 'Semua').map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                    <Input
                      id="tags"
                      placeholder="contoh: pertumbuhan, optimal, kelembaban"
                      value={newImage.tags}
                      onChange={(e) => setNewImage({ ...newImage, tags: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    onClick={handleUploadImage}
                    className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Foto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
              <Input
                placeholder="Cari foto, tag, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
              <p className="text-sm opacity-60">Total Foto</p>
              <p className="text-2xl mt-1">{images.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
              <p className="text-sm opacity-60">Baglog Aktif</p>
              <p className="text-2xl mt-1">{Object.keys(groupedImages).length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <p className="text-sm opacity-60">Foto Panen</p>
              <p className="text-2xl mt-1">{images.filter(img => img.stage === 'Panen').length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <p className="text-sm opacity-60">Bulan Ini</p>
              <p className="text-2xl mt-1">{images.filter(img => {
                const imgDate = new Date(img.date);
                const now = new Date();
                return imgDate.getMonth() === now.getMonth();
              }).length}</p>
            </div>
          </div>

          {/* Gallery Grid - Responsive and Scrollable */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>Memuat galeri...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada foto ditemukan</p>
            </div>
          ) : (
            <div className="space-y-8 max-h-[calc(100vh-400px)] overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#fdba74 #fed7aa'
            }}>
              {Object.entries(groupedImages).map(([baglogId, baglogImages]) => (
                <div key={baglogId}>
                  <h3 className="mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                    <Tag className="h-4 w-4" style={{ color: 'var(--primary-orange)' }} />
                    {baglogId}
                    <Badge variant="outline" className="ml-2">
                      {baglogImages.length} foto
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {baglogImages.map((image) => (
                      <Card 
                        key={image.id}
                        className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="relative aspect-square">
                          <ImageWithFallback
                            src={image.annotatedUrl || image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <Badge 
                            className="absolute top-2 right-2 bg-white text-gray-800 text-xs"
                            variant="outline"
                          >
                            {image.stage}
                          </Badge>
                          {image.detections && image.detections.total > 0 && (
                            <Badge 
                              className="absolute top-2 left-2 bg-green-500 text-white text-xs"
                            >
                              AI: {image.detections.total}
                            </Badge>
                          )}
                        </div>
                        <div className="p-2 sm:p-3">
                          <p className="text-xs sm:text-sm line-clamp-1">{image.title}</p>
                          <div className="flex items-center gap-2 mt-1 sm:mt-2 text-xs opacity-60">
                            <Calendar className="h-3 w-3" />
                            {new Date(image.date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Detail Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl w-[95vw] max-h-[85vh] !flex !flex-col p-4 sm:p-6 overflow-hidden">
            <DialogHeader className="flex-shrink-0 pb-2">
              <DialogTitle className="text-base sm:text-lg">{selectedImage.title}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Detail foto dokumentasi pertumbuhan
              </DialogDescription>
            </DialogHeader>
            <div 
              className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 sm:space-y-4 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#fdba74 #fed7aa',
                WebkitOverflowScrolling: 'touch',
                maxHeight: 'calc(85vh - 200px)'
              }}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedImage.annotatedUrl || selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Detection Results */}
              {selectedImage.detections && (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <p className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">Hasil Deteksi AI:</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">{selectedImage.detections.summary.Primordia || 0}</p>
                      <p className="text-xs text-gray-600">Primordia</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-orange-600">{selectedImage.detections.summary.Muda || 0}</p>
                      <p className="text-xs text-gray-600">Muda</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{selectedImage.detections.summary.Matang || 0}</p>
                      <p className="text-xs text-gray-600">Matang</p>
                    </div>
                  </div>
                  {selectedImage.detections.details && selectedImage.detections.details.length > 0 && (
                    <div className="space-y-2 text-xs sm:text-sm max-h-48 sm:max-h-60 overflow-y-auto pr-2">
                      {selectedImage.detections.details.map((det: any, idx: number) => {
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
                          <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-1">
                            <span className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                className="border-transparent hover:opacity-90 text-xs"
                                style={getBadgeStyle()}
                              >
                                {det.class}
                              </Badge>
                              <span className="text-xs sm:text-sm">Confidence: {(det.confidence * 100).toFixed(1)}%</span>
                            </span>
                            <span className="text-gray-600 text-xs sm:text-sm">
                              {det.harvest_days > 0 ? `Panen: +${det.harvest_days} hari` : 'Siap Panen!'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="opacity-60 mb-1">Tanggal</p>
                  <p className="text-xs sm:text-sm">{new Date(selectedImage.date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Baglog</p>
                  <p className="text-xs sm:text-sm">{selectedImage.baglogId}</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Tahap</p>
                  <Badge variant="outline" className="text-xs">{selectedImage.stage}</Badge>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedImage.tags.length > 0 ? (
                      selectedImage.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Tidak ada tags</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedImage.description && (
                <div>
                  <p className="opacity-60 text-xs sm:text-sm mb-2">Deskripsi</p>
                  <p className="text-xs sm:text-sm">{selectedImage.description}</p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t mt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                onClick={() => handleDownloadImage(selectedImage)}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs sm:text-sm h-9 sm:h-10"
                onClick={() => handleDeleteImage(selectedImage.id)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
