
import React from 'react';
import { BrainCircuit, Activity, X, ArrowRight } from 'lucide-react';
import { InsightAlert } from '../types';

interface InsightPopupProps {
  isOpen: boolean;
  onClose: () => void;
  alert: InsightAlert | null;
}

const InsightPopup: React.FC<InsightPopupProps> = ({ isOpen, onClose, alert }) => {
  if (!isOpen || !alert) return null;

  const isBio = alert.type === 'biometric';

  return (
    <div className="fixed bottom-4 right-4 z-[110] w-full max-w-sm animate-in slide-in-from-bottom-10 duration-300">
      <div className={`
        relative overflow-hidden rounded-2xl shadow-2xl border backdrop-blur-md
        ${isBio 
          ? 'bg-slate-900/90 border-emerald-500/50' 
          : 'bg-white/95 dark:bg-slate-800/95 border-indigo-500/50'}
      `}>
        
        {/* Background Decor */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isBio ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} />
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isBio ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-500'}`}>
                {isBio ? <Activity className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isBio ? 'text-emerald-400' : 'text-indigo-500'}`}>
                {isBio ? 'Digital Twin Prediction' : 'Behavioral Insight'}
              </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className={`text-lg font-bold mb-1 ${isBio ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
            {alert.title}
          </h4>

          {alert.dataPoint && (
             <div className="inline-block px-2 py-0.5 mb-2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
               Data Source: {alert.dataPoint}
             </div>
          )}

          <p className={`text-sm leading-relaxed mb-4 ${isBio ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
            {alert.message}
          </p>

          {alert.action && (
            <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                isBio 
                ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50' 
                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
            }`}>
              <ArrowRight className="w-4 h-4 shrink-0" />
              {alert.action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightPopup;
