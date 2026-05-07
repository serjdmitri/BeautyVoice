import axios from 'axios';

const SHEETS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SHEETS_API_KEY ?? '';
const SHEET_ID = process.env.EXPO_PUBLIC_SHEET_ID ?? '';

interface SheetProfile {
  email: string;
  address?: string;
  hairType?: string;
  skinType?: string;
  [key: string]: string | undefined;
}

// Pulls user profile data from Google Sheet by email.
// The sheet must have a header row with column names.
export async function fetchProfileFromSheet(email: string): Promise<SheetProfile | null> {
  if (!SHEETS_API_KEY || !SHEET_ID) {
    console.warn('Google Sheets not configured. Skipping profile import.');
    return null;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${SHEETS_API_KEY}`;

  try {
    const res = await axios.get(url);
    const rows: string[][] = res.data.values;
    if (!rows || rows.length < 2) return null;

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const emailIndex = headers.indexOf('email');
    if (emailIndex === -1) return null;

    const userRow = rows.slice(1).find((row) => row[emailIndex]?.toLowerCase() === email.toLowerCase());
    if (!userRow) return null;

    const profile: SheetProfile = { email };
    headers.forEach((header, i) => {
      if (userRow[i] !== undefined) {
        profile[header] = userRow[i];
      }
    });

    return profile;
  } catch (err) {
    console.error('Failed to fetch profile from Google Sheets:', err);
    return null;
  }
}
