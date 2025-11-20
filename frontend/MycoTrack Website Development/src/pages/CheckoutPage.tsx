import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ArrowLeft, CreditCard, Wallet, QrCode, MapPin, Package, Loader2, CheckCircle2, Building2, Smartphone } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/shared/DashboardLayout';
// QR Code component - simple dummy QR code
const DummyQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 240 }) => {
  // Create a simple QR-like pattern
  const gridSize = 25;
  const cellSize = size / gridSize;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white">
      {/* Create QR-like pattern */}
      {Array.from({ length: gridSize }).map((_, i) =>
        Array.from({ length: gridSize }).map((_, j) => {
          // Simple pattern based on position and value hash
          const hash = (i * gridSize + j + value.length) % 3;
          const isBlack = hash === 0 || (i < 3 && j < 3) || (i < 3 && j >= gridSize - 3) || 
                         (i >= gridSize - 3 && j < 3) || (i === 6 || j === 6);
          return (
            <rect
              key={`${i}-${j}`}
              x={i * cellSize}
              y={j * cellSize}
              width={cellSize}
              height={cellSize}
              fill={isBlack ? '#000000' : '#FFFFFF'}
            />
          );
        })
      )}
      {/* Add corner squares like real QR codes */}
      <rect x={0} y={0} width={cellSize * 7} height={cellSize * 7} fill="none" stroke="#000" strokeWidth={cellSize * 0.5} />
      <rect x={cellSize * 2} y={cellSize * 2} width={cellSize * 3} height={cellSize * 3} fill="#000" />
      <rect x={size - cellSize * 7} y={0} width={cellSize * 7} height={cellSize * 7} fill="none" stroke="#000" strokeWidth={cellSize * 0.5} />
      <rect x={size - cellSize * 5} y={cellSize * 2} width={cellSize * 3} height={cellSize * 3} fill="#000" />
      <rect x={0} y={size - cellSize * 7} width={cellSize * 7} height={cellSize * 7} fill="none" stroke="#000" strokeWidth={cellSize * 0.5} />
      <rect x={cellSize * 2} y={size - cellSize * 5} width={cellSize * 3} height={cellSize * 3} fill="#000" />
    </svg>
  );
};

const API_BASE_URL = 'http://localhost:3000/api';

