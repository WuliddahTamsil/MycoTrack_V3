import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockProducts } from '../mockData';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

export const FarmerProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState(mockProducts.filter(p => p.farmerId === user?.id || p.farmerId === 'f1'));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: 'Segar'
  });

  const handleAddProduct = () => {
    // In real app, would call API
    const newProduct = {
      id: `p${Date.now()}`,
      farmerId: user?.id || 'f1',
      farmerName: user?.name || 'Petani',
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      stock: parseFloat(formData.stock) || 0,
      unit: formData.unit,
      image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
      category: formData.category
    };
    
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Produk berhasil ditambahkan');
  };

  const handleEditProduct = () => {
    // In real app, would call API
    setProducts(products.map(p => 
      p.id === editingProduct 
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price) || 0,
            stock: parseFloat(formData.stock) || 0,
            unit: formData.unit,
            category: formData.category
          }
        : p
    ));
    setEditingProduct(null);
    resetForm();
    toast.success('Produk berhasil diperbarui');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Produk berhasil dihapus');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      unit: 'kg',
      category: 'Segar'
    });
  };

  const openEditDialog = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
      category: product.category
    });
    setEditingProduct(product.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: 'var(--secondary-dark-red)' }}>Manajemen Produk</h2>
          <p style={{ color: 'var(--neutral-gray)' }}>
            Kelola produk jamur kuping Anda di marketplace
          </p>
        </div>
        
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="gradient-red-fire text-white hover-lift autumn-glow-strong font-bold shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs" style={{ 
                      backgroundColor: 'var(--primary-gold)', 
                      color: 'white' 
                    }}>
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || editingProduct !== null} onOpenChange={() => {
        setIsAddDialogOpen(false);
        setEditingProduct(null);
        resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Perbarui informasi produk jamur kuping Anda' : 'Masukkan detail produk jamur kuping untuk ditambahkan ke marketplace'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Produk</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Jamur Kuping Segar Premium"
              />
            </div>
            
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi produk..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga (Rp)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="45000"
                />
              </div>
              
              <div>
                <Label>Stok</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg"
                />
              </div>
              
              <div>
                <Label>Kategori</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Segar"
                />
              </div>
            </div>
            
            <Button
              onClick={editingProduct ? handleEditProduct : handleAddProduct}
              className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
            >
              {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
