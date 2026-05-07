export type Language = 'en' | 'ru' | 'es';

export type UserStatus = 'Bronze' | 'Silver' | 'Gold';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: Language;
  status: UserStatus;
  testsCompleted: number;
  address?: string;
  hairType?: string;
  skinType?: string;
  referralCode: string;
  referredBy?: string;
  certificates: Certificate[];
  createdAt: string;
}

export type TestType = 'home' | 'offline' | 'online';

export type QuestionType = 'text' | 'rating' | 'single_choice' | 'multiple_choice';

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  required: boolean;
}

export interface Test {
  id: string;
  type: TestType;
  title: string;
  description: string;
  questions: Question[];
  certificateValue: number;
  startDate: string;
  endDate: string;
  slots?: number;
  slotsRemaining?: number;
  images?: string[];
  eventLink?: string;
  createdBy: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  answers: Record<string, string | string[] | number>;
  completedAt: string;
  certificateEarned: Certificate;
}

export interface Certificate {
  id: string;
  code: string;
  value: number;
  testId: string;
  used: boolean;
  earnedAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  photos: string[];
  tests: string[];
  capacity: number;
  registeredCount: number;
  createdAt: string;
}

export interface ReferralEntry {
  userId: string;
  userName: string;
  referralCount: number;
  earned: number;
}

export interface TesterEntry {
  userId: string;
  userName: string;
  testsThisWeek: number;
  certificatesEarned: number;
}

export type AdminRole = 'main' | 'product_manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export type RootStackParamList = {
  Register: undefined;
  LanguageSelect: undefined;
  Main: undefined;
  TestDetail: { testId: string };
  SurveyForm: { testId: string };
  TestComplete: { certificateValue: number };
  EventDetail: { eventId: string };
  AdminMain: undefined;
  CreateTest: undefined;
  EditTest: { testId: string };
  AdminResults: { testId: string };
  AdminUsers: undefined;
};
