import { Request, Response } from 'express';
import { pool } from '../models/database';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { fetchProfileFromSheet } from '../services/googleSheets';

function generateReferralCode(userId: string): string {
  return `BV-${userId.slice(0, 6).toUpperCase()}`;
}

function computeStatus(testsCompleted: number): string {
  if (testsCompleted >= 16) return 'Gold';
  if (testsCompleted >= 6) return 'Silver';
  return 'Bronze';
}

export async function register(req: Request, res: Response): Promise<void> {
  const { firstName, lastName, email, phone, language, referralCode } = req.body;

  if (!firstName || !lastName || !email || !phone || !language) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const userId = uuidv4();
    const userReferralCode = generateReferralCode(userId);

    // Pull extra profile data from Google Sheets
    const sheetProfile = await fetchProfileFromSheet(email);

    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, phone, language, referral_code, referred_by, address, hair_type, skin_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        firstName,
        lastName,
        email.toLowerCase(),
        phone,
        language,
        userReferralCode,
        referralCode ?? null,
        sheetProfile?.address ?? null,
        sheetProfile?.hairtype ?? null,
        sheetProfile?.skintype ?? null,
      ]
    );

    // Handle referral relationship
    if (referralCode) {
      const referrer = await client.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
      if (referrer.rows.length > 0) {
        await client.query(
          'INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)',
          [referrer.rows[0].id, userId]
        );
      }
    }

    const user = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    const token = jwt.sign(
      { userId, isAdmin: false, adminRole: null },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.status(201).json({ user: formatUser(user.rows[0]), token });
  } finally {
    client.release();
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const certs = await client.query(
      'SELECT * FROM certificates WHERE user_id = $1 ORDER BY earned_at DESC',
      [userId]
    );

    res.json({ ...formatUser(result.rows[0]), certificates: certs.rows });
  } finally {
    client.release();
  }
}

export async function updateLanguage(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const { language } = req.body;
  const client = await pool.connect();
  try {
    await client.query('UPDATE users SET language = $1 WHERE id = $2', [language, userId]);
    res.json({ success: true });
  } finally {
    client.release();
  }
}

function formatUser(row: any) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    language: row.language,
    status: computeStatus(row.tests_completed),
    testsCompleted: row.tests_completed,
    address: row.address,
    hairType: row.hair_type,
    skinType: row.skin_type,
    referralCode: row.referral_code,
    referredBy: row.referred_by,
    isAdmin: row.is_admin,
    adminRole: row.admin_role,
    certificates: [],
    createdAt: row.created_at,
  };
}