type PaymentMethod = 'balance' | 'qris' | 'gopay' | 'ovo' | 'dana' | 'bank_transfer' | 'credit_card';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiresQR?: boolean;
  requiresAccount?: boolean;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user, updateBalance } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('balance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [countdown, setCountdown] = useState(0);

  const subtotal = getTotalPrice();
  const shippingCost = cart.length > 0 ? 15000 : 0;
  const total = subtotal + shippingCost;
  const userBalance = user?.balance || 0;
  const canPayWithBalance = userBalance >= total;

  // Payment methods configuration
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'balance',
      name: 'Saldo MycoTrack',
      icon: <Wallet className="h-5 w-5 text-[#FF7A00]" />,
      description: `Saldo Anda: Rp ${userBalance.toLocaleString('id-ID')}`,
    },
    {
      id: 'qris',
      name: 'QRIS',
      icon: <QrCode className="h-5 w-5 text-[#FF7A00]" />,
      description: 'Bayar dengan QRIS melalui aplikasi e-wallet',
      requiresQR: true,
    },
    {
      id: 'gopay',
      name: 'GoPay',
      icon: <Smartphone className="h-5 w-5 text-[#00AA13]" />,
      description: 'Bayar dengan GoPay',
      requiresQR: true,
    },
    {
      id: 'ovo',
      name: 'OVO',
      icon: <Smartphone className="h-5 w-5 text-[#4C2E87]" />,
      description: 'Bayar dengan OVO',
      requiresQR: true,
    },
    {
      id: 'dana',
      name: 'DANA',
      icon: <Smartphone className="h-5 w-5 text-[#118EEA]" />,
      description: 'Bayar dengan DANA',
      requiresQR: true,
    },
    {
      id: 'bank_transfer',
      name: 'Transfer Bank',
      icon: <Building2 className="h-5 w-5 text-[#FF7A00]" />,
      description: 'Transfer melalui bank (BCA, Mandiri, BNI, BRI)',
      requiresAccount: true,
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      icon: <CreditCard className="h-5 w-5 text-[#FF7A00]" />,
      description: 'Visa, Mastercard, JCB',
      requiresAccount: true,
    },
  ];

  // Group cart items by farmer
  const groupedByFarmer = cart.reduce((acc, item) => {
    const farmerId = item.farmerId || 'unknown';
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmerId,
        farmerName: item.farmerName || 'Unknown',
        items: []
      };
    }
    acc[farmerId].items.push(item);
    return acc;
  }, {} as Record<string, { farmerId: string; farmerName: string; items: typeof cart }>);

  // Generate QR code data
  const generateQRData = (method: PaymentMethod): string => {
    const orderId = `ORDER-${Date.now()}`;
    const qrData = {
      type: method === 'qris' ? 'QRIS' : method.toUpperCase(),
      amount: total,
      orderId,
      merchant: 'MycoTrack',
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(qrData);
  };

  // Simulate payment processing
  const simulatePayment = async (method: PaymentMethod): Promise<boolean> => {
    return new Promise((resolve) => {
      setPaymentStatus('processing');
      setCountdown(5);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPaymentStatus('success');
            setTimeout(() => resolve(true), 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Mohon isi alamat pengiriman');
      return;
    }

    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    if (paymentMethod === 'balance' && !canPayWithBalance) {
      toast.error('Saldo tidak mencukupi');
      return;
    }

    // Show payment dialog for QR/account-based methods
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (selectedMethod?.requiresQR || selectedMethod?.requiresAccount) {
      setShowPaymentDialog(true);
      return;
    }

    // Direct payment for balance
    await processPayment();
  };

  // Process payment
  const processPayment = async () => {
    setIsProcessing(true);
    setShowPaymentDialog(false);

    try {
      // Validate shipping address
      if (!shippingAddress || shippingAddress.trim() === '') {
        toast.error('Mohon isi alamat pengiriman');
        setIsProcessing(false);
        return;
      }

      // Validate cart
      if (cart.length === 0) {
        toast.error('Keranjang kosong');
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing for non-balance methods
      if (paymentMethod !== 'balance') {
        const success = await simulatePayment(paymentMethod);
        if (!success) {
          throw new Error('Pembayaran gagal');
        }
      }

      // Create orders for each farmer
      const orderPromises = Object.values(groupedByFarmer).map(async (group) => {
        const products = group.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        const orderTotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCost;

        // Validate data before sending
        if (!user?.id) {
          throw new Error('User ID tidak ditemukan');
        }
        if (!group.farmerId) {
          throw new Error('Farmer ID tidak ditemukan');
        }
        if (!products || products.length === 0) {
          throw new Error('Produk tidak ditemukan');
        }
        if (!shippingAddress || shippingAddress.trim() === '') {
          throw new Error('Alamat pengiriman wajib diisi');
        }

        const payload = {
          customerId: user.id,
          farmerId: group.farmerId,
          products: products,
          total: orderTotal,
          paymentMethod: paymentMethods.find(m => m.id === paymentMethod)?.name || paymentMethod,
          shippingAddress: shippingAddress.trim()
        };

        console.log('Creating order for farmer:', group.farmerId);
        console.log('Order payload:', JSON.stringify(payload, null, 2));
        console.log('Products array:', products);
        console.log('Products length:', products.length);
        console.log('FarmerId:', group.farmerId);
        console.log('ShippingAddress:', shippingAddress);

        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          console.error('❌ Order creation failed:');
          console.error('  Status:', response.status);
          console.error('  Error data:', errorData);
          console.error('  Received data:', errorData.received);
          
          const errorMsg = errorData.error || 'Failed to create order';
          const receivedInfo = errorData.received ? `\n\nData yang diterima backend:\n${JSON.stringify(errorData.received, null, 2)}` : '';
          throw new Error(errorMsg + receivedInfo);
        }

        return response.json();
      });

      const orderResponses = await Promise.all(orderPromises);

      // Deduct balance if using balance
      if (paymentMethod === 'balance') {
        updateBalance(-total);
      }

      // Update payment status to paid for all created orders
      // Backend returns { message, orders: [...], totalOrders }
      const allOrders: any[] = [];
      for (const response of orderResponses) {
        if (response.orders && Array.isArray(response.orders)) {
          allOrders.push(...response.orders);
        }
      }

      console.log('📦 All created orders:', allOrders.length);

      for (const order of allOrders) {
        if (!order || !order.id) {
          console.warn('⚠️ Invalid order data:', order);
          continue;
        }

        console.log(`  Updating payment status for order: ${order.id}`);

        // Update payment status
        const paymentResponse = await fetch(`${API_BASE_URL}/orders/${order.id}/payment`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus: 'paid'
          })
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`❌ Failed to update payment status for order ${order.id}:`, errorData);
          // Continue with other orders even if one fails
        } else {
          console.log(`✅ Payment status updated for order ${order.id}`);
        }

        // Create notification for farmer
        try {
          await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: order.farmerId,
              type: 'new_order',
              title: 'Pesanan Baru',
              message: `Anda mendapat pesanan baru dari ${user?.name || 'Customer'}`,
              orderId: order.id,
              read: false
            })
          });
          console.log(`✅ Notification created for farmer ${order.farmerId}`);
        } catch (notifError) {
          console.error(`❌ Failed to create notification for order ${order.id}:`, notifError);
          // Continue even if notification fails
        }
      }

      // Clear cart
      clearCart();

      toast.success('Pembayaran berhasil! Pesanan Anda sedang diproses.', { duration: 3000 });
      
      // Navigate to orders page in customer dashboard
      setTimeout(() => {
        navigate('/dashboard?page=orders', { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error(error.message || 'Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
      setPaymentStatus('idle');
    }
  };

  const sidebar = (
    <div className="space-y-1">
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[#5A4A32] hover:bg-[#FF7A00]/10 hover:text-[#B82601] hover:translate-x-1"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Kembali</span>
      </button>
    </div>
  );

  if (cart.length === 0) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="space-y-6">
          <Card className="autumn-card border-[#FF7A00]/10">
            <CardContent className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 text-[#FF7A00] opacity-50" />
              <p className="text-lg text-[#5A4A32] font-medium mb-2">
                Keranjang Anda Kosong
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-4 gradient-autumn-hero text-white"
              >
                Kembali ke Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h2 className="text-[#B82601] font-bold text-2xl">Checkout</h2>
          <p className="text-[#5A4A32] font-medium">
            Lengkapi informasi pengiriman dan pembayaran
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="autumn-card border-[#FF7A00]/10">
              <CardHeader>
                <CardTitle className="text-[#B82601] font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-[#5A4A32] font-medium">
                      Alamat Lengkap
                    </Label>
                    <Input
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Masukkan alamat pengiriman"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="autumn-card border-[#FF7A00]/10">
              <CardHeader>
                <CardTitle className="text-[#B82601] font-bold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detail Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(groupedByFarmer).map((group) => (
                    <div key={group.farmerId} className="border-b border-[#FF7A00]/10 pb-4 last:border-0 last:pb-0">
                      <p className="font-semibold text-[#FF7A00] mb-3">
                        Penjual: {group.farmerName}
                      </p>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div key={item.productId} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-[#2D2416]">{item.name}</p>
                              <p className="text-sm text-[#5A4A32]">
                                {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <p className="font-semibold text-[#FF7A00]">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="autumn-card border-[#FF7A00]/10">
              <CardHeader>
                <CardTitle className="text-[#B82601] font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const isBalance = method.id === 'balance';
                      const isDisabled = isBalance && !canPayWithBalance;
                      
                      return (
                        <div
                          key={method.id}
                          className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                            isDisabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-[#FF7A00]/20 hover:border-[#FF7A00]/40'
                          }`}
                        >
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="mt-1"
                            disabled={isDisabled}
                          />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              {method.icon}
                              <span className="font-semibold text-[#2D2416]">{method.name}</span>
                            </div>
                            <p className="text-sm text-[#5A4A32]">{method.description}</p>
                            {isBalance && !canPayWithBalance && (
                              <p className="text-xs text-red-600 mt-1">
                                Saldo tidak mencukupi
                              </p>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
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
                  onClick={handleCheckout}
                  disabled={
                    isProcessing || 
                    !shippingAddress.trim() || 
                    cart.length === 0 ||
                    (paymentMethod === 'balance' && !canPayWithBalance)
                  }
                  className="w-full gradient-autumn-hero text-white hover-lift autumn-glow-strong font-bold py-6 text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing 
                    ? 'Memproses...' 
                    : `Bayar dengan ${selectedPaymentMethod?.name || 'Metode Terpilih'}`
                  }
                </Button>
                
                <p className="text-xs text-center text-[#8B7A5E] font-medium">
                  Dengan melanjutkan, Anda menyetujui syarat & ketentuan
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#B82601]">
              Pembayaran {selectedPaymentMethod?.name}
            </DialogTitle>
            <DialogDescription className="text-[#5A4A32]">
              {selectedPaymentMethod?.requiresQR 
                ? 'Scan QR Code untuk membayar'
                : 'Lengkapi informasi pembayaran'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {paymentStatus === 'idle' && (
              <>
                {selectedPaymentMethod?.requiresQR && (
                  <div className="text-center">
                    <div className="w-64 h-64 mx-auto bg-white rounded-lg p-4 mb-4 border-2 border-gray-200 flex items-center justify-center">
                      <DummyQRCode
                        value={generateQRData(paymentMethod)}
                        size={240}
                      />
                    </div>
                    <p className="text-2xl font-bold text-gradient-fire mb-2">
                      Rp {total.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-[#5A4A32] mb-4">
                      Gunakan aplikasi e-wallet Anda untuk scan QR code di atas
                    </p>
                  </div>
                )}

                {selectedPaymentMethod?.requiresAccount && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#5A4A32] font-medium">Nomor Rekening / Kartu</Label>
                      <Input
                        placeholder={paymentMethod === 'credit_card' ? '1234 5678 9012 3456' : '1234567890'}
                        className="mt-2"
                      />
                    </div>
                    {paymentMethod === 'credit_card' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-[#5A4A32] font-medium">CVV</Label>
                            <Input placeholder="123" className="mt-2" type="password" />
                          </div>
                          <div>
                            <Label className="text-[#5A4A32] font-medium">Expiry</Label>
                            <Input placeholder="MM/YY" className="mt-2" />
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <Label className="text-[#5A4A32] font-medium">Nama Pemegang</Label>
                      <Input placeholder="Nama sesuai rekening/kartu" className="mt-2" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentDialog(false);
                      setPaymentStatus('idle');
                    }}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="flex-1 gradient-autumn-hero text-white"
                  >
                    {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                  </Button>
                </div>
              </>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="h-16 w-16 mx-auto mb-4 text-[#FF7A00] animate-spin" />
                <p className="text-lg font-semibold text-[#2D2416] mb-2">
                  Memproses pembayaran...
                </p>
                {countdown > 0 && (
                  <p className="text-sm text-[#5A4A32]">
                    Mohon tunggu {countdown} detik
                  </p>
                )}
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-semibold text-[#2D2416] mb-2">
                  Pembayaran Berhasil!
                </p>
                <p className="text-sm text-[#5A4A32]">
                  Pesanan Anda sedang diproses
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center py-8">
                <p className="text-lg font-semibold text-red-600 mb-2">
                  Pembayaran Gagal
                </p>
                <p className="text-sm text-[#5A4A32] mb-4">
                  Silakan coba lagi atau pilih metode pembayaran lain
                </p>
                <Button
                  onClick={() => {
                    setPaymentStatus('idle');
                    setShowPaymentDialog(false);
                  }}
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
