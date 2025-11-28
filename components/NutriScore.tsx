
import React from 'react';
import { Info, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DailyStats, UserProfile } from '../types';

interface NutriScoreProps {
  stats: DailyStats;
  goals: UserProfile;
}

const NutriScore: React.FC<NutriScoreProps> = ({ stats, goals }) => {
  // --- Calculation Logic ---
  
  // 1. Calorie Accuracy (60% weight)
  // We want a bell curve: 100% score at target, dropping off if too low or too high.
  const calRatio = stats.totalCalories / (goals.calorieTarget || 2000);
  let calScore = 0;
  
  if (calRatio <= 1.0) {
    // Linear progress up to 100%
    calScore = calRatio * 100;
  } else {
    // Penalty for going over: Drastic drop
    // If 110% eaten, score drops. 
    // Formula: 100 - ((ratio - 1) * penalty_factor)
    calScore = Math.max(0, 100 - ((calRatio - 1) * 200)); 
  }

  // 2. Protein Accuracy (40% weight)
  // Protein is a minimum target usually, so we don't penalize going over as much as calories.
  const proteinRatio = stats.totalProtein / (goals.proteinTarget || 150);
  const proteinScore = Math.min(100, proteinRatio * 100);

  // Final Weighted Score
  const totalScore = Math.round((calScore * 0.6) + (proteinScore * 0.4));

  // --- Visual Logic ---
  let color = "text-red-500";
  let strokeColor = "#ef4444";
  let message = "Needs Improvement";
  
  if (totalScore >= 85) {
    color = "text-emerald-500";
    strokeColor = "#10b981";
    message = "Excellent!";
  } else if (totalScore >= 70) {
    color = "text-indigo-500";
    strokeColor = "#6366f1";
    message = "Good Job";
  } else if (totalScore >= 50) {
    color = "text-amber-500";
    strokeColor = "#f59e0b";
    message = "Fair Start";
  }

  // SVG Circle Logic
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between relative group transition-colors h-full">
      
      {/* Left Side: Text */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">NutriScore</h3>
          <Info className="w-4 h-4 text-slate-400 cursor-help" />
        </div>
        <p className={`text-sm font-medium ${color}`}>{message}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          Based on adherence to goals
        </p>
      </div>

      {/* Right Side: Ring Chart */}
      <div className="relative w-20 h-20 flex-shrink-0 mr-8">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Progress Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={strokeColor}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{totalScore}</span>
        </div>
      </div>

      {/* Tooltip - Absolute positioned/floating */}
      <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-4 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-slate-700">
        <h4 className="font-bold mb-2 flex items-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-400" /> Score Calculation
        </h4>
        <div className="space-y-3">
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Calorie Goal ({Math.round(calRatio * 100)}%)</span>
                    <span className="font-mono text-indigo-300">60% Weight</span>
                </div>
                <div className="w-full bg-slate-700 h-1 rounded-full">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${Math.min(100, calRatio * 100)}%` }} />
                </div>
                {calRatio > 1.1 && (
                    <p className="text-[10px] text-red-300 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Penalty for overeating
                    </p>
                )}
            </div>
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Protein Goal ({Math.round(proteinRatio * 100)}%)</span>
                    <span className="font-mono text-emerald-300">40% Weight</span>
                </div>
                <div className="w-full bg-slate-700 h-1 rounded-full">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, proteinRatio * 100)}%` }} />
                </div>
            </div>
            <div className="pt-2 border-t border-slate-700">
                <p className="text-slate-400 italic">
                    Score = (Calorie Accuracy × 0.6) + (Protein Accuracy × 0.4)
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NutriScore;
    