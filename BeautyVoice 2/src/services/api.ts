import axios from 'axios';
import { User, Test, TestResult, Event, Language } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const client = axios.create({ baseURL: BASE_URL });

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// Auth
export async function apiRegister(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: Language;
}): Promise<{ user: User; token: string }> {
  const res = await client.post('/auth/register', payload);
  return res.data;
}

export async function apiGetProfile(userId: string, token: string): Promise<User> {
  const res = await client.get(`/users/${userId}`, authHeader(token));
  return res.data;
}

export async function apiUpdateLanguage(userId: string, language: Language, token: string): Promise<void> {
  await client.patch(`/users/${userId}/language`, { language }, authHeader(token));
}

// Tests
export async function apiFetchTests(token: string): Promise<Test[]> {
  const res = await client.get('/tests', authHeader(token));
  return res.data;
}

export async function apiFetchTestById(testId: string, token: string): Promise<Test> {
  const res = await client.get(`/tests/${testId}`, authHeader(token));
  return res.data;
}

export async function apiSubmitTest(payload: {
  testId: string;
  answers: Record<string, string | string[] | number>;
  token: string;
}): Promise<TestResult> {
  const { testId, answers, token } = payload;
  const res = await client.post(`/tests/${testId}/submit`, { answers }, authHeader(token));
  return res.data;
}

export async function apiSendQuestion(payload: {
  testId: string;
  question: string;
  language: Language;
  token: string;
}): Promise<void> {
  const { testId, question, language, token } = payload;
  await client.post(`/tests/${testId}/questions`, { question, language }, authHeader(token));
}

// Events
export async function apiFetchEvents(token: string): Promise<Event[]> {
  const res = await client.get('/events', authHeader(token));
  return res.data;
}

export async function apiRegisterForEvent(eventId: string, token: string): Promise<void> {
  await client.post(`/events/${eventId}/register`, {}, authHeader(token));
}

// Leaderboards
export async function apiFetchTopTesters(token: string) {
  const res = await client.get('/leaderboard/testers', authHeader(token));
  return res.data;
}

export async function apiFetchReferralRanking(token: string) {
  const res = await client.get('/leaderboard/referrals', authHeader(token));
  return res.data;
}

// Admin
export async function apiAdminCreateTest(payload: Partial<Test>, token: string): Promise<Test> {
  const res = await client.post('/admin/tests', payload, authHeader(token));
  return res.data;
}

export async function apiAdminGetAllTests(token: string): Promise<Test[]> {
  const res = await client.get('/admin/tests', authHeader(token));
  return res.data;
}

export async function apiAdminGetResults(testId: string, token: string) {
  const res = await client.get(`/admin/tests/${testId}/results`, authHeader(token));
  return res.data;
}

export async function apiAdminExportExcel(testId: string, token: string): Promise<string> {
  const res = await client.get(`/admin/tests/${testId}/export`, authHeader(token));
  return res.data.downloadUrl;
}

export async function apiAdminSendPush(payload: {
  testId: string;
  messageKey: string;
  params?: Record<string, string>;
  token: string;
}): Promise<void> {
  const { testId, messageKey, params, token } = payload;
  await client.post('/admin/notifications/push', { testId, messageKey, params }, authHeader(token));
}

export async function apiAdminGetUsers(token: string): Promise<User[]> {
  const res = await client.get('/admin/users', authHeader(token));
  return res.data;
}

export async function apiAdminMarkReferralPaid(userId: string, token: string): Promise<void> {
  await client.patch(`/admin/referrals/${userId}/paid`, {}, authHeader(token));
}
