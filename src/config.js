require("dotenv").config();

// Fail fast and loudly if something required is missing, instead of
// getting a confusing error three files deep later.
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`,
    );
  }
  return value;
}

module.exports = {
  telegram: {
    botToken: required("TELEGRAM_BOT_TOKEN"),
    // Not required at boot — you might not know it yet on first run.
    chatId: process.env.TELEGRAM_CHAT_ID || null,
  },
  gemini: {
    // Optional now — chronoParser.js is the active parser and needs no API key.
    // Only required again if you switch telegramBot.js back to geminiParser.js.
    apiKey: process.env.GEMINI_API_KEY || null,
  },
  google: {
    clientId: required("GOOGLE_CLIENT_ID"),
    clientSecret: required("GOOGLE_CLIENT_SECRET"),
    // Not required at boot — doesn't exist until you run `npm run auth` once.
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || null,
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
  },
  reminderMinutesBefore: Number(process.env.REMINDER_MINUTES_BEFORE || 15),
};
