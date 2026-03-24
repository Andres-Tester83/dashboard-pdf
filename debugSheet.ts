import { google } from 'googleapis';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
});

const SHEET_ID = env['GOOGLE_SHEET_ID'];

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: env['GOOGLE_SERVICE_ACCOUNT_EMAIL'],
      private_key: env['GOOGLE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function debug() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `Empresa!A1:Q100`, // Grab headers too
  });
  
  console.log("Found rows:", response.data.values?.length);
  if (response.data.values) {
    console.log("Headers:");
    console.log(response.data.values[0]);
    console.log("Sample rows:");
    const ingresos = response.data.values.filter(r => r[11] && r[11].toLowerCase().includes('ingreso'));
    fs.writeFileSync('debug.json', JSON.stringify(ingresos, null, 2));
    console.log("Written to debug.json, total ingresos found:", ingresos.length);
  }
}

debug().catch(console.error);
