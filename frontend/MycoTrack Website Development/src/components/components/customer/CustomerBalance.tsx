import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Wallet, Plus, ArrowUpDown, ArrowDown, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Transaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  orderId?: string;
  paymentMethod?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export const CustomerBalance: React.FC = () => {
  const { user, updateBalance, refreshBalance } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isQRISDialogOpen, setIsQRISDialogOpen] = useState(false);
  
  const [topUpForm, setTopUpForm] = useState({
    amount: '',
    method: 'qris'
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
      refreshBalance();
    }
  }, [user?.id]);

  // Refresh balance when component is focused (user navigates to this page)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        refreshBalance();
        fetchTransactions();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user/transactions?userId=${user?.id}&userType=customer`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched transactions:', data);
        setTransactions(data.transactions || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch transactions:', errorData);
        toast.error('Gagal memuat riwayat transaksi');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleTopUp = async () => {
    const amount = parseFloat(topUpForm.amount);
    if (amount <= 0) {
      toast.error('Jumlah top up tidak valid');
      return;
    }
    
    if (topUpForm.method === 'qris') {
      setIsQRISDialogOpen(true);
      setIsTopUpDialogOpen(false);
    } else {
      // Direct top up (non-QRIS)
      try {
        const response = await fetch(`${API_BASE_URL}/user/topup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            userType: 'customer',
            amount: amount,
            paymentMethod: topUpForm.method
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Top up gagal');
        }

        const result = await response.json();
        await refreshBalance();
        await fetchTransactions();
        setIsTopUpDialogOpen(false);
        setTopUpForm({ amount: '', method: 'qris' });
        toast.success(`Top up Rp ${amount.toLocaleString('id-ID')} berhasil! 💰`);
      } catch (error: any) {
        toast.error(error.message || 'Top up gagal');
      }
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawForm.amount);
    if (amount <= 0) {
      toast.error('Jumlah penarikan tidak valid');
      return;
    }
    
    if (amount > (user?.balance || 0)) {
      toast.error('Saldo tidak mencukupi');
      return;
    }

    if (!withdrawForm.bankName || !withdrawForm.accountNumber || !withdrawForm.accountName) {
      toast.error('Mohon lengkapi data rekening');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userType: 'customer',
          amount: amount,
          bankName: withdrawForm.bankName,
          accountNumber: withdrawForm.accountNumber,
          accountName: withdrawForm.accountName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Penarikan gagal');
      }

      const result = await response.json();
      await refreshBalance();
      await fetchTransactions();
      setIsWithdrawDialogOpen(false);
      setWithdrawForm({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      toast.success(`Penarikan Rp ${amount.toLocaleString('id-ID')} berhasil diproses! 💸`);
    } catch (error: any) {
      toast.error(error.message || 'Penarikan gagal');
    }
  };

  const handleQRISPayment = async () => {
    const amount = parseFloat(topUpForm.amount);
    try {
      const response = await fetch(`${API_BASE_URL}/user/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userType: 'customer',
          amount: amount,
          paymentMethod: 'QRIS'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Pembayaran QRIS gagal');
      }

      const result = await response.json();
      await refreshBalance();
      await fetchTransactions();
      setIsQRISDialogOpen(false);
      setTopUpForm({ amount: '', method: 'qris' });
      toast.success('Pembayaran QRIS berhasil! 🎉');
    } catch (error: any) {
      toast.error(error.message || 'Pembayaran QRIS gagal');
    }
  };

  const getTypeLabel = (transaction: Transaction) => {
    if (transaction.type === 'credit') {
      if (transaction.description?.includes('Top up')) {
        return 'Top Up';
      }
      return 'Kredit';
    } else {
      if (transaction.description?.includes('Penarikan')) {
        return 'Penarikan';
      }
      if (transaction.description?.includes('Pembayaran')) {
        return 'Pembelian';
      }
      return 'Debit';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#B82601] font-bold">Saldo MycoTrack</h2>
        <p className="text-[#5A4A32] font-medium">
          Kelola saldo dan riwayat transaksi Anda
        </p>
      </div>

      {/* Balance Card */}
      <Card className="autumn-card border-2 border-[#FF7A00] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF7A00]/10 to-transparent rounded-full blur-3xl"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm mb-2 text-[#5A4A32] font-medium">
                Saldo Anda Saat Ini
              </p>
              <h2 className="text-5xl font-bold text-gradient-fire">
                Rp {(user?.balance || 0).toLocaleString('id-ID')}
              </h2>
            </div>
            <div className="w-20 h-20 rounded-2xl gradient-autumn-hero flex items-center justify-center autumn-glow">
              <Wallet className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setIsTopUpDialogOpen(true)}
              className="gradient-orange-warm text-white hover-lift autumn-shadow font-bold shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Top Up Saldo
            </Button>
            <Button
              onClick={() => setIsWithdrawDialogOpen(true)}
              className="gradient-yellow-gold text-white hover-lift autumn-shadow font-bold shadow-lg"
            >
              <ArrowDown className="h-5 w-5 mr-2" />
              Tarik Saldo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="autumn-card border-[#FF7A00]/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#B82601] font-bold">Riwayat Transaksi</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10 font-semibold"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Urutkan ({sortOrder === 'asc' ? 'Terlama' : 'Terbaru'})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#FF7A00]/20">
                  <TableHead className="text-[#B82601] font-bold">Tanggal</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Tipe</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Deskripsi</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Jumlah</TableHead>
                  <TableHead className="text-[#B82601] font-bold">Sisa Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#FF7A00] mx-auto" />
                      <p className="text-gray-500 mt-2">Memuat transaksi...</p>
                    </TableCell>
                  </TableRow>
                ) : sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Belum ada transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-[#FF7A00]/10">
                      <TableCell className="text-[#5A4A32] font-medium">
                        {new Date(transaction.timestamp).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                          transaction.type === 'credit' ? 'gradient-orange-warm' : 'gradient-red-fire'
                        }`}>
                        {getTypeLabel(transaction)}
                      </span>
                      </TableCell>
                      <TableCell className="text-[#2D2416] font-medium">{transaction.description}</TableCell>
                      <TableCell className={`font-bold ${transaction.type === 'credit' ? 'text-[#9A7400]' : 'text-[#B82601]'}`}>
                        {transaction.type === 'credit' ? '+' : ''}Rp {Math.abs(transaction.amount).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-[#FF7A00] font-semibold">
                        Rp {transaction.balanceAfter.toLocaleString('id-ID')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
        <DialogContent className="autumn-card border-[#FF7A00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#B82601] font-bold text-xl">Top Up Saldo</DialogTitle>
            <DialogDescription className="text-[#5A4A32] font-medium">
              Isi saldo MycoTrack Anda untuk bertransaksi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#2D2416] font-semibold">Jumlah Top Up (Rp)</Label>
              <Input
                type="number"
                value={topUpForm.amount}
                onChange={(e) => setTopUpForm({ ...topUpForm, amount: e.target.value })}
                placeholder="100000"
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
              />
            </div>
            
            <div>
              <Label className="text-[#2D2416] font-semibold">Metode Pembayaran</Label>
              <Select
                value={topUpForm.method}
                onValueChange={(value) => setTopUpForm({ ...topUpForm, method: value })}
              >
                <SelectTrigger className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#FF7A00]/20">
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="gopay">GoPay</SelectItem>
                  <SelectItem value="ovo">OVO</SelectItem>
                  <SelectItem value="dana">DANA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleTopUp}
              className="w-full gradient-autumn-cta text-white hover-lift autumn-glow font-bold shadow-lg"
            >
              Lanjutkan Pembayaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="autumn-card border-[#FF7A00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#B82601] font-bold text-xl">Tarik Saldo</DialogTitle>
            <DialogDescription className="text-[#5A4A32] font-medium">
              Tarik saldo MycoTrack ke rekening bank Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="autumn-card p-4 rounded-xl border border-[#FF7A00]/20">
              <p className="text-sm text-[#5A4A32] font-medium mb-1">Saldo Tersedia</p>
              <p className="text-2xl font-bold text-gradient-fire">
                Rp {(user?.balance || 0).toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              <Label className="text-[#2D2416] font-semibold">Jumlah Penarikan (Rp)</Label>
              <Input
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                placeholder="50000"
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
              />
            </div>

            <div>
              <Label className="text-[#2D2416] font-semibold">Nama Bank</Label>
              <Select
                value={withdrawForm.bankName}
                onValueChange={(value) => setWithdrawForm({ ...withdrawForm, bankName: value })}
              >
                <SelectTrigger className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20">
                  <SelectValue placeholder="Pilih Bank" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#FF7A00]/20">
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="Mandiri">Mandiri</SelectItem>
                  <SelectItem value="BNI">BNI</SelectItem>
                  <SelectItem value="BRI">BRI</SelectItem>
                  <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#2D2416] font-semibold">Nomor Rekening</Label>
              <Input
                type="text"
                value={withdrawForm.accountNumber}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                placeholder="1234567890"
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
              />
            </div>

            <div>
              <Label className="text-[#2D2416] font-semibold">Nama Pemilik Rekening</Label>
              <Input
                type="text"
                value={withdrawForm.accountName}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                placeholder="Nama sesuai rekening"
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] font-medium"
              />
            </div>
            
            <Button
              onClick={handleWithdraw}
              className="w-full gradient-yellow-gold text-white hover-lift autumn-glow font-bold shadow-lg"
            >
              Proses Penarikan
            </Button>

            <p className="text-xs text-center text-[#8B7A5E] font-medium">
              Penarikan akan diproses dalam 1-2 hari kerja
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* QRIS Payment Dialog */}
      <Dialog open={isQRISDialogOpen} onOpenChange={setIsQRISDialogOpen}>
        <DialogContent className="autumn-card border-[#FF7A00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#B82601] font-bold text-xl">Pembayaran QRIS</DialogTitle>
            <DialogDescription className="text-[#5A4A32] font-medium">
              Scan QR Code untuk menyelesaikan pembayaran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="mb-4 text-[#5A4A32] font-medium">Scan dengan aplikasi e-wallet Anda</p>
              <div className="bg-gradient-to-br from-[#DDE0E3] to-[#FAF5EF] w-64 h-64 mx-auto flex items-center justify-center rounded-2xl border-4 border-[#FF7A00]/20 autumn-shadow">
                <div className="text-center">
                  <Wallet className="h-16 w-16 mx-auto mb-2 text-[#FF7A00]" />
                  <p className="text-sm text-[#5A4A32] font-semibold">QR Code QRIS</p>
                </div>
              </div>
              <div className="mt-6 autumn-card p-4 rounded-xl border border-[#FF7A00]/20">
                <p className="text-sm text-[#5A4A32] font-medium mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold text-gradient-fire">
                  Rp {parseFloat(topUpForm.amount || '0').toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleQRISPayment}
              className="w-full gradient-autumn-hero text-white hover-lift autumn-glow-strong font-bold shadow-xl"
            >
              ✓ Simulasi Pembayaran Berhasil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
