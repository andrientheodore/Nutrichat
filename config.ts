

// Config.ts
// HOW TO USE:
// 1. Ideally, set these as Environment Variables in your deployment settings.
// 2. If you cannot set env vars, you can paste your keys strings below (not recommended for public repos).

export const config = {
  // Google Gemini API Key
  geminiApiKey: process.env.API_KEY || "", 

  // DeepSeek API Key
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",

  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL || "", // Required for DB
  supabaseKey: process.env.SUPABASE_KEY || "", // Required for DB

  // Telegram Configuration (Optional)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  
  // Feature Flags / Toggles
  isDemoMode: false, 
};

// Helper to check if critical keys are missing
export const checkConfig = () => {
  const missing = [];
  if (!config.supabaseUrl) missing.push("SUPABASE_URL");
  if (!config.supabaseKey) missing.push("SUPABASE_KEY");
  
  if (missing.length > 0) {
    console.warn(`Missing critical keys: ${missing.join(", ")}. App may function in offline/demo mode.`);
    return false;
  }
  return true;
};