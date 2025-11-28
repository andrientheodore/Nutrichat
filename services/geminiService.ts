
import { GoogleGenAI } from "@google/genai";
import { config } from "../config";

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

const ANALYSIS_PROMPT = `
Estimation method (internal only; do not output these steps)

Identify components: list the main foods (e.g., chicken breast, white rice, mixed salad, sauce) based on the input (visual or audio description).

Choose references: map each component to a standard reference food.

Estimate volume/size: use visible objects for scale or context clues from description. Approximate shapes/portions.

Convert to grams (densities, g/ml): meats 1.05; cooked rice 0.66; cooked pasta 0.60; potato/solid starchy veg 0.80; leafy salad 0.15; sauces creamy 1.00; oils 0.91. If the image clearly suggests deep-fried or glossy/oily coating, account for added oil.

Macros & energy per 100 g (reference values):

White rice, cooked: 130 kcal, P 2.7, C 28, F 0.3

Pasta, cooked: 131 kcal, P 5.0, C 25, F 1.1

Chicken breast, cooked skinless: 165 kcal, P 31, C 0, F 3.6

Salmon, cooked: 208 kcal, P 20, C 0, F 13

Lean ground beef (≈10% fat), cooked: 217 kcal, P 26, C 0, F 12

Black beans, cooked: 132 kcal, P 8.9, C 23.7, F 0.5

Potato, baked: 93 kcal, P 2.5, C 21, F 0.1

Lettuce/leafy salad: 15 kcal, P 1.4, C 2.9, F 0.2

Avocado: 160 kcal, P 2, C 9, F 15

Bread (white): 265 kcal, P 9, C 49, F 3.2

Egg, cooked: 155 kcal, P 13, C 1.1, F 11

Cheddar cheese: 403 kcal, P 25, C 1.3, F 33

Olive oil: 884 kcal, P 0, C 0, F 100
(If a food is not listed, pick the closest standard equivalent.)

Hidden oil & sauces: if pan-fried or visibly glossy, add ~1 tablespoon oil = 13.5 g = 120 kcal = 13.5 g fat per clearly coated serving; adjust by visual coverage.

Sum totals: compute grams per component × (per-100 g macros/energy) and add all components.

Validation: enforce Calories ≈ 4×Protein + 4×Carbs + 9×Fat. If off by >8%, adjust fat first (oil/sauce most variable), then carbs (starches), keeping protein consistent with visible lean mass.

Rounding: round all final totals to integers. Never output ranges or decimals.

Output rules (must follow exactly)

Plain text only.

Use this exact structure and field order.

Values are numbers only (no units, no “g” or “kcal”), no extra text, no JSON, no notes.

Meal Description: [short description]
Calories: [number]
Proteins: [number]
Carbs: [number]
Fat: [number]
`;

export const geminiService = {
  async analyzeImage(base64DataURI: string): Promise<string> {
    try {
      if (!config.geminiApiKey) {
        return "Error: API Key missing. Please configure API_KEY.";
      }

      // Extract MIME type and Base64 data
      const matches = base64DataURI.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return "Error: Invalid image format.";
      }
      
      const mimeType = matches[1];
      const data = matches[2];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType, data } },
            { text: ANALYSIS_PROMPT }
          ]
        }
      });

      return response.text || "Could not analyze image.";
    } catch (error) {
      console.error("Gemini Image Analysis Error:", error);
      return "Error analyzing image. Please ensure API Key is valid.";
    }
  },

  async analyzeAudio(base64DataURI: string): Promise<string> {
    try {
      if (!config.geminiApiKey) {
        return "Error: API Key missing. Please configure API_KEY.";
      }

      const matches = base64DataURI.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return "Error: Invalid audio format.";
      }

      let mimeType = matches[1].toLowerCase().trim();
      const data = matches[2];

      if (mimeType === 'application/octet-stream' || !mimeType) {
        console.warn("Gemini Service: Detected application/octet-stream or missing type, defaulting to audio/webm");
        mimeType = 'audio/webm';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType, data } },
            { text: "Analyze this voice note describing a meal. " + ANALYSIS_PROMPT }
          ]
        }
      });

      return response.text || "Could not analyze audio.";
    } catch (error) {
      console.error("Gemini Audio Analysis Error:", error);
      return "Error analyzing audio. Please ensure API Key is valid.";
    }
  }
};
