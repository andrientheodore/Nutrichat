
import { Message, UserProfile, FoodItem, DailyStats } from '../types';
import { config } from '../config';

const API_URL = 'https://api.deepseek.com/chat/completions';

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
      tool_calls?: any[];
    };
  }[];
}

const tools = [
  {
    type: "function",
    function: {
      name: "appendMealData",
      description: "Store a meal row in the logs after analyzing food input.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Short description of the meal" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" }
        },
        required: ["description", "calories", "protein", "carbs", "fat"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "updateProfileData",
      description: "Update the user's profile targets.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          calorieTarget: { type: "number" },
          proteinTarget: { type: "number" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getUserData",
      description: "Fetch the user's current profile info."
    }
  },
  {
    type: "function",
    function: {
      name: "getReport",
      description: "Generate or fetch the daily report.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "YYYY-MM-DD" }
        },
        required: ["date"]
      }
    }
  }
];

export const deepseekService = {
  async sendMessage(
    apiKey: string,
    messages: any[],
    userProfile: UserProfile,
    todayDate: string
  ): Promise<any> {
    
    // Use passed apiKey or fallback to config
    const key = apiKey || config.deepseekApiKey;

    if (!key) {
        throw new Error("DeepSeek API Key is missing. Please check your settings or environment variables.");
    }

    const systemPrompt = `
You are Cal AI 🏋️‍♂️🥦, your friendly fitness coach and nutrition orchestrator.
Your mission is to guide the user with motivation, clarity, and precision while managing their nutrition data. Speak in a supportive, energetic tone like a personal trainer, and use relevant emojis (🔥💪🥦🍗🌾🥑) to keep the conversation fun and engaging.

You have four tools available:
1. appendMealData(tool) → store a meal row.
2. updateProfileData(tool) → update the user's profile targets.
3. getUserData(tool) → fetch the user's profile info.
4. getReport(tool) → generate or fetch the daily report.

🔑 Rules
The image analysis is done before reaching you (passed as text context if available). You will always receive structured info if the user provides food data.

When analyzing a meal:
1. Call appendMealData.
2. After success, confirm naturally in a coach style (repeat the macros).
3. End with a motivational phrase.

🔄 Profile Update Logic
- Call getUserData first.
- Compare and call updateProfileData with ONLY changed fields.
- Confirm to user.

Current Date: ${todayDate}
Current User Profile: ${JSON.stringify(userProfile)}
    `;

    const conversation = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => {
        const role = m.role === 'model' ? 'assistant' : m.role;
        const apiMessage: any = {
          role: role,
        };

        const rawContent = m.content || m.text;

        // Fix 400 error: Content must be a string for user messages.
        // DeepSeek rejects 'null' content for user/system/tool roles.
        if (role === 'user' || role === 'system' || role === 'tool') {
          apiMessage.content = rawContent || "";
        } else {
          // Assistant: content can be null ONLY if tool_calls are present
          if (!rawContent && (m.tool_calls || m.tool_call_id)) {
            apiMessage.content = null;
          } else {
            apiMessage.content = rawContent || "";
          }
        }

        if (m.tool_calls) apiMessage.tool_calls = m.tool_calls;
        if (m.tool_call_id) apiMessage.tool_call_id = m.tool_call_id;
        if (m.name) apiMessage.name = m.name;

        return apiMessage;
      })
    ];

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: conversation,
          tools: tools,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0].message;

    } catch (error) {
      console.error("DeepSeek Service Error:", error);
      throw error;
    }
  },

  async getNutritionAdvice(
    apiKey: string,
    userProfile: UserProfile,
    stats: DailyStats,
    foodLog: FoodItem[]
  ): Promise<string> {
    
    // Use passed apiKey or fallback to config
    const key = apiKey || config.deepseekApiKey;

    if (!key) {
        return "Please provide a valid DeepSeek API Key in settings to receive advice.";
    }

    const prompt = `
      You are a world-class Nutritionist Advisor.
      
      User Profile:
      - Name: ${userProfile.name}
      - Age: ${userProfile.age ? userProfile.age + ' years' : 'Not specified'}
      - Gender: ${userProfile.gender || 'Not specified'}
      - Height: ${userProfile.height ? userProfile.height + ' cm' : 'Not specified'}
      - Weight: ${userProfile.weight ? userProfile.weight + ' kg' : 'Not specified'}
      - Goals: ${userProfile.calorieTarget} kcal/day, ${userProfile.proteinTarget}g protein/day.
      
      Today's Status:
      - Consumed: ${stats.totalCalories} kcal
      - Protein: ${stats.totalProtein}g
      - Carbs: ${stats.totalCarbs}g
      - Fat: ${stats.totalFat}g
      
      Meals Logged Today:
      ${foodLog.length > 0 ? foodLog.map(f => `- ${f.name} (${f.calories} kcal, P:${f.protein}g)`).join('\n') : "No meals logged yet."}
      
      Task:
      Provide a personalized nutritional analysis (approx. 200 words) incorporating their biometrics.

      Requirements:
      1. **BMR & TDEE Context**: If Age, Weight, Height, and Gender are provided, calculate their BMR (Mifflin-St Jeor equation) and estimate TDEE (assume sedentary x1.2 if unknown). Compare their current intake/goals to these biological baselines.
      2. **Macro Analysis**: Analyze their protein intake relative to their weight (if known, aim for ~1.6-2.2g/kg for active individuals) or lean mass context.
      3. **Status & Adjustments**: Are they on track? What specific macronutrient needs adjustment?
      4. **Actionable Advice**: Provide one concrete food recommendation or habit change.

      Output Format (Use Markdown):
      **Biological Baseline**: [BMR/TDEE calculation and comparison if data exists. Otherwise say "Please update profile with weight/height for BMR analysis."]
      **Daily Analysis**: [Status check and macro split observation]
      **Coach's Recommendation**: [Actionable advice]
      
      Tone: Professional, encouraging, and data-driven.
    `;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("Failed to fetch advice");
      const data: DeepSeekResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Advice Error", error);
      return "Could not generate advice at this time.";
    }
  }
};
