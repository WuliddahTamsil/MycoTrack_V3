import React from 'react';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradientClass?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  gradientClass = 'gradient-red-fire',
  trend 
}) => {
  return (
    <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm mb-2 text-[#5A4A32] font-medium">
              {title}
            </p>
            <h3 className="mb-2 text-3xl font-bold text-[#B82601]">
              {value}
            </h3>
            {trend && (
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  trend.isPositive 
                    ? 'bg-[#9A7400]/10 text-[#9A7400]' 
                    : 'bg-[#B82601]/10 text-[#B82601]'
                }`}>
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{trend.value}</span>
                </div>
              </div>
            )}
          </div>
          <div 
            className={`w-14 h-14 rounded-2xl ${gradientClass} flex items-center justify-center autumn-glow`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
