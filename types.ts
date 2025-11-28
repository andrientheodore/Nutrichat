
export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'assistant';
  text: string;
  image?: string; // Base64 string for display
  timestamp: number;
}

export enum NutrientType {
  Calories = 'Calories',
  Protein = 'Protein',
  Carbs = 'Carbs',
  Fat = 'Fat'
}

export interface UserProfile {
  uuid?: string;
  phoneNumber?: string;
  name: string;
  calorieTarget: number;
  proteinTarget: number;
  weight?: number; // kg
  height?: number; // cm
  age?: number;
  gender?: string;
}

// DeepSeek / OpenAI Compatible Tool Types
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Feature B & C Types
export interface InsightAlert {
  type: 'behavioral' | 'biometric';
  title: string;
  message: string;
  action?: string;
  dataPoint?: string; // e.g. "Sleep Score: 54"
}

export interface WearableConfig {
  hasOura: boolean;
  hasAppleHealth: boolean;
  hasCGM: boolean;
}
