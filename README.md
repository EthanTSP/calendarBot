# Calendar Bot

Message it in plain English → it creates a Google Calendar event → it pings you on Telegram before class starts.

## Project structure

```
calendar-bot/
├── package.json
├── .env.example        → copy to .env and fill in
├── src/
│   ├── config.js        → loads & validates environment variables
│   ├── googleAuth.js     → one-time script to get your Google refresh token
│   ├── calendarService.js→ create events, list upcoming events
│   ├── geminiParser.js   → turns "Thursday 4pm" into structured JSON
│   ├── telegramBot.js    → receives messages, replies, sends reminders
│   ├── reminderService.js→ polls calendar every 10 min, sends alerts
│   └── index.js          → starts everything
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your Telegram bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`, follow the prompts
3. Copy the token it gives you into `.env` as `TELEGRAM_BOT_TOKEN`

### 3. Get a Gemini API key (free)
1. Go to https://aistudio.google.com/apikey
2. Create a key, put it in `.env` as `GEMINI_API_KEY`

### 4. Set up Google Calendar API access
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Calendar API** (APIs & Services → Library → search "Calendar API" → Enable)
4. Go to APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: **Desktop app**
   - Copy the Client ID and Client Secret into `.env`
5. You may need to configure the OAuth consent screen first (choose "External," add yourself as a test user — this is fine for personal use, you don't need to publish the app)

### 5. Copy the env file and fill it in
```bash
cp .env.example .env
```
Fill in `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
Leave `TELEGRAM_CHAT_ID` and `GOOGLE_REFRESH_TOKEN` blank for now.

### 6. Get your Google refresh token (one-time)
```bash
npm run auth
```
This prints a URL — open it, approve access, paste the code back into the terminal.
It'll print a `GOOGLE_REFRESH_TOKEN` — add that line to your `.env`.

### 7. Start the bot
```bash
npm start
```

### 8. Lock the bot to only you
1. Open Telegram, find your bot, send `/start`
2. It'll reply with your chat ID
3. Add that to `.env` as `TELEGRAM_CHAT_ID`
4. Restart the bot (`npm start` again)

This step matters — without it, anyone who finds your bot's username could create events on your calendar.

## Usage

Just message the bot naturally:
- "put a study session for CS101 Thursday at 4pm"
- "add lunch with Sam tomorrow at noon"
- "block out 2 hours for the essay draft Friday morning"

You'll get a confirmation reply, and a reminder message `REMINDER_MINUTES_BEFORE` minutes (default 15) before each event starts.

## Notes / things to know

- **Timezone**: hardcoded to `Asia/Singapore` in `calendarService.js` and `geminiParser.js`. Change both if you're elsewhere.
- **Reminder dedup**: tracked in memory, so restarting the bot could very rarely cause one duplicate reminder — not a big deal.
- **This only reads/writes your primary calendar** by default (`GOOGLE_CALENDAR_ID=primary` in `.env`) — change it if you want a dedicated calendar for bot-created events.
- **Keeping it running 24/7**: this process needs to stay alive for reminders to fire. Options: deploy to Railway/Render (free tier), run via Termux on a spare Android phone, or a Raspberry Pi. Running `npm start` in a regular terminal only works while that terminal stays open.

## Next steps (not built yet)
- Editing/deleting events via natural language
- "What's on my calendar today" query command
- Multi-day / recurring events
