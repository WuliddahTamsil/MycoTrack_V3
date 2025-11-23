import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ShoppingCart, Search, Loader2, Headphones } from 'lucide-react';
import { useCart } from '../CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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

interface CustomerMarketplaceProps {
  onNavigateToCustomerService?: () => void;
}

export const CustomerMarketplace: React.FC<CustomerMarketplaceProps> = ({ onNavigateToCustomerService }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Check backend health first
        const healthCheck = await fetch('http://localhost:3000/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => null);
        
        if (!healthCheck || !healthCheck.ok) {
          toast.error(
            '⚠️ Backend tidak berjalan!\n\n' +
            'Cara menjalankan backend:\n' +
            '1. Buka terminal baru\n' +
            '2. cd "D:\\RPL_Kelompok 4 - NOVA\\backend"\n' +
            '3. npm start\n\n' +
            'ATAU double-click file:\n' +
            'START_BACKEND.bat di folder backend',
            { duration: 10000 }
          );
          setProducts([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Gagal memuat produk');
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Gagal memuat produk dari marketplace. Pastikan backend berjalan.', { duration: 5000 });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      image: product.image,
      unit: product.unit,
    });
    
    toast.success(`${product.name} ditambahkan ke keranjang! 🛒`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#B82601] font-bold">Marketplace Jamur Kuping</h2>
          <p className="text-[#5A4A32] font-medium">
            Beli jamur kuping berkualitas langsung dari petani
          </p>
        </div>
        {onNavigateToCustomerService && (
          <Button
            onClick={onNavigateToCustomerService}
            variant="outline"
            className="border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
          >
            <Headphones className="h-4 w-4 mr-2" />
            Chat Customer Service
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF7A00]" />
        <Input
          placeholder="Cari produk jamur kuping..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00] mr-3" />
          <p className="text-[#5A4A32] font-medium">Memuat produk...</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
          <Card key={product.id} className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden">
            <div className="relative overflow-hidden group">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#B82601]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className="gradient-autumn-cta text-white font-semibold border-0">
                  {product.category}
                </Badge>
                <Badge variant="outline" className="border-[#FF7A00] text-[#FF7A00] font-semibold">
                  Stok: {product.stock}
                </Badge>
              </div>
              <CardTitle className="line-clamp-2 text-[#B82601] font-bold">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 line-clamp-2 text-[#5A4A32] font-medium">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-[#5A4A32] font-medium">Harga</p>
                  <p className="text-xl font-bold text-gradient-fire">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#5A4A32] font-semibold">Per {product.unit}</p>
                </div>
              </div>
              <p className="text-xs text-[#FF7A00] font-semibold">
                Penjual: {product.farmerName}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full gradient-autumn-cta text-white hover-lift autumn-shadow font-bold"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Stok Habis' : 'Masukkan ke Keranjang'}
              </Button>
            </CardFooter>
          </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-12 autumn-card rounded-2xl">
          {products.length === 0 ? (
            <>
              <p className="text-[#5A4A32] font-medium text-lg mb-2">
                Belum ada produk di marketplace
              </p>
              <p className="text-[#5A4A32] text-sm">
                Produk akan muncul setelah petani menambahkan produk mereka
              </p>
            </>
          ) : (
            <p className="text-[#5A4A32] font-medium">
              Tidak ada produk yang cocok dengan pencarian Anda
            </p>
          )}
        </div>
      )}
    </div>
  );
};
