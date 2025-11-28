
import React, { useState, useEffect } from 'react';
import { FoodItem } from '../types';
import { X, Save, Flame, Beef, Wheat, Droplet, Ruler, Type } from 'lucide-react';

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: FoodItem) => void;
  item: FoodItem | null;
}

const EditFoodModal: React.FC<EditFoodModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [formData, setFormData] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof FoodItem, value: string | number) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Edit Meal</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Description */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Type className="w-3 h-3" /> Description
                </label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                    required
                />
            </div>

             {/* Quantity */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Serving Size
                </label>
                <input 
                    type="text" 
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                    placeholder="e.g., 1 bowl, 200g"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                     <label className="text-xs font-medium text-orange-500 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Calories (kcal)
                    </label>
                    <input 
                        type="number" 
                        value={formData.calories}
                        onChange={(e) => handleChange('calories', Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                    />
                </div>
                 <div className="space-y-1.5">
                     <label className="text-xs font-medium text-red-500 flex items-center gap-1">
                        <Beef className="w-3 h-3" /> Protein (g)
                    </label>
                    <input 
                        type="number" 
                        value={formData.protein}
                        onChange={(e) => handleChange('protein', Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                    />
                </div>
                 <div className="space-y-1.5">
                     <label className="text-xs font-medium text-amber-500 flex items-center gap-1">
                        <Wheat className="w-3 h-3" /> Carbs (g)
                    </label>
                    <input 
                        type="number" 
                        value={formData.carbs}
                        onChange={(e) => handleChange('carbs', Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                    />
                </div>
                 <div className="space-y-1.5">
                     <label className="text-xs font-medium text-yellow-500 flex items-center gap-1">
                        <Droplet className="w-3 h-3" /> Fat (g)
                    </label>
                    <input 
                        type="number" 
                        value={formData.fat}
                        onChange={(e) => handleChange('fat', Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                >
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditFoodModal;
