import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, Plus, Minus, ShoppingBag, Headphones } from 'lucide-react';
import { useCart } from '../CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CustomerCartProps {
  onNavigateToCheckout: () => void;
  onNavigateToCustomerService?: () => void;
}

export const CustomerCart: React.FC<CustomerCartProps> = ({ onNavigateToCheckout, onNavigateToCustomerService }) => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} dihapus dari keranjang`);
  };

  const handleUpdateQuantity = (productId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const subtotal = getTotalPrice();
  const shippingCost = cart.length > 0 ? 15000 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#B82601] font-bold">Keranjang Belanja</h2>
          <p className="text-[#5A4A32] font-medium">
            {getTotalItems()} item dalam keranjang Anda
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

      {cart.length === 0 ? (
        <Card className="autumn-card border-[#FF7A00]/10">
          <CardContent className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-[#FF7A00] opacity-50" />
            <p className="text-lg text-[#5A4A32] font-medium mb-2">
              Keranjang Anda Kosong
            </p>
            <p className="text-sm text-[#8B7A5E]">
              Mulai belanja jamur kuping segar dari marketplace
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.productId} className="autumn-card autumn-card-hover border-[#FF7A00]/10">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-[#FF7A00]/10">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[#B82601] mb-1">{item.name}</h3>
                          <p className="text-sm text-[#FF7A00] font-semibold">
                            Penjual: {item.farmerName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId, item.name)}
                          className="text-[#B82601] hover:text-white hover:bg-[#B82601] rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                            className="h-8 w-8 p-0 border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white font-bold"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-[#2D2416]">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                            className="h-8 w-8 p-0 border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white font-bold"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gradient-fire">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-[#5A4A32] font-medium">
                            Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="autumn-card border-[#FF7A00]/10 sticky top-6">
              <CardHeader>
                <CardTitle className="text-[#B82601] font-bold">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-[#5A4A32] font-medium">
                    <span>Subtotal ({getTotalItems()} item)</span>
                    <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[#5A4A32] font-medium">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t-2 border-[#FF7A00]/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#B82601]">Total</span>
                      <span className="text-2xl font-bold text-gradient-fire">
                        Rp {total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={onNavigateToCheckout}
                  className="w-full gradient-autumn-hero text-white hover-lift autumn-glow-strong font-bold py-6 text-lg shadow-xl"
                >
                  Checkout Sekarang
                </Button>
                
                <p className="text-xs text-center text-[#8B7A5E] font-medium">
                  Dengan melanjutkan, Anda menyetujui syarat & ketentuan
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
