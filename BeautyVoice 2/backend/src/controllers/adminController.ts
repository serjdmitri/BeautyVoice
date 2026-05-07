import { Request, Response } from 'express';
import { pool } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { sendPushNotifications } from '../services/pushNotifications';

export async function createTest(req: AuthRequest, res: Response): Promise<void> {
  const { title, description, type, certificateValue, slots, startDate, endDate, questions, images, eventLink } = req.body;
  const client = await pool.connect();
  try {
    const testId = uuidv4();
    await client.query(
      `INSERT INTO tests (id, type, title, description, certificate_value, slots, slots_remaining, start_date, end_date, images, event_link, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [testId, type, title, description, certificateValue, slots ?? null, slots ?? null, startDate, endDate, images ?? null, eventLink ?? null, req.userId]
    );

    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await client.query(
          `INSERT INTO questions (id, test_id, type, text, options, required, position) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), testId, q.type, q.text, q.options ? JSON.stringify(q.options) : null, q.required ?? true, i]
        );
      }
    }

    await client.query(
      'INSERT INTO activity_log (actor_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.userId, 'CREATE_TEST', 'test', testId]
    );

    res.status(201).json({ id: testId });
  } finally {
    client.release();
  }
}

export async function getAllTests(req: AuthRequest, res: Response): Promise<void> {
  const client = await pool.connect();
  try {
    // Product managers only see their own tests
    const isMain = req.adminRole === 'main';
    const result = await client.query(
      `SELECT * FROM tests ${isMain ? '' : 'WHERE created_by = $1'} ORDER BY created_at DESC`,
      isMain ? [] : [req.userId]
    );
    res.json(result.rows);
  } finally {
    client.release();
  }
}

export async function getResults(req: AuthRequest, res: Response): Promise<void> {
  const { testId } = req.params;
  const client = await pool.connect();
  try {
    const results = await client.query(
      `SELECT tr.*, u.first_name, u.last_name, u.language
       FROM test_results tr
       JOIN users u ON u.id = tr.user_id
       WHERE tr.test_id = $1
       ORDER BY tr.completed_at DESC`,
      [testId]
    );
    res.json(results.rows.map((row) => ({
      userId: row.user_id,
      userName: `${row.first_name} ${row.last_name}`,
      userLanguage: row.language,
      completedAt: row.completed_at,
      answers: row.answers,
    })));
  } finally {
    client.release();
  }
}

export async function exportExcel(req: AuthRequest, res: Response): Promise<void> {
  const { testId } = req.params;
  const client = await pool.connect();
  try {
    const results = await client.query(
      `SELECT tr.*, u.first_name, u.last_name, u.email, u.language
       FROM test_results tr
       JOIN users u ON u.id = tr.user_id
       WHERE tr.test_id = $1`,
      [testId]
    );

    const rows = results.rows.map((row) => ({
      Name: `${row.first_name} ${row.last_name}`,
      Email: row.email,
      Language: row.language,
      CompletedAt: new Date(row.completed_at).toISOString(),
      ...Object.fromEntries(
        Object.entries(row.answers as Record<string, unknown>).map(([k, v]) => [
          `Q_${k}`,
          Array.isArray(v) ? v.join(', ') : String(v),
        ])
      ),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    const outputDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, `results_${testId}.xlsx`);
    XLSX.writeFile(wb, filePath);

    res.download(filePath, `results_${testId}.xlsx`);
  } finally {
    client.release();
  }
}

export async function sendPush(req: AuthRequest, res: Response): Promise<void> {
  const { testId, messageKey, params } = req.body;
  const client = await pool.connect();
  try {
    const tokens = await client.query(
      'SELECT push_token, language FROM users WHERE push_token IS NOT NULL'
    );
    await sendPushNotifications(tokens.rows, messageKey, params ?? {});
    res.json({ success: true, sent: tokens.rows.length });
  } finally {
    client.release();
  }
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  const client = await pool.connect();
  try {
    const users = await client.query('SELECT * FROM users ORDER BY created_at DESC');
    const certsMap = new Map<string, any[]>();
    const certs = await client.query('SELECT * FROM certificates');
    certs.rows.forEach((c) => {
      if (!certsMap.has(c.user_id)) certsMap.set(c.user_id, []);
      certsMap.get(c.user_id)!.push(c);
    });

    res.json(users.rows.map((u) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone,
      language: u.language,
      status: u.status,
      testsCompleted: u.tests_completed,
      referralCode: u.referral_code,
      certificates: certsMap.get(u.id) ?? [],
      createdAt: u.created_at,
    })));
  } finally {
    client.release();
  }
}

export async function markReferralPaid(req: AuthRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE referrals SET paid = TRUE WHERE referred_id = $1',
      [userId]
    );
    res.json({ success: true });
  } finally {
    client.release();
  }
}
