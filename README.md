# BeautyVoice Testing App

Mobile app for cosmetic product testing. Testers participate in home, offline, and online tests, earn certificates, and track their status. Admins manage tests, view real-time results, and export data to Excel.

Built with Expo (React Native) + TypeScript. Backend is a separate Node.js/TypeScript service.

---

## Features

- **Three test types**: home tests (samples mailed to user), offline tests (at events), online tests (image/packaging evaluation)
- **Multilingual**: English, Russian, Spanish. Language selected at registration, changeable anytime. All UI, questions, and push notifications translate automatically.
- **Profile import**: After registration, the app pulls the user's full profile from a Google Sheet by email.
- **Rewards**: Certificate earned per completed test, redeemable on the website. Referral program pays $25 per successful invite.
- **Gamification**: Bronze/Silver/Gold status levels, weekly Top-10 tester announcements, referral leaderboard.
- **Events**: Users can browse and register for in-person events. Admins upload photo galleries per event.
- **Admin panel** (web): Multi-role access. Main admin has full control. Product managers see only their own tests. Activity log tracks all changes.
- **Export**: All test results downloadable as formatted Excel files, with user language indicated.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Mobile app | Expo (React Native), TypeScript |
| Navigation | React Navigation v6 |
| State | Redux Toolkit |
| i18n | i18next + react-i18next |
| Backend | Node.js + TypeScript (Express) |
| Database | PostgreSQL |
| Push notifications | Expo Notifications |
| Profile sync | Google Sheets API |
| Photo storage | Cloud storage (AWS S3 or equivalent) |

---

## Project Structure

```
BeautyVoice/
├── src/
│   ├── screens/
│   │   ├── auth/           # Registration, language selection
│   │   ├── home/           # Main dashboard
│   │   ├── tests/          # Home, offline, online test screens
│   │   ├── profile/        # User profile
│   │   ├── events/         # Event list and detail
│   │   └── admin/          # Admin dashboard, create test, results
│   ├── components/         # Reusable UI components
│   ├── navigation/         # App and admin navigators
│   ├── i18n/               # Translation files (en.json, ru.json, es.json)
│   ├── services/           # API calls, Google Sheets, notifications, local storage
│   ├── store/              # Redux slices and store config
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Helper functions
├── backend/                # Express API server
├── .env.example
├── app.json
├── App.tsx
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo`
- Expo Go app on your phone (iOS or Android)

### Install

```bash
git clone https://github.com/serjdmitri/BeautyVoice.git
cd BeautyVoice
npm install
```

### Environment setup

```bash
cp .env.example .env
```

Fill in your values:

```
API_BASE_URL=https://your-backend-url.com
GOOGLE_SHEETS_API_KEY=your_key_here
EXPO_PUBLIC_PUSH_TOKEN=
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone. For Android emulator: press `a`. For iOS simulator: press `i`.

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:3000` by default.

---

## i18n (Translations)

Translation files live in `src/i18n/`. Each language has its own JSON file:

```
src/i18n/
├── en.json
├── ru.json
└── es.json
```

To add a new string, add it to all three files. If admin creates a test title in one language, the backend auto-translates it to the other two before saving.

---

## User Flow

1. User fills short form on website
2. Receives email invite to fill long form (25 questions)
3. Receives test invitation via email/WhatsApp + app download link
4. Registers in app (first name, last name, email, phone) and selects language
5. App pulls full profile from Google Sheet by email
6. User sees available tests in their language and participates
7. Earns certificates after each completed test

---

## Status Levels

| Status | Tests Completed |
|---|---|
| Bronze | 1-5 |
| Silver | 6-15 |
| Gold (Beauty Expert) | 16+ |

---

## Admin Roles

- **Main admin (full access)**: create/edit/delete any test, view all results, manage events, manage users, view activity log
- **Product manager**: create and manage only their own tests, view only their own results

---

## Roadmap

- [ ] Registration screen + Google Sheet profile import
- [ ] Language selection and i18n setup
- [ ] Home test flow (survey + certificate)
- [ ] Offline test flow
- [ ] Online test flow (image evaluation)
- [ ] Push notifications
- [ ] Events screen with photo gallery
- [ ] Referral program + leaderboard
- [ ] Admin panel (web)
- [ ] Excel export
- [ ] Backend API + PostgreSQL
- [ ] Cloud photo storage

---

## Contributing

This is a private project. Contact the repo owner for access.

---

## License

Private. All rights reserved.
