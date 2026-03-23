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

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

export const ChartRenderer: React.FC<{ config: ChartConfig }> = ({ config }) => {
  const { theme } = useTheme();
  const accentColor = getAccentHex(theme.accentColor);
  const isDark = theme.isDarkMode;

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                tickFormatter={(value) => `${value}`}
                label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: isDark ? '#94a3b8' : '#64748b' }} 
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
                formatter={(value: any) => [value, 'Value']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500} fill={accentColor}>
                {config.data.length > 1 && config.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={config.type === 'pie' ? COLORS[index % COLORS.length] : accentColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                tickFormatter={(value) => `${value}`}
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
                formatter={(value: any) => [value, 'Value']}
              />
              <Line type="monotone" dataKey="value" stroke={accentColor} strokeWidth={3} dot={{ r: 6, fill: accentColor }} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
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
                formatter={(value: any) => [value, 'Value']}
              />
              <Legend wrapperStyle={{ color: isDark ? '#94a3b8' : '#64748b' }} />
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
