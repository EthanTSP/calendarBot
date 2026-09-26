const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

/**
 * Sends a natural language message to Gemini and asks it to return
 * strict JSON describing the event. Returns null if it can't parse.
 *
 * @param {string} message - e.g. "put a study session for CS101 Thursday at 4pm"
 * @returns {Promise<{title: string, startISO: string, endISO: string} | null>}
 */
async function parseEventFromText(message) {
  const now = new Date();
  // Giving the model "today's date" is essential — otherwise it has no idea
  // what "Thursday" or "tomorrow" actually resolves to.
  const todayContext = now.toISOString();

  const prompt = `You are a calendar assistant. Convert the user's message into a JSON object
describing a calendar event. Today's date/time is: ${todayContext} (ISO 8601, Asia/Singapore timezone).

Rules:
- Resolve relative dates ("Thursday", "tomorrow", "next week") based on today's date above.
- If no duration is mentioned, default to 1 hour.
- If no time is mentioned at all, use 09:00 as a fallback start time.
- Respond with ONLY raw JSON, no markdown formatting, no code fences, no explanation.
- JSON shape: {"title": string, "startISO": string, "endISO": string}
- startISO and endISO must be full ISO 8601 datetimes with timezone offset, e.g. "2026-09-25T16:00:00+08:00"

User message: "${message}"`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    // Strip accidental code fences just in case the model adds them anyway.
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.title || !parsed.startISO || !parsed.endISO) return null;
    return parsed;
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON:', text);
    return null;
  }
}

module.exports = { parseEventFromText };
