
import { config } from "../config";

const BOT_TOKEN = config.telegramBotToken;
const CHAT_ID = config.telegramChatId;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const telegramService = {
  async sendText(text: string) {
    if (!text || !BOT_TOKEN || !CHAT_ID) return;
    try {
      await fetch(`${API_BASE}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
        }),
      });
    } catch (e) {
      console.error('Telegram Send Text Error:', e);
    }
  },

  async sendPhoto(base64Image: string, caption?: string) {
    if (!BOT_TOKEN || !CHAT_ID) return;
    try {
      const blob = await base64ToBlob(base64Image);
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', blob, 'image.jpg');
      if (caption) formData.append('caption', caption);

      await fetch(`${API_BASE}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
    } catch (e) {
      console.error('Telegram Send Photo Error:', e);
    }
  },

  async sendVoice(base64Audio: string, mimeType: string = 'audio/webm') {
    if (!BOT_TOKEN || !CHAT_ID) return;
    try {
      // mimeType from MediaRecorder is often 'audio/webm;codecs=opus'
      // Telegram prefers specific extensions/mimes, but handles uploads well.
      const blob = await base64ToBlob(base64Audio);
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('voice', blob, 'voice.ogg');

      await fetch(`${API_BASE}/sendVoice`, {
        method: 'POST',
        body: formData,
      });
    } catch (e) {
      console.error('Telegram Send Voice Error:', e);
    }
  },

  async logToTelegram(text: string, imageBase64?: string, audioBase64?: string) {
    if (!BOT_TOKEN || !CHAT_ID) return;
    
    // Send components in sequence or parallel
    const promises = [];
    
    if (imageBase64) {
      promises.push(this.sendPhoto(imageBase64, text));
    } else if (text) {
      promises.push(this.sendText(text));
    }

    if (audioBase64) {
      promises.push(this.sendVoice(audioBase64));
    }

    await Promise.allSettled(promises);
  }
};

async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}
