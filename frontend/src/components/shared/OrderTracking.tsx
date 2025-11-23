import React from 'react';
import { CheckCircle2, Circle, Package, Truck, Home, XCircle } from 'lucide-react';

interface TrackingStep {
  status: string;
  message: string;
  timestamp: string;
}

interface OrderTrackingProps {
  currentStatus: string;
  tracking?: TrackingStep[];
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ currentStatus, tracking = [] }) => {
  const statusSteps = [
    { key: 'pending', label: 'Pesanan Dibuat', icon: Package, color: 'text-yellow-600' },
    { key: 'processing', label: 'Sedang Diproses', icon: Package, color: 'text-blue-600' },
    { key: 'shipped', label: 'Sedang Dikirim', icon: Truck, color: 'text-purple-600' },
    { key: 'delivered', label: 'Selesai', icon: Home, color: 'text-green-600' },
    { key: 'cancelled', label: 'Dibatalkan', icon: XCircle, color: 'text-red-600' }
  ];

  const getStatusIndex = (status: string) => {
    const index = statusSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  // Filter steps untuk cancelled
  const visibleSteps = isCancelled 
    ? statusSteps.filter(s => s.key === 'cancelled' || s.key === 'pending')
    : statusSteps.filter(s => s.key !== 'cancelled');

  // Hitung tinggi total untuk garis vertikal
  const totalHeight = (visibleSteps.length - 1) * 80; // 80px per step

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline Line - Garis vertikal utama di tengah icon */}
        {!isCancelled && visibleSteps.length > 1 && (
          <div 
            className="absolute left-5 top-5 w-1 bg-gray-200 rounded-full z-0"
            style={{ 
              height: `${totalHeight}px`
            }}
          >
            {/* Progress line - garis yang terisi sesuai progress */}
            <div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#FF7A00] via-[#FF8A00] to-[#E8A600] rounded-full transition-all duration-500 shadow-sm"
              style={{ 
                height: `${(currentIndex / (visibleSteps.length - 1)) * 100}%`,
                maxHeight: '100%'
              }}
            />
          </div>
        )}

        {/* Steps */}
        <div className="space-y-8 relative">
          {visibleSteps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const stepTracking = tracking.find(t => t.status === step.key);
            
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="relative flex items-start gap-4 z-10">
                {/* Icon Circle */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all border-2 ${
                  isActive 
                    ? isCurrent && !isCancelled
                      ? 'bg-gradient-to-br from-[#FF7A00] to-[#E8A600] text-white shadow-lg scale-110 border-[#FF7A00]'
                      : 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md'
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {isActive && !isCancelled ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCancelled && step.key === 'cancelled' ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className={`font-semibold text-base ${isActive ? 'text-[#2D2416]' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                  {stepTracking && (
                    <div className="text-sm text-gray-600 mt-1">
                      {stepTracking.message}
                    </div>
                  )}
                  {stepTracking && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(stepTracking.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {!stepTracking && isActive && step.key === 'pending' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

