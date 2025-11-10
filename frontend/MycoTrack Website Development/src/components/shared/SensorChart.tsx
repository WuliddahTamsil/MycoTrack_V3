import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity } from 'lucide-react';

interface SensorChartProps {
  data: Array<{
    timestamp: string;
    temperature?: number;
    humidity?: number;
  }>;
  title: string;
  showTemperature?: boolean;
  showHumidity?: boolean;
}

export const SensorChart: React.FC<SensorChartProps> = ({ 
  data, 
  title, 
  showTemperature = true, 
  showHumidity = true 
}) => {
  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="autumn-card border-[#FF7A00]/10 rounded-xl p-3 autumn-shadow">
          <p className="text-sm font-bold mb-2 text-[#B82601]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
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
