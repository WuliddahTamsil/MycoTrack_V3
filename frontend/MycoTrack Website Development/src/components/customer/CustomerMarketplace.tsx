import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ShoppingCart, Search } from 'lucide-react';
import { mockProducts } from '../mockData';
import { useCart } from '../CartContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export const CustomerMarketplace: React.FC = () => {
  const [products] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: typeof mockProducts[0]) => {
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
      <div>
        <h2 className="text-[#B82601] font-bold">Marketplace Jamur Kuping</h2>
        <p className="text-[#5A4A32] font-medium">
          Beli jamur kuping berkualitas langsung dari petani
        </p>
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

      {/* Products Grid */}
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 autumn-card rounded-2xl">
          <p className="text-[#5A4A32] font-medium">
            Tidak ada produk yang cocok dengan pencarian Anda
          </p>
        </div>
      )}
    </div>
  );
};
