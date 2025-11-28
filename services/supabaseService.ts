
import { supabase } from './supabaseClient';
import { UserProfile, FoodItem } from '../types';

export const supabaseService = {
  async getProfileByPhone(phone: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('phone_number', phone)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile from Supabase:", error.message);
        return null;
      }

      if (!data) return null;

      return {
        uuid: data.uuid,
        phoneNumber: data.phone_number,
        name: data.name || 'User',
        calorieTarget: parseInt(data.calories_target) || 2200,
        proteinTarget: parseInt(data.protein_target) || 150,
        weight: undefined, 
        height: undefined,
        age: undefined,
        gender: 'Male' 
      };
    } catch (err) {
      console.error("Supabase Service Unexpected Error:", err);
      return null;
    }
  },

  async createProfile(phone: string): Promise<UserProfile | null> {
    try {
      const newProfile = {
        phone_number: phone,
        name: 'User',
        calories_target: '2200',
        protein_target: '150'
      };
      
      const { data, error } = await supabase
        .from('Profiles')
        .insert([newProfile])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating profile in Supabase:", error.message);
        // Return null to handle RLS or other insertion errors gracefully
        return null;
      }

      return {
        uuid: data.uuid,
        phoneNumber: data.phone_number,
        name: data.name,
        calorieTarget: parseInt(data.calories_target),
        proteinTarget: parseInt(data.protein_target),
        gender: 'Male'
      };
    } catch (err) {
      console.error("Supabase Create Error:", err);
      return null;
    }
  },

  async updateProfile(uuid: string, profile: Partial<UserProfile>) {
    const updates: any = {};
    if (profile.name) updates.name = profile.name;
    if (profile.calorieTarget) updates.calories_target = String(profile.calorieTarget);
    if (profile.proteinTarget) updates.protein_target = String(profile.proteinTarget);
    
    const { error } = await supabase
      .from('Profiles')
      .update(updates)
      .eq('uuid', uuid);
      
    if (error) console.error("Error updating profile:", error.message);
  },

  async getLogs(phoneNumber: string, date?: string): Promise<FoodItem[]> {
    let query = supabase
      .from('Meals')
      .select('*')
      .eq('phone_number', phoneNumber);

    // If date is provided, filter by it. Otherwise return all history (optional)
    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching logs:", error.message);
      return [];
    }

    return data.map((item: any) => ({
      id: item.uuid,
      name: item.meal_description,
      quantity: '1 serving', // Default, as DB might not have this column yet
      calories: Number(item.calories) || 0,
      protein: Number(item.proteins) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fats) || 0,
      timestamp: new Date(item.created_at).getTime()
    }));
  },

  async addLog(phoneNumber: string, item: FoodItem) {
    // Use ISO date string YYYY-MM-DD for consistency
    const dateStr = new Date(item.timestamp).toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('Meals')
      .insert([{
        phone_number: phoneNumber,
        meal_description: item.name,
        calories: String(item.calories),
        proteins: String(item.protein),
        carbs: String(item.carbs),
        fats: String(item.fat),
        date: dateStr
      }]);
      
    if (error) console.error("Error adding log:", error.message);
  },

  async updateLog(logId: string, updates: Partial<FoodItem>) {
    const dbUpdates: any = {};
    
    // Map frontend fields to DB columns
    if (updates.name !== undefined) dbUpdates.meal_description = updates.name;
    if (updates.calories !== undefined) dbUpdates.calories = String(updates.calories);
    if (updates.protein !== undefined) dbUpdates.proteins = String(updates.protein);
    if (updates.carbs !== undefined) dbUpdates.carbs = String(updates.carbs);
    if (updates.fat !== undefined) dbUpdates.fats = String(updates.fat);
    
    // Note: 'quantity' is managed in local state but not persisted to DB 
    // unless the schema supports it. We skip it here to avoid errors.

    const { error } = await supabase
      .from('Meals')
      .update(dbUpdates)
      .eq('uuid', logId);

    if (error) console.error("Error updating log:", error.message);
  },

  async deleteLog(logId: string) {
    const { error } = await supabase
      .from('Meals')
      .delete()
      .eq('uuid', logId);
      
    if (error) console.error("Error deleting log:", error.message);
  }
};
