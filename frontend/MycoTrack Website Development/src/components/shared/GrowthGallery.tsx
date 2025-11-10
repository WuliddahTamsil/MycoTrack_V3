import React, { useState } from 'react';
import { Image, Upload, Trash2, Eye, Calendar, Tag, Plus, Filter, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
  baglogId: string;
  stage: string;
  tags: string[];
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
  const [images, setImages] = useState<GalleryImage[]>(mockImages);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('Semua');
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    baglogId: 'Baglog #1',
    stage: 'Awal',
    tags: ''
  });

  const handleUploadImage = () => {
    if (!newImage.title) {
      toast.error('Harap isi judul foto!');
      return;
    }

    const image: GalleryImage = {
      id: Date.now().toString(),
      url: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400',
      title: newImage.title,
      description: newImage.description,
      date: new Date().toISOString().split('T')[0],
      baglogId: newImage.baglogId,
      stage: newImage.stage,
      tags: newImage.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    setImages([image, ...images]);
    setNewImage({ title: '', description: '', baglogId: 'Baglog #1', stage: 'Awal', tags: '' });
    setIsUploadOpen(false);
    toast.success('Foto berhasil diunggah!');
  };

  const handleDeleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    setSelectedImage(null);
    toast.success('Foto berhasil dihapus!');
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
                    <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-orange-300 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Klik atau drag & drop foto di sini</p>
                      <p className="text-xs opacity-50 mt-2">JPG, PNG maks. 5MB</p>
                    </div>
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

          {/* Gallery Grid */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada foto ditemukan</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedImages).map(([baglogId, baglogImages]) => (
                <div key={baglogId}>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" style={{ color: 'var(--primary-orange)' }} />
                    {baglogId}
                    <Badge variant="outline" className="ml-2">
                      {baglogImages.length} foto
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {baglogImages.map((image) => (
                      <Card 
                        key={image.id}
                        className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="relative aspect-square">
                          <ImageWithFallback
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <Badge 
                            className="absolute top-2 right-2 bg-white text-gray-800"
                            variant="outline"
                          >
                            {image.stage}
                          </Badge>
                        </div>
                        <div className="p-3">
                          <p className="text-sm line-clamp-1">{image.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedImage.title}</DialogTitle>
              <DialogDescription>
                Detail foto dokumentasi pertumbuhan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-60">Tanggal</p>
                  <p>{new Date(selectedImage.date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="opacity-60">Baglog</p>
                  <p>{selectedImage.baglogId}</p>
                </div>
                <div>
                  <p className="opacity-60">Tahap</p>
                  <Badge variant="outline">{selectedImage.stage}</Badge>
                </div>
                <div>
                  <p className="opacity-60">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedImage.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {selectedImage.description && (
                <div>
                  <p className="opacity-60 text-sm mb-2">Deskripsi</p>
                  <p className="text-sm">{selectedImage.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDownloadImage(selectedImage)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={() => handleDeleteImage(selectedImage.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
