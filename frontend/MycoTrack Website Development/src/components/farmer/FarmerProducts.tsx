import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

// Type assertion untuk Button component
const ButtonComponent = Button as any;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3000/api';

interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  image: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const FarmerProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([] as Product[]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null as string | null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null as { id: string; name: string } | null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: 'Segar',
    imageUrl: '',
    imageFile: null as File | null
  });

  // Health check function
  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        console.error('User ID tidak ditemukan');
        return;
      }

      // Check backend health first
      const isBackendRunning = await checkBackendHealth();
      if (!isBackendRunning) {
        const errorMsg = (
          '⚠️ Backend tidak berjalan!\n\n' +
          'Cara menjalankan backend:\n' +
          '1. Buka terminal baru\n' +
          '2. cd "D:\\RPL_Kelompok 4 - NOVA\\backend"\n' +
          '3. npm start\n\n' +
          'ATAU double-click file:\n' +
          'START_BACKEND.bat di folder backend'
        );
        toast.error(errorMsg, { duration: 10000 });
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const url = `${API_URL}/petani/products?farmerId=${user.id}`;
      console.log('Fetching products from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint tidak ditemukan. Pastikan backend berjalan di http://localhost:3000 dan endpoint /api/petani/products tersedia.');
        }
        const errorText = await response.text();
        let errorMessage = 'Gagal memuat produk';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      let errorMessage = 'Gagal memuat produk';
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Endpoint') || error.name === 'AbortError') {
          errorMessage = 'Backend tidak berjalan! Silakan jalankan backend terlebih dahulu.';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Gagal memuat produk. Pastikan backend berjalan di http://localhost:3000';
      }
      toast.error(errorMessage, { duration: 8000 });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch products from API
  useEffect(() => {
    if (user?.id) {
      fetchProducts();
    }
  }, [user?.id, fetchProducts]);

  const handleAddProduct = async (e?: any) => {
    // Prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setIsLoading(true);

      // Check backend health first
      const isBackendRunning = await checkBackendHealth();
      if (!isBackendRunning) {
        toast.error(
          'Backend tidak berjalan! Silakan jalankan backend terlebih dahulu:\n\n' +
          '1. Buka terminal baru\n' +
          '2. cd "D:\\RPL_Kelompok 4 - NOVA\\backend"\n' +
          '3. npm start\n\n' +
          'Atau double-click START_BACKEND.bat di folder backend',
          { duration: 8000 }
        );
        setIsLoading(false);
        return;
      }
      
      // Validation - Check all required fields
      const trimmedName = formData.name?.trim() || '';
      const trimmedDescription = formData.description?.trim() || '';
      const priceValue = formData.price?.toString().trim() || '';
      const stockValue = formData.stock?.toString().trim() || '';
      const trimmedUnit = formData.unit?.trim() || '';
      const trimmedCategory = formData.category?.trim() || '';

      if (!trimmedName) {
        toast.error('Nama produk wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!trimmedDescription) {
        toast.error('Deskripsi produk wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!priceValue || isNaN(Number(priceValue)) || Number(priceValue) <= 0) {
        toast.error('Harga harus berupa angka yang valid dan lebih dari 0');
        setIsLoading(false);
        return;
      }

      if (!stockValue || isNaN(Number(stockValue)) || Number(stockValue) <= 0) {
        toast.error('Stok harus berupa angka yang valid dan lebih dari 0');
        setIsLoading(false);
        return;
      }

      if (!trimmedUnit) {
        toast.error('Unit wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!trimmedCategory) {
        toast.error('Kategori wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        toast.error('User ID tidak ditemukan. Silakan login ulang.');
        setIsLoading(false);
        return;
      }

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('farmerId', user.id);
      formDataToSend.append('name', trimmedName);
      formDataToSend.append('description', trimmedDescription);
      formDataToSend.append('price', priceValue);
      formDataToSend.append('stock', stockValue);
      formDataToSend.append('unit', trimmedUnit);
      formDataToSend.append('category', trimmedCategory);
      
      // Add image (file upload takes priority over URL)
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
        console.log('Uploading image file:', formData.imageFile.name);
      } else if (formData.imageUrl && formData.imageUrl.trim()) {
        formDataToSend.append('imageUrl', formData.imageUrl.trim());
        console.log('Using image URL:', formData.imageUrl.trim());
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, `(${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const url = `${API_URL}/petani/products`;
      console.log('Creating product at:', url);
      console.log('User ID:', user.id);
      
      const response = await fetch(url, {
        method: 'POST',
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
        body: formDataToSend
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('Endpoint tidak ditemukan. Pastikan backend berjalan di http://localhost:3000 dan endpoint POST /api/petani/products tersedia.');
        }
        
        let errorMessage = 'Gagal menambahkan produk';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Product created successfully:', data);
      
      toast.success('Produk berhasil ditambahkan!', { duration: 3000 });
      
      // Close dialog and reset form
    setIsAddDialogOpen(false);
    resetForm();
      
      // Refresh products list after a short delay to ensure backend has processed
      setTimeout(() => {
        fetchProducts();
      }, 500);
      
    } catch (error) {
      console.error('Error adding product:', error);
      let errorMessage = 'Gagal menambahkan produk';
      
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Endpoint')) {
          errorMessage = 'Backend tidak berjalan atau endpoint tidak ditemukan. Pastikan backend berjalan di http://localhost:3000';
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3000';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Gagal menambahkan produk. Pastikan backend berjalan di http://localhost:3000';
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (e?: any) => {
    // Prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setIsLoading(true);
      
      if (!editingProduct) {
        toast.error('Produk yang akan diedit tidak ditemukan');
        setIsLoading(false);
        return;
      }

      // Validation - Check all required fields
      const trimmedName = formData.name?.trim() || '';
      const trimmedDescription = formData.description?.trim() || '';
      const priceValue = formData.price?.toString().trim() || '';
      const stockValue = formData.stock?.toString().trim() || '';
      const trimmedUnit = formData.unit?.trim() || '';
      const trimmedCategory = formData.category?.trim() || '';

      if (!trimmedName) {
        toast.error('Nama produk wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!trimmedDescription) {
        toast.error('Deskripsi produk wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!priceValue || isNaN(Number(priceValue)) || Number(priceValue) <= 0) {
        toast.error('Harga harus berupa angka yang valid dan lebih dari 0');
        setIsLoading(false);
        return;
      }

      if (!stockValue || isNaN(Number(stockValue)) || Number(stockValue) <= 0) {
        toast.error('Stok harus berupa angka yang valid dan lebih dari 0');
        setIsLoading(false);
        return;
      }

      if (!trimmedUnit) {
        toast.error('Unit wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!trimmedCategory) {
        toast.error('Kategori wajib diisi');
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        toast.error('User ID tidak ditemukan. Silakan login ulang.');
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('farmerId', user.id);
      formDataToSend.append('name', trimmedName);
      formDataToSend.append('description', trimmedDescription);
      formDataToSend.append('price', priceValue);
      formDataToSend.append('stock', stockValue);
      formDataToSend.append('unit', trimmedUnit);
      formDataToSend.append('category', trimmedCategory);
      
      // Add image (file upload takes priority over URL)
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
        console.log('Uploading image file:', formData.imageFile.name);
      } else if (formData.imageUrl && formData.imageUrl.trim()) {
        formDataToSend.append('imageUrl', formData.imageUrl.trim());
        console.log('Using image URL:', formData.imageUrl.trim());
      }

      console.log('Updating product:', editingProduct);

      const response = await fetch(`${API_URL}/petani/products/${editingProduct}`, {
        method: 'PUT',
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
        body: formDataToSend
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = 'Gagal memperbarui produk';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Product updated successfully:', data);
      
      toast.success('Produk berhasil diperbarui!', { duration: 3000 });
      
    setEditingProduct(null);
    resetForm();
      
      // Refresh products list after a short delay
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (error) {
      console.error('Error updating product:', error);
      let errorMessage = 'Gagal memperbarui produk';
      
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Endpoint')) {
          errorMessage = 'Backend tidak berjalan atau endpoint tidak ditemukan. Pastikan backend berjalan di http://localhost:3000';
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:3000';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Gagal memperbarui produk. Pastikan backend berjalan di http://localhost:3000';
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete({ id: product.id, name: product.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsLoading(true);
      
      if (!user?.id) {
        toast.error('User ID tidak ditemukan. Silakan login ulang.');
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/petani/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId: user.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Gagal menghapus produk';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success('Produk berhasil dihapus!', { duration: 3000 });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      
      // Refresh products list after a short delay
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus produk. Pastikan backend berjalan di http://localhost:3000';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      unit: 'kg',
      category: 'Segar',
      imageUrl: '',
      imageFile: null
    });
  };

  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price.toString() || '',
      stock: product.stock.toString() || '',
      unit: product.unit || 'kg',
      category: product.category || 'Segar',
      imageUrl: product.image || '',
      imageFile: null
    });
    setEditingProduct(product.id);
  };

  const handleImageFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0], imageUrl: '' });
    }
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
        
        <ButtonComponent
          onClick={() => setIsAddDialogOpen(true)}
          className="gradient-red-fire text-white hover-lift autumn-glow-strong font-bold shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk Baru
        </ButtonComponent>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-800">Daftar Produk Anda</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Belum ada produk</p>
              <p className="text-gray-500 text-sm">
                Klik "Tambah Produk Baru" untuk menambahkan produk pertama Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
          <Table>
            <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold text-gray-700">Gambar</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nama Produk</TableHead>
                    <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
                    <TableHead className="font-semibold text-gray-700">Harga</TableHead>
                    <TableHead className="font-semibold text-gray-700">Stok</TableHead>
                    <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {products.map((product, index) => (
                    <TableRow 
                      key={product.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                  <TableCell>
                        {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                    />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                  </TableCell>
                      <TableCell className="font-semibold text-gray-800">{product.name}</TableCell>
                  <TableCell>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      {product.category}
                    </span>
                  </TableCell>
                      <TableCell className="font-semibold text-gray-800">
                        Rp {product.price.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-gray-700">{product.stock}</TableCell>
                      <TableCell className="text-gray-700">{product.unit}</TableCell>
                  <TableCell>
                        <div className="flex gap-2 justify-center">
                          <ButtonComponent
                            variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                            title="Edit"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                      >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </ButtonComponent>
                          <ButtonComponent
                            variant="outline"
                        size="sm"
                            onClick={() => openDeleteDialog(product)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                            title="Hapus"
                      >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </ButtonComponent>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || editingProduct !== null} onOpenChange={() => {
        setIsAddDialogOpen(false);
        setEditingProduct(null);
        resetForm();
      }}>
        <DialogContent className="!grid-cols-1 !grid-rows-none w-[98vw] sm:w-[90vw] max-w-3xl max-h-[85vh] bg-white p-0 flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 border-b pb-3 px-4 sm:px-6 pt-4 sm:pt-5 bg-white shadow-sm">
          <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1">
              {editingProduct ? 'Perbarui informasi produk jamur kuping Anda' : 'Masukkan detail produk jamur kuping untuk ditambahkan ke marketplace'}
            </DialogDescription>
          </DialogHeader>
          </div>
          
          {/* Content - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 min-h-0 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#fdba74 #f3f4f6',
              maxHeight: 'calc(85vh - 200px)' // Sesuaikan dengan max-height dialog baru
            }}
          >
            <style>{`
              div[style*="scrollbarWidth"]::-webkit-scrollbar {
                width: 10px;
              }
              div[style*="scrollbarWidth"]::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 5px;
              }
              div[style*="scrollbarWidth"]::-webkit-scrollbar-thumb {
                background-color: #fdba74;
                border-radius: 5px;
                border: 2px solid #f3f4f6;
              }
              div[style*="scrollbarWidth"]::-webkit-scrollbar-thumb:hover {
                background-color: #fbbf24;
              }
            `}</style>
            <div className="space-y-3 sm:space-y-4 pb-6">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Nama Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Jamur Kuping Segar Premium"
                className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi produk..."
                rows={4}
                className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            {/* Harga, Stok, Unit - Grid 3 Kolom */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Harga (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="45000"
                  className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Stok <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="50"
                  className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
            </div>
            
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg"
                  className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            
            {/* Kategori - Dropdown */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-9">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="Segar">Segar</SelectItem>
                  <SelectItem value="Kering">Kering</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Organik">Organik</SelectItem>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Bubuk">Bubuk</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Gambar Produk <span className="text-gray-500 font-normal">(Opsional)</span>
              </Label>
              <div className="space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                {/* File Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Upload className="h-4 w-4 mr-2 text-orange-600" />
                    Upload Gambar (File)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                    />
                    {formData.imageFile && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        ✓ File terpilih: {formData.imageFile.name}
                      </p>
                    )}
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
                  <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-orange-600" />
                    Input URL Gambar
                  </Label>
                <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, imageFile: null })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Preview current image if editing */}
                {editingProduct && formData.imageUrl && !formData.imageFile && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Gambar Saat Ini:</Label>
                    <img 
                      src={formData.imageUrl} 
                      alt="Current" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 italic">
                * Pilih salah satu: Upload file gambar ATAU input URL gambar. File upload memiliki prioritas.
              </p>
            </div>
            </div>
          </div>
          
          {/* Footer - Fixed */}
          <div className="flex-shrink-0 border-t bg-gray-50 pt-3 pb-3 sm:pb-4 px-4 sm:px-6 shadow-inner">
            <div className="grid grid-cols-2 gap-3">
              <ButtonComponent
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="w-full border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 py-2.5 font-semibold transition-all"
              >
                Batal
              </ButtonComponent>
              <ButtonComponent
                type="button"
                onClick={(e) => {
                  if (editingProduct) {
                    handleEditProduct(e);
                  } else {
                    handleAddProduct(e);
                  }
                }}
                className="w-full !bg-orange-500 hover:!bg-orange-400 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 py-2.5 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
                    Memproses...
                  </span>
                ) : (
                  editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'
                )}
              </ButtonComponent>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white p-0 overflow-hidden">
          <div className="flex flex-col items-center text-center p-6 sm:p-8">
            {/* Warning Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            {/* Title */}
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Hapus Produk?
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="text-sm sm:text-base text-gray-600 mb-1">
              Apakah Anda yakin ingin menghapus produk ini?
            </DialogDescription>
            
            {/* Product Name */}
            {productToDelete && (
              <div className="mt-3 mb-6 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 w-full">
                <p className="text-sm font-medium text-gray-500 mb-1">Produk yang akan dihapus:</p>
                <p className="text-base font-semibold text-gray-900 break-words">
                  {productToDelete.name}
                </p>
              </div>
            )}

            <p className="text-xs sm:text-sm text-red-600 font-medium mb-6">
              ⚠️ Tindakan ini tidak dapat dibatalkan!
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <ButtonComponent
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProductToDelete(null);
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-2.5 transition-all"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </ButtonComponent>
              <ButtonComponent
                onClick={handleDeleteProduct}
                className="flex-1 !bg-orange-500 hover:!bg-orange-400 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 py-2.5 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Menghapus...
                  </span>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ya, Hapus
                  </>
                )}
              </ButtonComponent>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
