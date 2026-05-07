import { UserStatus } from '../types';

export function computeStatus(testsCompleted: number): UserStatus {
  if (testsCompleted >= 16) return 'Gold';
  if (testsCompleted >= 6) return 'Silver';
  return 'Bronze';
}

export function formatDate(isoString: string, locale: string = 'en-US'): string {
  return new Date(isoString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateReferralCode(userId: string): string {
  return `BV-${userId.slice(0, 6).toUpperCase()}`;
}

export function statusColor(status: UserStatus): string {
  switch (status) {
    case 'Gold':
      return '#FFD700';
    case 'Silver':
      return '#C0C0C0';
    case 'Bronze':
    default:
      return '#CD7F32';
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
