import { Router } from 'express';
import { register, getProfile, updateLanguage } from '../controllers/authController';
import { getTests, getTestById, submitTest, sendQuestion } from '../controllers/testsController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  createTest, getAllTests, getResults, exportExcel,
  sendPush, getUsers, markReferralPaid,
} from '../controllers/adminController';
import { pool } from '../models/database';

const router = Router();

// Auth
router.post('/auth/register', register);
router.get('/users/:userId', requireAuth, getProfile);
router.patch('/users/:userId/language', requireAuth, updateLanguage);

// Tests
router.get('/tests', requireAuth, getTests);
router.get('/tests/:testId', requireAuth, getTestById);
router.post('/tests/:testId/submit', requireAuth, submitTest);
router.post('/tests/:testId/questions', requireAuth, sendQuestion);

// Events
router.get('/events', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const events = await client.query('SELECT * FROM events ORDER BY date ASC');
    res.json(events.rows.map((e: any) => ({
      id: e.id, title: e.title, date: e.date, time: e.time,
      location: e.location, description: e.description,
      image: e.image, photos: e.photos ?? [],
      tests: e.test_ids ?? [], capacity: e.capacity,
      registeredCount: e.registered_count, createdAt: e.created_at,
    })));
  } finally { client.release(); }
});

router.post('/events/:eventId/register', requireAuth, async (req: any, res) => {
  const { eventId } = req.params;
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [eventId, req.userId]
    );
    await client.query(
      'UPDATE events SET registered_count = registered_count + 1 WHERE id = $1',
      [eventId]
    );
    res.json({ success: true });
  } finally { client.release(); }
});

// Leaderboards
router.get('/leaderboard/testers', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const result = await client.query(
      `SELECT u.id, u.first_name, u.last_name, COUNT(tr.id) AS tests_this_week,
              COUNT(c.id) AS certificates_earned
       FROM users u
       LEFT JOIN test_results tr ON tr.user_id = u.id AND tr.completed_at > $1
       LEFT JOIN certificates c ON c.user_id = u.id AND c.earned_at > $1
       GROUP BY u.id ORDER BY tests_this_week DESC LIMIT 10`,
      [since.toISOString()]
    );
    res.json(result.rows.map((r: any) => ({
      userId: r.id,
      userName: `${r.first_name} ${r.last_name}`,
      testsThisWeek: Number(r.tests_this_week),
      certificatesEarned: Number(r.certificates_earned),
    })));
  } finally { client.release(); }
});

router.get('/leaderboard/referrals', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.first_name, u.last_name, COUNT(r.id) AS referral_count,
              SUM(r.earned_amount) AS total_earned
       FROM users u
       LEFT JOIN referrals r ON r.referrer_id = u.id
       GROUP BY u.id ORDER BY referral_count DESC LIMIT 10`
    );
    res.json(result.rows.map((r: any) => ({
      userId: r.id,
      userName: `${r.first_name} ${r.last_name}`,
      referralCount: Number(r.referral_count),
      earned: Number(r.total_earned ?? 0),
    })));
  } finally { client.release(); }
});

// Admin
router.post('/admin/tests', requireAuth, requireAdmin, createTest);
router.get('/admin/tests', requireAuth, requireAdmin, getAllTests);
router.get('/admin/tests/:testId/results', requireAuth, requireAdmin, getResults);
router.get('/admin/tests/:testId/export', requireAuth, requireAdmin, exportExcel);
router.post('/admin/notifications/push', requireAuth, requireAdmin, sendPush);
router.get('/admin/users', requireAuth, requireAdmin, getUsers);
router.patch('/admin/referrals/:userId/paid', requireAuth, requireAdmin, markReferralPaid);

export default router;
