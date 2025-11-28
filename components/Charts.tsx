
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DailyStats } from '../types';

interface ChartsProps {
  stats: DailyStats;
}

const Charts: React.FC<ChartsProps> = ({ stats }) => {
  const data = [
    { name: 'Protein', value: stats.totalProtein, color: '#ef4444' },
    { name: 'Carbs', value: stats.totalCarbs, color: '#f59e0b' },
    { name: 'Fat', value: stats.totalFat, color: '#eab308' },
  ];

  // Filter out zero values to avoid weird empty charts or label overlap
  const activeData = data.filter(d => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="h-64 w-full bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <p className="text-sm font-medium">No data logged today</p>
        <span className="text-xs mt-1 text-slate-400 dark:text-slate-500">Log a meal to see your breakdown!</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col relative transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex-shrink-0">Macro Breakdown</h3>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${Math.round(value)}g`, '']}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1e293b'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Stats Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
          <div className="text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">Total</span>
            <span className="text-xl font-bold text-slate-700 dark:text-slate-200 block">{Math.round(stats.totalCalories)}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
