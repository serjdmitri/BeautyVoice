import { Request, Response } from 'express';
import { pool } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export async function getTests(req: AuthRequest, res: Response): Promise<void> {
  const client = await pool.connect();
  try {
    const tests = await client.query(
      `SELECT t.*, ARRAY_AGG(
        JSON_BUILD_OBJECT('id', q.id, 'type', q.type, 'text', q.text, 'options', q.options, 'required', q.required)
        ORDER BY q.position
       ) FILTER (WHERE q.id IS NOT NULL) AS questions
       FROM tests t
       LEFT JOIN questions q ON q.test_id = t.id
       WHERE t.end_date > NOW()
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );
    res.json(tests.rows.map(formatTest));
  } finally {
    client.release();
  }
}

export async function getTestById(req: AuthRequest, res: Response): Promise<void> {
  const { testId } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT t.*, ARRAY_AGG(
        JSON_BUILD_OBJECT('id', q.id, 'type', q.type, 'text', q.text, 'options', q.options, 'required', q.required)
        ORDER BY q.position
       ) FILTER (WHERE q.id IS NOT NULL) AS questions
       FROM tests t
       LEFT JOIN questions q ON q.test_id = t.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [testId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }
    res.json(formatTest(result.rows[0]));
  } finally {
    client.release();
  }
}

export async function submitTest(req: AuthRequest, res: Response): Promise<void> {
  const { testId } = req.params;
  const { answers } = req.body;
  const userId = req.userId!;

  const client = await pool.connect();
  try {
    // Prevent duplicate completions
    const existing = await client.query(
      'SELECT id FROM test_results WHERE test_id = $1 AND user_id = $2',
      [testId, userId]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'You have already completed this test' });
      return;
    }

    const test = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);
    if (test.rows.length === 0) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    const resultId = uuidv4();
    await client.query(
      'INSERT INTO test_results (id, test_id, user_id, answers) VALUES ($1, $2, $3, $4)',
      [resultId, testId, userId, JSON.stringify(answers)]
    );

    // Issue certificate
    const certCode = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const certId = uuidv4();
    await client.query(
      'INSERT INTO certificates (id, code, value, test_id, user_id) VALUES ($1, $2, $3, $4, $5)',
      [certId, certCode, test.rows[0].certificate_value, testId, userId]
    );

    // Update user tests_completed and status
    await client.query(
      'UPDATE users SET tests_completed = tests_completed + 1 WHERE id = $1',
      [userId]
    );

    // Decrement slots if applicable
    if (test.rows[0].slots_remaining !== null) {
      await client.query(
        'UPDATE tests SET slots_remaining = GREATEST(slots_remaining - 1, 0) WHERE id = $1',
        [testId]
      );
    }

    res.status(201).json({
      id: resultId,
      testId,
      userId,
      answers,
      completedAt: new Date().toISOString(),
      certificateEarned: {
        id: certId,
        code: certCode,
        value: test.rows[0].certificate_value,
        testId,
        used: false,
        earnedAt: new Date().toISOString(),
      },
    });
  } finally {
    client.release();
  }
}

export async function sendQuestion(req: AuthRequest, res: Response): Promise<void> {
  const { testId } = req.params;
  const { question, language } = req.body;
  const userId = req.userId!;

  const client = await pool.connect();
  try {
    const user = await client.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [userId]);
    const test = await client.query('SELECT title FROM tests WHERE id = $1', [testId]);

    // In production, send an email here using your email provider.
    // For now, log it and respond with success.
    console.log(`[Question] From: ${user.rows[0]?.email} | Test: ${test.rows[0]?.title} | Lang: ${language} | Q: ${question}`);

    res.json({ success: true });
  } finally {
    client.release();
  }
}

function formatTest(row: any) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    questions: row.questions ?? [],
    certificateValue: row.certificate_value,
    startDate: row.start_date,
    endDate: row.end_date,
    slots: row.slots,
    slotsRemaining: row.slots_remaining,
    images: row.images,
    eventLink: row.event_link,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}
