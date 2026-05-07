import axios from 'axios';

const SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY ?? '';
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? '';

export async function fetchProfileFromSheet(email: string): Promise<Record<string, string> | null> {
  if (!SHEETS_API_KEY || !SHEET_ID) return null;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${SHEETS_API_KEY}`;

  try {
    const res = await axios.get(url);
    const rows: string[][] = res.data.values;
    if (!rows || rows.length < 2) return null;

    const headers = rows[0].map((h: string) => h.trim().toLowerCase().replace(/\s+/g, ''));
    const emailIndex = headers.indexOf('email');
    if (emailIndex === -1) return null;

    const userRow = rows.slice(1).find((row) => row[emailIndex]?.toLowerCase() === email.toLowerCase());
    if (!userRow) return null;

    const profile: Record<string, string> = {};
    headers.forEach((header: string, i: number) => {
      if (userRow[i] !== undefined) profile[header] = userRow[i];
    });

    return profile;
  } catch (err) {
    console.error('Google Sheets fetch error:', err);
    return null;
  }
}
