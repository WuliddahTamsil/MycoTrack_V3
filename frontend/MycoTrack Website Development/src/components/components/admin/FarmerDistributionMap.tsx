import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  MapPin, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  Info,
  Phone,
  Mail,
  Store,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Farmer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
  shop?: {
    name: string;
    description: string;
    photo?: string;
  };
  balance?: number;
  latitude?: number;
  longitude?: number;
}

interface MapMarker {
  id: string;
  farmer: Farmer;
  position: { lat: number; lng: number };
}

// Helper function to geocode address (simplified - in production use real geocoding API)
const geocodeAddress = (address: string): { lat: number; lng: number } | null => {
  // Simple geocoding for common Indonesian cities
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'jakarta': { lat: -6.2088, lng: 106.8456 },
    'bogor': { lat: -6.5944, lng: 106.7892 },
    'bandung': { lat: -6.9175, lng: 107.6191 },
    'surabaya': { lat: -7.2575, lng: 112.7521 },
    'yogyakarta': { lat: -7.7956, lng: 110.3695 },
    'semarang': { lat: -6.9667, lng: 110.4167 },
    'medan': { lat: 3.5952, lng: 98.6722 },
    'makassar': { lat: -5.1477, lng: 119.4327 },
    'palembang': { lat: -2.9761, lng: 104.7754 },
    'kuningan': { lat: -6.9833, lng: 108.4833 },
    'ciniru': { lat: -6.9833, lng: 108.4833 },
  };

  const addressLower = address.toLowerCase();
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (addressLower.includes(city)) {
      // Add some random offset to simulate different locations
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.1,
        lng: coords.lng + (Math.random() - 0.5) * 0.1
      };
    }
  }

  // Default to Jakarta if not found
  return { lat: -6.2088 + (Math.random() - 0.5) * 0.2, lng: 106.8456 + (Math.random() - 0.5) * 0.2 };
};

