import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity } from 'lucide-react';

interface SensorChartProps {
  data: Array<{
    timestamp: string;
    temperature?: number;
    humidity?: number;
    phase?: string;
  }>;
  title: string;
  showTemperature?: boolean;
  showHumidity?: boolean;
}

// Helper function untuk menentukan kondisi suhu dengan variasi keterangan
const getTemperatureCondition = (temp: number): { condition: string; color: string; suggestion: string } => {
  if (temp < 18) {
    return {
      condition: 'Sangat Dingin ⚠️',
      color: '#3B82F6',
      suggestion: 'Suhu terlalu dingin! Aktifkan heater atau tutup ventilasi untuk meningkatkan suhu. Suhu ideal: 22-28°C'
    };
  }
  if (temp >= 18 && temp < 20) {
    return {
      condition: 'Dingin',
      color: '#60A5FA',
      suggestion: 'Suhu agak dingin. Pertimbangkan untuk menyalakan heater atau mengurangi sirkulasi udara.'
    };
  }
  if (temp >= 20 && temp <= 28) {
    return {
      condition: 'Normal ✅',
      color: '#10B981',
      suggestion: 'Suhu optimal untuk pertumbuhan jamur kuping.'
    };
  }
  if (temp > 28 && temp <= 32) {
    return {
      condition: 'Hangat',
      color: '#F59E0B',
      suggestion: 'Suhu agak hangat. Buka ventilasi atau aktifkan exhaust fan untuk menurunkan suhu.'
    };
  }
  if (temp > 32 && temp <= 35) {
    return {
      condition: 'Panas ⚠️',
      color: '#EF4444',
      suggestion: 'Suhu terlalu panas! Segera aktifkan exhaust fan, siram lantai, atau tutup jendela dari sinar matahari langsung.'
    };
  }
  return {
    condition: 'Sangat Panas 🔥',
    color: '#DC2626',
    suggestion: 'Suhu sangat panas! Berbahaya untuk jamur. Segera turunkan suhu dengan exhaust fan, penyiraman lantai, dan tutup semua jendela dari sinar matahari.'
  };
};

// Helper function untuk menentukan kondisi kelembaban dengan variasi keterangan
const getHumidityCondition = (humidity: number): { condition: string; color: string; suggestion: string } => {
  if (humidity < 60) {
    return {
      condition: 'Sangat Kering ⚠️',
      color: '#F59E0B',
      suggestion: 'Kelembaban sangat rendah! Segera aktifkan humidifier atau siram lantai. Kelembaban ideal: 75-90%'
    };
  }
  if (humidity >= 60 && humidity < 70) {
    return {
      condition: 'Kering',
      color: '#FBBF24',
      suggestion: 'Kelembaban agak rendah. Pertimbangkan untuk menyiram lantai atau menggunakan humidifier.'
    };
  }
  if (humidity >= 70 && humidity <= 90) {
    return {
      condition: 'Normal ✅',
      color: '#10B981',
      suggestion: 'Kelembaban optimal untuk pertumbuhan jamur kuping.'
    };
  }
  if (humidity > 90 && humidity <= 95) {
    return {
      condition: 'Lembab',
      color: '#60A5FA',
      suggestion: 'Kelembaban agak tinggi. Buka ventilasi atau aktifkan exhaust fan untuk mengurangi kelembaban.'
    };
  }
  return {
    condition: 'Sangat Lembab ⚠️',
    color: '#3B82F6',
    suggestion: 'Kelembaban terlalu tinggi! Berisiko kontaminasi. Segera aktifkan exhaust fan dan kurangi penyiraman.'
  };
};

// Helper function untuk format tanggal DD/MM/YY
const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

export const SensorChart: React.FC<SensorChartProps> = ({ 
  data, 
  title, 
  showTemperature = true, 
  showHumidity = true 
}) => {
  // Filter data setiap 4 jam sekali (00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
  // Ambil data terakhir 24 jam dan filter setiap 4 jam
  const now = new Date();
  const last24Hours = data.filter(item => {
    const itemDate = new Date(item.timestamp);
    const hoursDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Data dalam 24 jam terakhir
  });

  // Kelompokkan data per 4 jam (0-3, 4-7, 8-11, 12-15, 16-19, 20-23)
  // Ambil data yang paling dekat dengan jam yang habis dibagi 4
  const hourGroups: { [key: number]: typeof data[0] } = {};
  
  last24Hours.forEach(item => {
    const date = new Date(item.timestamp);
    const hour = date.getHours();
    const groupKey = Math.floor(hour / 4) * 4; // 0, 4, 8, 12, 16, 20
    
    if (!hourGroups[groupKey]) {
      hourGroups[groupKey] = item;
    } else {
      // Ambil yang paling dekat dengan jam target (misalnya 08:00)
      const targetTime = new Date(date);
      targetTime.setHours(groupKey, 0, 0, 0);
      
      const currentDiff = Math.abs(date.getTime() - targetTime.getTime());
      const existingDate = new Date(hourGroups[groupKey].timestamp);
      const existingDiff = Math.abs(existingDate.getTime() - targetTime.getTime());
      
      if (currentDiff < existingDiff) {
        hourGroups[groupKey] = item;
      }
    }
  });

  // Urutkan berdasarkan timestamp
  const filteredData = Object.values(hourGroups).sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const formattedData = filteredData.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      const timestamp = dataPoint?.timestamp || '';
      const dateStr = formatDate(timestamp);
      
      return (
        <div className="autumn-card border-[#FF7A00]/10 rounded-xl p-4 autumn-shadow bg-white min-w-[200px]">
          <p className="text-sm font-bold mb-3 text-[#B82601] border-b border-[#FF7A00]/20 pb-2">
            Tanggal: {dateStr}
          </p>
          {payload.map((entry: any, index: number) => {
            const value = entry.value;
            let conditionInfo: { condition: string; color: string; suggestion: string } | null = null;
            
            if (entry.dataKey === 'temperature') {
              conditionInfo = getTemperatureCondition(value);
            } else if (entry.dataKey === 'humidity') {
              conditionInfo = getHumidityCondition(value);
            }
            
            const isNormal = conditionInfo?.condition.includes('Normal');
            
            return (
              <div key={index} className="mb-3 last:mb-0">
                <p className="text-sm font-semibold mb-1" style={{ color: entry.color }}>
                  {entry.name}: {entry.dataKey === 'temperature' ? `${value.toFixed(1)}°C` : `${value.toFixed(1)}%`}
                </p>
                {conditionInfo && (
                  <>
                    <p className="text-xs font-semibold mb-1" style={{ color: conditionInfo.color }}>
                      Kondisi: {conditionInfo.condition}
                    </p>
                    {!isNormal && (
                      <div className="mt-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-xs text-yellow-800 font-medium">
                          💡 Saran: {conditionInfo.suggestion}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-autumn-hero flex items-center justify-center autumn-shadow">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-xl text-[#B82601] font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B82601" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#B82601" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE0E3" opacity={0.6} />
            <XAxis 
              dataKey="time" 
              stroke="#5A4A32"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#5A4A32"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#B82601'
              }}
            />
            {showTemperature && (
              <Area
                type="monotone" 
                dataKey="temperature" 
                stroke="#B82601" 
                strokeWidth={3}
                fill="url(#colorTemp)"
                name="Suhu (°C)"
                dot={{ fill: '#B82601', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            )}
            {showHumidity && (
              <Area
                type="monotone" 
                dataKey="humidity" 
                stroke="#FF7A00" 
                strokeWidth={3}
                fill="url(#colorHumidity)"
                name="Kelembaban (%)"
                dot={{ fill: '#FF7A00', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
