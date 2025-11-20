import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

// Type assertion untuk Button component
const ButtonComponent = Button as any;
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
}

export const AdminContent = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null as string | null);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    imageUrl: '',
    imageFile: null as File | null
  });

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (!response.ok) {
        throw new Error('Gagal memuat artikel');
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Gagal memuat artikel. Pastikan backend berjalan.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddArticle = async () => {
    try {
      // Use imageFile if available, otherwise use imageUrl, otherwise use default
      let imageUrl = formData.imageUrl;
      if (formData.imageFile) {
        // In a real app, upload to server first
        // For now, create object URL for preview
        imageUrl = URL.createObjectURL(formData.imageFile);
      } else if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400';
      }

      const response = await fetch(`${API_BASE_URL}/admin/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          author: formData.author,
          category: formData.category,
          image: imageUrl,
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menambahkan artikel');
      }

      const data = await response.json();
      setArticles([data.article, ...articles]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Artikel berhasil ditambahkan');
    } catch (error: any) {
      console.error('Error adding article:', error);
      toast.error(error.message || 'Gagal menambahkan artikel');
    }
  };

  const handleEditArticle = async () => {
    if (!editingArticle) return;

    try {
      // Use imageFile if available, otherwise use imageUrl, otherwise keep existing image
      let imageUrl = formData.imageUrl;
      if (formData.imageFile) {
        // In a real app, upload to server first
        imageUrl = URL.createObjectURL(formData.imageFile);
      } else if (!imageUrl) {
        // Keep existing image if no new image provided
        const existingArticle = articles.find(a => a.id === editingArticle);
        imageUrl = existingArticle?.image || 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400';
      }

      const response = await fetch(`${API_BASE_URL}/admin/articles/${editingArticle}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          author: formData.author,
          category: formData.category,
          image: imageUrl,
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui artikel');
      }

      const data = await response.json();
      setArticles(articles.map(a => a.id === editingArticle ? data.article : a));
      setEditingArticle(null);
      resetForm();
      toast.success('Artikel berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating article:', error);
      toast.error(error.message || 'Gagal memperbarui artikel');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus artikel');
      }

      setArticles(articles.filter(a => a.id !== articleId));
      toast.success('Artikel berhasil dihapus');
    } catch (error: any) {
      console.error('Error deleting article:', error);
      toast.error(error.message || 'Gagal menghapus artikel');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      category: '',
      imageUrl: '',
      imageFile: null
    });
  };

  const openEditDialog = (article: Article) => {
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category,
      imageUrl: article.image,
      imageFile: null
    });
    setEditingArticle(article.id);
  };

  const handleImageFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0], imageUrl: '' });
    }
  };

  const getImagePreview = () => {
    if (formData.imageFile) {
      return URL.createObjectURL(formData.imageFile);
    }
    if (formData.imageUrl) {
      return formData.imageUrl;
    }
    return null;
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    // Mapping kategori ke warna
    if (categoryLower.includes('tutorial') || categoryLower.includes('panduan') || categoryLower.includes('guide')) {
      return {
        bg: '#FEF3C7', // Light yellow
        text: '#92400E', // Dark brown
        border: '#FCD34D' // Yellow border
      };
    }
    if (categoryLower.includes('teknologi') || categoryLower.includes('technology') || categoryLower.includes('iot')) {
      return {
        bg: '#DBEAFE', // Light blue
        text: '#1E40AF', // Dark blue
        border: '#60A5FA' // Blue border
      };
    }
    if (categoryLower.includes('pemasaran') || categoryLower.includes('marketing') || categoryLower.includes('bisnis')) {
      return {
        bg: '#FCE7F3', // Light pink
        text: '#9F1239', // Dark pink
        border: '#F472B6' // Pink border
      };
    }
    if (categoryLower.includes('hama') || categoryLower.includes('penyakit') || categoryLower.includes('masalah')) {
      return {
        bg: '#FEE2E2', // Light red
        text: '#991B1B', // Dark red
        border: '#F87171' // Red border
      };
    }
    if (categoryLower.includes('suhu') || categoryLower.includes('kelembaban') || categoryLower.includes('lingkungan')) {
      return {
        bg: '#D1FAE5', // Light green
        text: '#065F46', // Dark green
        border: '#34D399' // Green border
      };
    }
    
    // Default: Orange theme (sesuai tema aplikasi)
    return {
      bg: '#FED7AA', // Light orange
      text: '#9A3412', // Dark orange
      border: '#FB923C' // Orange border
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: 'var(--secondary-dark-red)' }}>Manajemen Konten</h2>
          <p style={{ color: 'var(--neutral-gray)' }}>
            Kelola artikel dan konten edukasi
          </p>
        </div>
        
        <ButtonComponent
          onClick={() => setIsAddDialogOpen(true)}
          className="gradient-autumn-cta text-white hover-lift autumn-glow font-bold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Artikel
        </ButtonComponent>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Memuat artikel...</p>
          </CardContent>
        </Card>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Belum ada artikel. Tambahkan artikel pertama Anda!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden group transition-all duration-300 hover:shadow-xl"
            >
              {/* Article Image */}
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#B82601]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span 
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold border shadow-md backdrop-blur-sm"
                    style={{ 
                      backgroundColor: getCategoryColor(article.category).bg,
                      color: getCategoryColor(article.category).text,
                      borderColor: getCategoryColor(article.category).border
                    }}
                  >
                    {article.category || 'Tidak ada kategori'}
                  </span>
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ButtonComponent
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(article)}
                    className="bg-white/90 hover:bg-white shadow-md backdrop-blur-sm h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4 text-[#B82601]" />
                  </ButtonComponent>
                  <ButtonComponent
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteArticle(article.id)}
                    className="bg-white/90 hover:bg-red-50 shadow-md backdrop-blur-sm h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ButtonComponent>
                </div>
              </div>

              {/* Article Content */}
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 text-lg text-[#B82601] font-bold mb-2 group-hover:text-[#FF7A00] transition-colors">
                  {article.title}
                </CardTitle>
                {article.excerpt && (
                  <p className="line-clamp-2 text-sm text-[#5A4A32] font-medium">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Author and Date */}
                <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#B82601] flex items-center justify-center text-white font-bold text-xs">
                      {article.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[#5A4A32]">{article.author}</span>
                  </div>
                  <span className="text-[#FF7A00] font-medium">
                    {new Date(article.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Action Buttons (Mobile/Always Visible) */}
                <div className="flex gap-2 md:hidden">
                  <ButtonComponent
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(article)}
                    className="flex-1 border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </ButtonComponent>
                  <ButtonComponent
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteArticle(article.id)}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </ButtonComponent>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Article Dialog */}
      <Dialog open={isAddDialogOpen || editingArticle !== null} onOpenChange={() => {
        setIsAddDialogOpen(false);
        setEditingArticle(null);
        resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}</DialogTitle>
            <DialogDescription>
              {editingArticle 
                ? 'Perbarui informasi artikel edukasi budidaya jamur kuping' 
                : 'Tambahkan artikel edukasi baru tentang budidaya jamur kuping untuk petani dan customer'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Judul Artikel</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul artikel..."
              />
            </div>
            
            <div>
              <Label>Kategori</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Tutorial, Teknologi, Panduan"
              />
            </div>
            
            <div>
              <Label>Penulis</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nama penulis"
              />
            </div>
            
            <div>
              <Label>Ringkasan</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Ringkasan singkat artikel..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Konten Lengkap</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Isi artikel lengkap..."
                rows={6}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Gambar Artikel <span className="text-gray-500 font-normal">(Opsional)</span>
              </Label>
              
              <div className="space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                {/* File Upload */}
                <div>
                  <Label className="gap-2 select-none text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Upload className="h-4 w-4 mr-2 text-orange-600" />
                    Upload Gambar (File)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-3 text-gray-500 font-medium">atau</span>
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <Label className="gap-2 select-none text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-orange-600" />
                    Input URL Gambar
                  </Label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, imageFile: null })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {getImagePreview() && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview Gambar</Label>
                  <div className="border border-gray-300 rounded-lg p-2 bg-white">
                    <img
                      src={getImagePreview() || ''}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Gambar+Tidak+Ditemukan';
                      }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 italic">
                * Pilih salah satu: Upload file gambar ATAU input URL gambar. File upload memiliki prioritas.
              </p>
            </div>
            
            <ButtonComponent
              onClick={editingArticle ? handleEditArticle : handleAddArticle}
              className="w-full gradient-autumn-cta text-white hover-lift autumn-glow font-bold shadow-lg"
            >
              {editingArticle ? 'Simpan Perubahan' : 'Tambah Artikel'}
            </ButtonComponent>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
