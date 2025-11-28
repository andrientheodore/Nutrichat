
import { FoodItem } from '../types';

export const googleSheetsService = {
  async logMeal(scriptUrl: string, meal: FoodItem) {
    if (!scriptUrl) return;
    
    try {
      // Google Apps Script Web App Endpoint
      // Using no-cors to avoid CORS preflight issues commonly found with simple GAS deployments
      // The payload must be stringified.
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date: new Date().toISOString(),
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            quantity: meal.quantity
        }),
      });
      console.log("Synced to Google Sheets");
    } catch (error) {
      console.error("Google Sheets Sync Error:", error);
    }
  }
};
