const { bot } = require('./telegramBot');
const { startReminderLoop } = require('./reminderService');

async function main() {
  startReminderLoop();
  await bot.launch();
  console.log('Telegram bot is running. Message it to create events.');
}

main().catch((err) => {
  console.error('Fatal error on startup:', err);
  process.exit(1);
});

// Graceful shutdown so Ctrl+C / process managers don't leave a hanging connection.
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
