
import React, { useState } from 'react';
import { FoodItem } from '../types';
import { Trash2, Search, X, Pencil } from 'lucide-react';
import EditFoodModal from './EditFoodModal';

interface FoodLogProps {
  items: FoodItem[];
  onRemove: (id: string) => void;
  onUpdate?: (item: FoodItem) => void;
}

const FoodLog: React.FC<FoodLogProps> = ({ items, onRemove, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 dark:text-slate-500">
        <p className="text-sm">Your food log is empty.</p>
      </div>
    );
  }

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by newest first
  const sortedItems = [...filteredItems].sort((a, b) => b.timestamp - a.timestamp);

  const handleSaveEdit = (updatedItem: FoodItem) => {
    if (onUpdate) {
      onUpdate(updatedItem);
    }
  };

  return (
    <div className="space-y-4">
      <EditFoodModal 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        item={editingItem} 
        onSave={handleSaveEdit} 
      />

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search meals..."
          className="block w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
          <p className="text-sm">No meals found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <div key={item.id} className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">{item.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.quantity}</p>
                  </div>
                  <div className="text-right mr-4">
                    <span className="block font-bold text-slate-700 dark:text-slate-300">{item.calories} kcal</span>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 flex gap-2 justify-end">
                      <span className="text-red-400">P: {item.protein}g</span>
                      <span className="text-amber-400">C: {item.carbs}g</span>
                      <span className="text-yellow-400">F: {item.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button 
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors"
                    title="Edit item"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Remove item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodLog;