export const FarmerDistributionMap: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -6.2088, lng: 106.8456 }); // Jakarta default
  const [zoom, setZoom] = useState(6);
  const [showFarmerList, setShowFarmerList] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    if (farmers.length > 0) {
      generateMarkers();
    }
  }, [farmers, statusFilter]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/users/petanis`);
      if (!response.ok) throw new Error('Failed to fetch farmers');
      const data = await response.json();
      const farmersData = data.petanis || [];
      setFarmers(farmersData);
    } catch (error: unknown) {
      console.error('Error fetching farmers:', error);
      toast.error('Gagal memuat data petani');
    } finally {
      setLoading(false);
    }
  };

  const generateMarkers = () => {
    const filtered = farmers.filter(farmer => {
      const matchesSearch = !searchQuery || 
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || farmer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    const newMarkers: MapMarker[] = filtered.map(farmer => {
      const coords = farmer.latitude && farmer.longitude
        ? { lat: farmer.latitude, lng: farmer.longitude }
        : geocodeAddress(farmer.address);

      if (!coords) {
        return null;
      }

      return {
        id: farmer.id,
        farmer,
        position: coords
      };
    }).filter((marker): marker is MapMarker => marker !== null);

    setMarkers(newMarkers);

    // Center map on markers if any
    if (newMarkers.length > 0) {
      const avgLat = newMarkers.reduce((sum, m) => sum + m.position.lat, 0) / newMarkers.length;
      const avgLng = newMarkers.reduce((sum, m) => sum + m.position.lng, 0) / newMarkers.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  };

  useEffect(() => {
    generateMarkers();
  }, [searchQuery, statusFilter, farmers]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      accepted: { label: 'Aktif', color: 'bg-green-500', icon: CheckCircle2 },
      pending: { label: 'Menunggu', color: 'bg-yellow-500', icon: Clock },
      rejected: { label: 'Ditolak', color: 'bg-red-500', icon: XCircle },
      suspended: { label: 'Ditangguhkan', color: 'bg-orange-500', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleMarkerClick = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    const coords = farmer.latitude && farmer.longitude
      ? { lat: farmer.latitude, lng: farmer.longitude }
      : geocodeAddress(farmer.address);
    
    if (coords) {
      setMapCenter(coords);
      setZoom(12);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 3));
  };

  const handleResetView = () => {
    if (markers.length > 0) {
      const avgLat = markers.reduce((sum, m) => sum + m.position.lat, 0) / markers.length;
      const avgLng = markers.reduce((sum, m) => sum + m.position.lng, 0) / markers.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
      setZoom(6);
    }
  };

  const exportData = () => {
    const csv = [
      ['Nama', 'Email', 'Telepon', 'Alamat', 'Status', 'Toko', 'Saldo'].join(','),
      ...markers.map(m => [
        m.farmer.name,
        m.farmer.email,
        m.farmer.phoneNumber,
        `"${m.farmer.address}"`,
        m.farmer.status,
        m.farmer.shop?.name || '-',
        m.farmer.balance || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persebaran-petani-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data berhasil diekspor');
  };

  const stats = {
    total: markers.length,
    active: markers.filter(m => m.farmer.status === 'accepted').length,
    pending: markers.filter(m => m.farmer.status === 'pending').length,
    totalBalance: markers.reduce((sum, m) => sum + (m.farmer.balance || 0), 0)
  };

  // Generate Google Maps embed URL (using free embed without API key)
  const generateMapUrl = () => {
    if (markers.length === 0) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.6091243727!2d${mapCenter.lng}!3d${mapCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.floor(mapCenter.lat)}!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid`;
    }
    
    // For multiple markers, use a simple center view
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.6091243727!2d${mapCenter.lng}!3d${mapCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.floor(mapCenter.lat)}!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#B82601] flex items-center gap-3">
            <MapPin className="h-8 w-8" />
            Persebaran Petani
          </h2>
          <p className="text-[#5A4A32] mt-1">
            Visualisasi lokasi dan distribusi petani di seluruh Indonesia
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleResetView}
            variant="outline"
            className="border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
          <Button
            onClick={exportData}
            className="gradient-autumn-cta text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Ekspor Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="autumn-card border-[#FF7A00]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A4A32] font-medium">Total Petani</p>
                <p className="text-2xl font-bold text-[#B82601] mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-autumn-cta flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="autumn-card border-[#FF7A00]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A4A32] font-medium">Petani Aktif</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="autumn-card border-[#FF7A00]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A4A32] font-medium">Menunggu Verifikasi</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="autumn-card border-[#FF7A00]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A4A32] font-medium">Total Saldo</p>
                <p className="text-2xl font-bold text-[#B82601] mt-1">
                  Rp {stats.totalBalance.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-autumn-cta flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="autumn-card border-[#FF7A00]/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#5A4A32]" />
              <Input
                placeholder="Cari petani (nama, email, alamat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] border-[#FF7A00]/20">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="accepted">Aktif</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Full Page Map */}
      <div className="relative" style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
        {/* Map - Full Page */}
        <Card className="autumn-card border-[#FF7A00]/10 h-full relative">
          <CardHeader className="pb-3 absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b border-[#FF7A00]/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#B82601] flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Peta Persebaran
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFarmerList(!showFarmerList)}
                  className="border-[#FF7A00] text-[#FF7A00]"
                >
                  {showFarmerList ? (
                    <>
                      <PanelRightClose className="h-4 w-4 mr-2" />
                      Sembunyikan Daftar
                    </>
                  ) : (
                    <>
                      <PanelRightOpen className="h-4 w-4 mr-2" />
                      Tampilkan Daftar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  className="border-[#FF7A00] text-[#FF7A00]"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  className="border-[#FF7A00] text-[#FF7A00]"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-full pt-16">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#FF7A00] mx-auto mb-2" />
                  <p className="text-[#5A4A32]">Memuat peta...</p>
                </div>
              </div>
            ) : (
              <div ref={mapContainerRef} className="w-full h-full relative">
                {/* Google Maps Embed - Full Page */}
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=id&z=${zoom}&output=embed`}
                  title="Peta Persebaran Petani"
                />
                
                {/* Custom 3D Farmer Markers Overlay */}
                {markers.map((marker, index) => {
                  // Calculate position based on lat/lng difference from center
                  // Using Mercator projection approximation
                  const latDiff = marker.position.lat - mapCenter.lat;
                  const lngDiff = marker.position.lng - mapCenter.lng;
                  
                  // Convert to pixel position (simplified Mercator projection)
                  const pixelsPerDegree = Math.pow(2, zoom) * 256 / 360;
                  const x = 50 + (lngDiff * pixelsPerDegree * 100 / (mapContainerRef.current?.clientWidth || 1));
                  const y = 50 - (latDiff * pixelsPerDegree * 100 / (mapContainerRef.current?.clientHeight || 1));
                  
                  const statusColor = {
                    accepted: 'bg-green-500',
                    pending: 'bg-yellow-500',
                    rejected: 'bg-red-500',
                    suspended: 'bg-orange-500'
                  }[marker.farmer.status] || 'bg-gray-500';
                  
                  const statusBorderColor = {
                    accepted: 'border-green-600',
                    pending: 'border-yellow-600',
                    rejected: 'border-red-600',
                    suspended: 'border-orange-600'
                  }[marker.farmer.status] || 'border-gray-600';
                  
                  return (
                    <div
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker.farmer)}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full z-20 group"
                      style={{
                        left: `${Math.max(5, Math.min(95, x))}%`,
                        top: `${Math.max(5, Math.min(95, y))}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {/* 3D Petani Icon with Shadow */}
                      <div className="relative animate-fade-in-up">
                        {/* Shadow Effect */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-black/30 rounded-full blur-md"></div>
                        
                        {/* Main Marker Container - Modern Design */}
                        <div className={`relative ${statusColor} ${statusBorderColor} border-2 rounded-full p-2 shadow-2xl transform transition-all duration-300 hover:scale-125 hover:z-30 hover:shadow-3xl hover:ring-4 hover:ring-white/50`}>
                          {/* Modern Farmer Icon with Glow Effect */}
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-2xl"
                          >
                            <defs>
                              {/* Modern Gradient */}
                              <linearGradient id={`gradient-modern-${marker.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                                <stop offset="50%" stopColor="#16a34a" stopOpacity="1" />
                                <stop offset="100%" stopColor="#15803d" stopOpacity="1" />
                              </linearGradient>
                              
                              {/* Glow Effect */}
                              <filter id={`glow-${marker.id}`}>
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                              
                              {/* Shadow */}
                              <filter id={`shadow-modern-${marker.id}`}>
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.4"/>
                              </filter>
                              
                              {/* Shine Effect */}
                              <linearGradient id={`shine-${marker.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Background Circle with Gradient */}
                            <circle 
                              cx="24" 
                              cy="24" 
                              r="20" 
                              fill={`url(#gradient-modern-${marker.id})`}
                              filter={`url(#shadow-modern-${marker.id})`}
                              className="animate-pulse"
                              style={{ animationDuration: '3s' }}
                            />
                            
                            {/* Shine Overlay */}
                            <circle 
                              cx="24" 
                              cy="24" 
                              r="20" 
                              fill={`url(#shine-${marker.id})`}
                              opacity="0.5"
                            />
                            
                            {/* Modern Farmer Icon - Simplified & Stylized */}
                            <g filter={`url(#glow-${marker.id})`}>
                              {/* Head */}
                              <circle cx="24" cy="18" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                              <circle cx="22" cy="17" r="1" fill="#1f2937" />
                              <circle cx="26" cy="17" r="1" fill="#1f2937" />
                              <path d="M 21 20 Q 24 21 27 20" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                              
                              {/* Modern Hat/Helmet */}
                              <path d="M 16 16 Q 24 12 32 16 L 30 14 Q 24 10 18 14 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                              <ellipse cx="24" cy="14" rx="6" ry="2" fill="#ea580c" opacity="0.7" />
                              
                              {/* Body - Modern Shirt */}
                              <rect x="19" y="23" width="10" height="12" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
                              <rect x="19" y="23" width="10" height="6" rx="3" fill={`url(#shine-${marker.id})`} opacity="0.3" />
                              
                              {/* Arms */}
                              <rect x="14" y="25" width="6" height="8" rx="3" fill="#fbbf24" />
                              <rect x="28" y="25" width="6" height="8" rx="3" fill="#fbbf24" />
                              
                              {/* Legs */}
                              <rect x="20" y="33" width="4" height="8" rx="2" fill="#1f2937" />
                              <rect x="24" y="33" width="4" height="8" rx="2" fill="#1f2937" />
                              
                              {/* Modern Tool - Mushroom/Plant Icon */}
                              <g transform="translate(30, 20)">
                                {/* Mushroom Cap */}
                                <ellipse cx="0" cy="-2" rx="4" ry="3" fill="#dc2626" />
                                <ellipse cx="0" cy="-2" rx="3" ry="2" fill="#ef4444" />
                                {/* Mushroom Stem */}
                                <rect x="-1.5" y="0" width="3" height="4" rx="1.5" fill="#fbbf24" />
                                {/* Spots on Cap */}
                                <circle cx="-1.5" cy="-3" r="0.8" fill="#ffffff" opacity="0.8" />
                                <circle cx="1.5" cy="-1.5" r="0.8" fill="#ffffff" opacity="0.8" />
                              </g>
                              
                              {/* Decorative Elements - Small Leaves */}
                              <g transform="translate(10, 28)">
                                <path d="M 0 0 Q -2 -2 0 -4 Q 2 -2 0 0" fill="#22c55e" opacity="0.7" />
                              </g>
                              <g transform="translate(38, 30)">
                                <path d="M 0 0 Q -2 -2 0 -4 Q 2 -2 0 0" fill="#22c55e" opacity="0.7" />
                              </g>
                            </g>
                            
                            {/* Outer Ring for Status */}
                            <circle 
                              cx="24" 
                              cy="24" 
                              r="22" 
                              fill="none" 
                              stroke={marker.farmer.status === 'accepted' ? '#22c55e' : marker.farmer.status === 'pending' ? '#fbbf24' : marker.farmer.status === 'rejected' ? '#ef4444' : '#f97316'} 
                              strokeWidth="2" 
                              strokeDasharray="4 4"
                              opacity="0.6"
                              className="animate-spin"
                              style={{ animationDuration: '8s' }}
                            />
                          </svg>
                        </div>
                        
                        {/* Pulse Animation for Active Farmers */}
                        {marker.farmer.status === 'accepted' && (
                          <div className={`absolute inset-0 ${statusColor} rounded-full animate-ping opacity-20`} style={{ animationDuration: '2s' }}></div>
                        )}
                        
                        {/* Status Ring */}
                        <div className={`absolute -inset-1 ${statusBorderColor} rounded-full border-2 opacity-50 ${marker.farmer.status === 'accepted' ? 'animate-pulse' : ''}`}></div>
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                          <div className="bg-[#B82601] text-white text-xs rounded-lg px-4 py-2.5 shadow-2xl whitespace-nowrap border-2 border-[#FF7A00]">
                            <p className="font-bold text-sm mb-1">{marker.farmer.name}</p>
                            <p className="text-[#FFE5B4] text-xs">{marker.farmer.address}</p>
                            {marker.farmer.shop?.name && (
                              <p className="text-[#FFE5B4] text-xs mt-1 flex items-center gap-1">
                                <Store className="h-3 w-3" />
                                {marker.farmer.shop.name}
                              </p>
                            )}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#B82601]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Custom Markers Info */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-[#FF7A00]/20 z-10">
                  <p className="text-xs text-[#5A4A32] font-medium">
                    {markers.length} petani ditampilkan di peta
                  </p>
                  <p className="text-xs text-[#5A4A32] mt-1">
                    Klik petani di daftar untuk melihat detail
                  </p>
                </div>
                
                {/* Custom Markers Overlay - Legend */}
                <div className="absolute top-20 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-[#FF7A00]/20 z-10">
                  <p className="text-sm font-semibold text-[#B82601] mb-2">Legend</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>Aktif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span>Menunggu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span>Ditolak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span>Ditangguhkan</span>
                    </div>
                  </div>
                </div>

                {/* Farmer List - Slide Panel */}
                {showFarmerList && (
                  <div className="absolute top-16 right-0 w-96 h-[calc(100%-4rem)] bg-white/95 backdrop-blur-sm shadow-2xl border-l border-[#FF7A00]/20 z-10 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#FF7A00]/10 bg-white">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[#B82601] flex items-center gap-2 text-lg">
                          <Users className="h-5 w-5" />
                          Daftar Petani ({markers.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowFarmerList(false)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                      {markers.length === 0 ? (
                        <div className="p-6 text-center text-[#5A4A32]">
                          <MapPin className="h-12 w-12 mx-auto mb-3 text-[#FF7A00]/30" />
                          <p>Tidak ada petani ditemukan</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {markers.map((marker) => (
                            <div
                              key={marker.id}
                              onClick={() => handleMarkerClick(marker.farmer)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedFarmer?.id === marker.farmer.id
                                  ? 'border-[#FF7A00] bg-[#FF7A00]/10 shadow-md'
                                  : 'border-[#FF7A00]/20 hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/5'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-[#B82601] text-sm">
                                  {marker.farmer.name}
                                </h4>
                                {getStatusBadge(marker.farmer.status)}
                              </div>
                              <div className="space-y-1 text-xs text-[#5A4A32]">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="line-clamp-1">{marker.farmer.address}</span>
                                </div>
                                {marker.farmer.shop?.name && (
                                  <div className="flex items-center gap-1">
                                    <Store className="h-3 w-3" />
                                    <span>{marker.farmer.shop.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Farmer Detail Modal */}
      {selectedFarmer && (
        <Card className="autumn-card border-[#FF7A00]/10 fixed bottom-6 right-6 w-96 z-50 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#B82601] flex items-center gap-2">
                <Info className="h-5 w-5" />
                Detail Petani
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedFarmer(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#B82601] mb-2">{selectedFarmer.name}</h3>
              {getStatusBadge(selectedFarmer.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#5A4A32]">
                <Mail className="h-4 w-4 text-[#FF7A00]" />
                <span>{selectedFarmer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5A4A32]">
                <Phone className="h-4 w-4 text-[#FF7A00]" />
                <span>{selectedFarmer.phoneNumber}</span>
              </div>
              <div className="flex items-start gap-2 text-[#5A4A32]">
                <MapPin className="h-4 w-4 text-[#FF7A00] mt-0.5" />
                <span>{selectedFarmer.address}</span>
              </div>
              {selectedFarmer.shop?.name && (
                <div className="flex items-center gap-2 text-[#5A4A32]">
                  <Store className="h-4 w-4 text-[#FF7A00]" />
                  <span>{selectedFarmer.shop.name}</span>
                </div>
              )}
              {selectedFarmer.balance !== undefined && (
                <div className="flex items-center gap-2 text-[#5A4A32]">
                  <DollarSign className="h-4 w-4 text-[#FF7A00]" />
                  <span>Rp {selectedFarmer.balance.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                const coords = selectedFarmer.latitude && selectedFarmer.longitude
                  ? { lat: selectedFarmer.latitude, lng: selectedFarmer.longitude }
                  : geocodeAddress(selectedFarmer.address);
                
                if (coords) {
                  window.open(
                    `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
                    '_blank'
                  );
                }
              }}
              className="w-full gradient-autumn-cta text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Buka di Google Maps
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

