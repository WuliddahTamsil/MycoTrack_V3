import React from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyRevenue = [
  { month: 'Jan', revenue: 45000000, orders: 120 },
  { month: 'Feb', revenue: 52000000, orders: 145 },
  { month: 'Mar', revenue: 48000000, orders: 132 },
  { month: 'Apr', revenue: 61000000, orders: 168 },
  { month: 'May', revenue: 55000000, orders: 152 },
  { month: 'Jun', revenue: 67000000, orders: 185 },
  { month: 'Jul', revenue: 72000000, orders: 198 },
  { month: 'Aug', revenue: 68000000, orders: 189 },
  { month: 'Sep', revenue: 75000000, orders: 205 },
  { month: 'Oct', revenue: 82000000, orders: 225 },
  { month: 'Nov', revenue: 88000000, orders: 242 }
];

const farmerDistribution = [
  { region: 'Bandung', farmers: 45, percentage: 35 },
  { region: 'Jakarta', farmers: 32, percentage: 25 },
  { region: 'Surabaya', farmers: 28, percentage: 22 },
  { region: 'Yogyakarta', farmers: 15, percentage: 12 },
  { region: 'Lainnya', farmers: 8, percentage: 6 }
];

const productCategories = [
  { name: 'Jamur Kuping Segar', value: 45, color: '#FF6B35' },
  { name: 'Jamur Kuping Kering', value: 30, color: '#FFA726' },
  { name: 'Baglog Siap Tanam', value: 15, color: '#8B4513' },
  { name: 'Peralatan', value: 10, color: '#556B2F' }
];

const topFarmers = [
  { name: 'Budi Santoso', revenue: 15500000, orders: 42, rating: 4.9 },
  { name: 'Siti Nurhaliza', revenue: 12800000, orders: 38, rating: 4.8 },
  { name: 'Ahmad Hidayat', revenue: 11200000, orders: 35, rating: 4.7 },
  { name: 'Dewi Lestari', revenue: 9500000, orders: 28, rating: 4.8 },
  { name: 'Eko Prasetyo', revenue: 8900000, orders: 25, rating: 4.6 }
];

export const AdminAnalytics: React.FC = () => {
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = monthlyRevenue.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const totalFarmers = farmerDistribution.reduce((sum, item) => sum + item.farmers, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Revenue</p>
                <p className="text-2xl mt-2">
                  Rp {(totalRevenue / 1000000).toFixed(1)}jt
                </p>
                <p className="text-sm text-green-600 mt-1">+12.5% vs bulan lalu</p>
              </div>
              <DollarSign className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Pesanan</p>
                <p className="text-2xl mt-2">{totalOrders}</p>
                <p className="text-sm text-green-600 mt-1">+8.3% vs bulan lalu</p>
              </div>
              <ShoppingBag className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Rata-rata Nilai Pesanan</p>
                <p className="text-2xl mt-2">
                  Rp {Math.round(avgOrderValue / 1000)}k
                </p>
                <p className="text-sm text-green-600 mt-1">+3.8% vs bulan lalu</p>
              </div>
              <TrendingUp className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Petani</p>
                <p className="text-2xl mt-2">{totalFarmers}</p>
                <p className="text-sm text-green-600 mt-1">+15.2% vs bulan lalu</p>
              </div>
              <Users className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
            Tren Revenue & Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--primary-orange)" 
                strokeWidth={2}
                name="Revenue (Rp)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stroke="var(--primary-gold)" 
                strokeWidth={2}
                name="Jumlah Pesanan"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farmer Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
              Persebaran Petani per Wilayah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={farmerDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="farmers" fill="var(--primary-orange)" name="Jumlah Petani" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {farmerDistribution.map((region) => (
                <div key={region.region} className="flex items-center justify-between text-sm">
                  <span>{region.region}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${region.percentage}%`,
                          backgroundColor: 'var(--primary-orange)'
                        }}
                      />
                    </div>
                    <span className="w-16 text-right">{region.farmers} petani</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
              Kategori Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {productCategories.map((category) => (
                <div key={category.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Farmers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
            Top 5 Petani Berdasarkan Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topFarmers.map((farmer, index) => (
              <div 
                key={farmer.name}
                className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-gold)] text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4>{farmer.name}</h4>
                  <div className="flex items-center gap-4 text-sm opacity-60 mt-1">
                    <span>{farmer.orders} pesanan</span>
                    <span>•</span>
                    <span>⭐ {farmer.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg">Rp {(farmer.revenue / 1000000).toFixed(1)}jt</p>
                  <p className="text-sm opacity-60">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
