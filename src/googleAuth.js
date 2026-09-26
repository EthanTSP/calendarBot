/**
 * Run this ONCE with `npm run auth` to get a Google Calendar refresh token.
 * It opens a URL you visit in your browser, you approve access, paste back
 * the code it gives you, and this prints a refresh token to put in .env.
 * You do NOT need to run this again unless you revoke access.
 */
require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// "urn:ietf:wg:oauth:2.0:oob" is the flow for apps with no web server —
// perfect for a personal script like this.
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // required to get a refresh token, not just a short-lived access token
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent', // forces Google to re-issue a refresh token even if you've authed before
});

console.log('\n1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Approve access, then copy the code Google shows you.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('3. Paste the code here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    console.log('\n✅ Success! Add this line to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (err) {
    console.error('Error retrieving access token:', err.message);
  }
});
