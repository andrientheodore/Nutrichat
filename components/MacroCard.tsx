
import React, { useEffect, useState } from 'react';
import { NutrientType } from '../types';
import { Activity, Beef, Wheat, Droplet, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MacroCardProps {
  type: NutrientType;
  value: number;
  goal: number;
  unit: string;
  color: string;
}

const MacroCard: React.FC<MacroCardProps> = ({ type, value, goal, unit, color }) => {
  // Number counting animation state
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate the number counting up
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const nextValue = start + (end - start) * easeOut;
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  const rawPercentage = (value / goal) * 100;
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  const isOver = rawPercentage > 100;
  const isMet = rawPercentage >= 100;

  // Helper to safely get color name from class string (e.g. "text-orange-500" -> "orange")
  const colorName = color.split('-')[1] || 'indigo';

  // Determine dynamic styling based on status and type
  const getStyles = () => {
    let fromColor = `from-${colorName}-500`;
    let toColor = `to-${colorName}-400`;
    let iconColor = `text-${colorName}-500`;
    let bgColor = `bg-${colorName}-500`;
    
    // Special handling for status
    if (isOver) {
       // If it's bad to go over (Calories/Fat/Carbs usually), warn.
       if (type !== NutrientType.Protein) {
         return {
           bar: 'bg-gradient-to-r from-red-500 to-orange-500',
           icon: 'text-red-500',
           bg: 'bg-red-500/10',
           glow: 'bg-red-500'
         };
       } else {
         // Protein over is often considered good
         return {
           bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
           icon: 'text-emerald-500',
           bg: 'bg-emerald-500/10',
           glow: 'bg-emerald-500'
         };
       }
    }

    return {
      bar: `bg-gradient-to-r ${fromColor} ${toColor}`,
      icon: iconColor,
      bg: `${bgColor}/10`,
      glow: bgColor
    };
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (type) {
      case NutrientType.Calories: return <Activity className={`w-5 h-5 ${styles.icon}`} />;
      case NutrientType.Protein: return <Beef className={`w-5 h-5 ${styles.icon}`} />;
      case NutrientType.Carbs: return <Wheat className={`w-5 h-5 ${styles.icon}`} />;
      case NutrientType.Fat: return <Droplet className={`w-5 h-5 ${styles.icon}`} />;
    }
  };

  return (
    <div className="group relative h-full bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${styles.bg} group-hover:scale-105`}>
            {getIcon()}
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{type}</span>
        </div>
        
        {/* Status Indicator */}
        {isMet ? (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full animate-in zoom-in duration-300 ${isOver && type !== NutrientType.Protein ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'}`}>
             {isOver && type !== NutrientType.Protein ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
             <span>{Math.round(rawPercentage)}%</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
             {Math.round(percentage)}%
          </span>
        )}
      </div>

      {/* Values */}
      <div className="flex items-baseline space-x-1 mb-4 relative z-10">
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {Math.round(displayValue)}
        </span>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
             / {goal} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${styles.bar} shadow-sm`}
          style={{ width: `${percentage}%` }}
        >
           {/* Shimmer overlay */}
           <div className="absolute inset-0 w-full h-full bg-white/25 skew-x-12 animate-shimmer" />
        </div>
      </div>
      
      {/* Hover Detail: Remaining */}
      <div className="absolute bottom-2 right-5 text-[10px] font-medium text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
         {value >= goal 
            ? `${Math.round(value - goal)} ${unit} over`
            : `${Math.round(goal - value)} ${unit} left`
         }
      </div>

      {/* Background Glow */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${styles.glow}`} />

    </div>
  );
};

export default MacroCard;
