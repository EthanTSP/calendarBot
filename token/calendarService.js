const { google } = require('googleapis');
const config = require('../src/config');

function getAuthedClient() {
  if (!config.google.refreshToken) {
    throw new Error('No GOOGLE_REFRESH_TOKEN set. Run `npm run auth` first.');
  }
  const oAuth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  oAuth2Client.setCredentials({ refresh_token: config.google.refreshToken });
  return google.calendar({ version: 'v3', auth: oAuth2Client });
}

/**
 * Creates a calendar event.
 * @param {Object} event
 * @param {string} event.title
 * @param {string} event.startISO - ISO 8601 datetime, e.g. "2026-09-25T16:00:00+08:00"
 * @param {string} event.endISO
 * @param {string} [event.timezone] - defaults to Asia/Singapore, change to your own
 */
async function createEvent({ title, startISO, endISO, timezone = 'Asia/Singapore' }) {
  const calendar = getAuthedClient();
  const res = await calendar.events.insert({
    calendarId: config.google.calendarId,
    requestBody: {
      summary: title,
      start: { dateTime: startISO, timeZone: timezone },
      end: { dateTime: endISO, timeZone: timezone },
    },
  });
  return res.data; // includes res.data.htmlLink if you want to send the user a link
}

/**
 * Returns events starting within the next `withinMinutes` minutes from now.
 * Used by the reminder loop.
 */
async function getUpcomingEvents(withinMinutes) {
  const calendar = getAuthedClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + withinMinutes * 60 * 1000);

  const res = await calendar.events.list({
    calendarId: config.google.calendarId,
    timeMin: now.toISOString(),
    timeMax: windowEnd.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items || [];
}

module.exports = { createEvent, getUpcomingEvents };
