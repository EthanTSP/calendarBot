const { Telegraf } = require("telegraf");
const config = require("../src/config");
const { parseEventFromText } = require("./chronoParser"); // swapped from geminiParser — no Google AI Studio account needed
const { createEvent } = require("./calendarService");

const bot = new Telegraf(config.telegram.botToken);

// Simple auth guard: only respond to YOUR chat ID once you know it.
// Until TELEGRAM_CHAT_ID is set, the bot replies to anyone (fine for initial testing only).
function isAuthorized(ctx) {
  if (!config.telegram.chatId) return true; // not locked down yet
  return String(ctx.chat.id) === String(config.telegram.chatId);
}

bot.start((ctx) => {
  ctx.reply(
    `Hi! Your chat ID is: ${ctx.chat.id}\n\n` +
      `Add this to your .env as TELEGRAM_CHAT_ID so the bot only listens to you.\n\n` +
      `Then just message me things like:\n"put a study session for CS101 Thursday at 4pm"`,
  );
});

bot.on("text", async (ctx) => {
  if (!isAuthorized(ctx)) {
    return ctx.reply("This bot isn't configured for this chat.");
  }

  const message = ctx.message.text;
  await ctx.reply("Got it, parsing that...");

  try {
    const parsed = await parseEventFromText(message);
    if (!parsed) {
      return ctx.reply(
        "I couldn't figure out an event from that — try rephrasing with a clearer date/time.",
      );
    }

    const event = await createEvent({
      title: parsed.title,
      startISO: parsed.startISO,
      endISO: parsed.endISO,
    });

    const startLocal = new Date(parsed.startISO).toLocaleString("en-SG", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    await ctx.reply(
      `✅ Added "${parsed.title}" — ${startLocal}${event.htmlLink ? `\n${event.htmlLink}` : ""}`,
    );
  } catch (err) {
    console.error("Error handling message:", err);
    await ctx.reply(
      "Something went wrong creating that event — check the logs.",
    );
  }
});

/** Sends a plain text message to the configured chat (used by the reminder loop). */
async function sendReminder(text) {
  if (!config.telegram.chatId) {
    console.warn("TELEGRAM_CHAT_ID not set — cannot send reminder.");
    return;
  }
  await bot.telegram.sendMessage(config.telegram.chatId, text);
}

module.exports = { bot, sendReminder };
