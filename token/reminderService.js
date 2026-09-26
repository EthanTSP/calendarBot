const cron = require("node-cron");
const config = require("../src/config");
const { getUpcomingEvents } = require("./calendarService");
const { sendReminder } = require("./telegramBot");

// Tracks which event IDs we've already reminded about, so a 10-minute poll
// interval on a 15-minute window doesn't send the same reminder 2-3 times.
// In-memory is fine for a personal single-instance bot; it resets on restart,
// which just means a small chance of one duplicate reminder after a restart — harmless.
const remindedEventIds = new Set();

async function checkAndSendReminders() {
  try {
    const events = await getUpcomingEvents(config.reminderMinutesBefore);

    for (const event of events) {
      if (remindedEventIds.has(event.id)) continue;

      const start = event.start.dateTime || event.start.date; // all-day events use .date instead
      const startLocal = new Date(start).toLocaleString("en-SG", {
        hour: "numeric",
        minute: "2-digit",
      });

      await sendReminder(
        `⏰ Reminder: "${event.summary}" starts at ${startLocal}`,
      );
      remindedEventIds.add(event.id);
    }

    // Prevent unbounded memory growth over weeks/months of uptime.
    if (remindedEventIds.size > 1000) remindedEventIds.clear();
  } catch (err) {
    console.error("Error checking reminders:", err);
  }
}

function startReminderLoop() {
  // Runs every 10 minutes. Must be more frequent than reminderMinutesBefore
  // or you could miss the window entirely.
  cron.schedule("*/5 * * * *", checkAndSendReminders);
  console.log("Reminder loop started (checking every 5 minutes).");
}

module.exports = { startReminderLoop, checkAndSendReminders };
