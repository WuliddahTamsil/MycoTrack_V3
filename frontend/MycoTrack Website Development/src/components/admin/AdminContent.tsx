import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockArticles } from '../mockData';
import { toast } from 'sonner@2.0.3';

export const AdminContent: React.FC = () => {
  const [articles, setArticles] = useState(mockArticles);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: ''
  });

  const handleAddArticle = () => {
    const newArticle = {
      id: `a${Date.now()}`,
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      image: 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400',
      author: formData.author,
      date: new Date().toISOString().split('T')[0],
      category: formData.category
    };
    
    setArticles([newArticle, ...articles]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Artikel berhasil ditambahkan');
  };

  const handleEditArticle = () => {
    setArticles(articles.map(a =>
      a.id === editingArticle
        ? {
            ...a,
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            author: formData.author,
            category: formData.category
          }
        : a
    ));
    setEditingArticle(null);
    resetForm();
    toast.success('Artikel berhasil diperbarui');
  };

  const handleDeleteArticle = (articleId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      setArticles(articles.filter(a => a.id !== articleId));
      toast.success('Artikel berhasil dihapus');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      category: ''
    });
  };

  const openEditDialog = (article: any) => {
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category
    });
    setEditingArticle(article.id);
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
        
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="gradient-autumn-cta text-white hover-lift autumn-glow font-bold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2">{article.title}</p>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs" style={{ 
                      backgroundColor: 'var(--primary-gold)', 
                      color: 'white' 
                    }}>
                      {article.category}
                    </span>
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>
                    {new Date(article.date).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(article)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            
            <Button
              onClick={editingArticle ? handleEditArticle : handleAddArticle}
              className="w-full gradient-autumn-cta text-white hover-lift autumn-glow font-bold shadow-lg"
            >
              {editingArticle ? 'Simpan Perubahan' : 'Tambah Artikel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
