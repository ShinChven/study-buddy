import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ChartConfig, getAccentHex } from '../types';
import { useTheme } from './ThemeProvider';

const COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#ef4444'  // Red
];

export const ChartRenderer: React.FC<{ config: ChartConfig }> = ({ config }) => {
  const { theme } = useTheme();
  const accentColor = getAccentHex(theme.accentColor);
  const isDark = theme.isDarkMode;

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
              <XAxis dataKey="label" data={config.data} axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                width={60}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                tickFormatter={formatNumber}
                label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: isDark ? '#94a3b8' : '#64748b', style: { textAnchor: 'middle' }, offset: 0 } : undefined} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#1e293b'
                }}
                itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                formatter={(value: any) => [value.toLocaleString(), 'Value']}
              />
              <Bar 
                data={config.data}
                dataKey="value" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              >
                {config.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={config.data} margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                width={60}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                tickFormatter={formatNumber}
                label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: isDark ? '#94a3b8' : '#64748b', style: { textAnchor: 'middle' }, offset: 0 } : undefined}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#1e293b'
                }}
                itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                formatter={(value: any) => [value.toLocaleString(), 'Value']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={accentColor} 
                strokeWidth={3} 
                animationDuration={1500}
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  return (
                    <circle 
                      key={`dot-${index}`}
                      cx={cx} 
                      cy={cy} 
                      r={6} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#fff" 
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart margin={{ top: 30, bottom: 30, left: 10, right: 10 }}>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="label"
                animationDuration={1500}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value
                }) => {
                  const RADIAN = Math.PI / 180;
                  // Reduced offset to keep labels inside container
                  const radius = outerRadius + 25;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
        
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={isDark ? '#94a3b8' : '#64748b'}
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-bold"
                    >
                      {value}%
                    </text>
                  );
                }}
              >
                {config.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#1e293b'
                }}
                itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                formatter={(value: number) => [`${value}%`, 'Value']}
              />
              <Legend wrapperStyle={{ color: isDark ? '#94a3b8' : '#64748b', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full py-4">
      {renderChart()}
    </div>
  );
};
