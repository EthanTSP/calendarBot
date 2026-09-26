const chrono = require('chrono-node');

/**
 * Parses a message like "put a study session for CS101 Thursday at 4pm"
 * into structured event data — no API calls, runs entirely locally.
 *
 * Strategy: chrono finds the date/time portion of the sentence and tells us
 * exactly which characters it matched. Whatever text is LEFT after removing
 * that matched portion (plus common filler words) becomes the event title.
 *
 * @param {string} message
 * @returns {{title: string, startISO: string, endISO: string} | null}
 */
function parseEventFromText(message) {
  const results = chrono.parse(message, new Date());
  if (results.length === 0) return null;

  const result = results[0];
  const start = result.start.date();

  // If the parsed text includes an explicit end time/date, use it.
  // Otherwise default to a 1-hour event.
  const end = result.end
    ? result.end.date()
    : new Date(start.getTime() + 60 * 60 * 1000);

  // Strip the matched date/time text out of the original message to guess a title.
  let title = message.slice(0, result.index) + message.slice(result.index + result.text.length);

  // Clean up common filler words/phrases so "put a study session for CS101"
  // becomes "study session for CS101" or similar — not perfect, but good enough
  // for a v1. You'll likely want to tweak this list as you see real examples.
  title = title
    .replace(/\b(put|add|schedule|create|set up|book)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!title) title = 'Untitled event';

  return {
    title,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  };
}

module.exports = { parseEventFromText };
