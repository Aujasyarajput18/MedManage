<p align="center">
  <h1 align="center">MedManage</h1>
  <p align="center">
    A free, AI-powered medication management platform built for patients, caregivers, and clinicians across India.
    <br />
    <strong>Progressive Web App &middot; Next.js 14 &middot; Firebase &middot; Gemini 2.0</strong>
    <br />
    <br />
    <a href="https://medmanage-web-aujmed-manage-7iia2tc84-aujasya-rajputs-projects.vercel.app/">View Live App</a>
    &middot;
    <a href="#features">Features</a>
    &middot;
    <a href="#getting-started">Get Started</a>
  </p>
</p>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## About

Medication non-adherence is one of the most persistent and costly challenges in healthcare. Patients with chronic conditions routinely miss doses, risk dangerous drug interactions, and struggle to share accurate medication histories with their doctors. MedManage addresses this with a phone-first Progressive Web App that anyone can access instantly through a URL -- no app store, no downloads, no friction.

The platform combines real-time dose tracking, AI-driven safety features powered by Google Gemini 2.0 Flash, an SOS emergency system, gamified adherence streaks, and multi-language support for 12 Indian languages. It is built with accessibility as a core design principle: high-contrast interfaces, large tap targets, and a warm visual language that avoids the clinical feel of typical health apps.

**Try it instantly** -- tap "Try interactive demo" on the landing page to explore a fully populated prototype with realistic sample data. No login required.

### Why a PWA?

Not every user knows how to -- or wants to -- download an app from a store. MedManage ships as a Progressive Web App that can be installed to the home screen from any browser. A caregiver can send a single link to an elderly parent and they have full access in seconds. When opened on desktop, the app wraps itself in a simulated phone frame so doctors and family members can manage the account on a larger screen while preserving the exact mobile interface.

---

## Features

### Dose Management
- Add, edit, and delete medications with dosage, frequency, schedule times, and notes
- Log doses as taken, skipped, or missed with a single tap
- Automatic pill count tracking with decrement on each logged dose
- Refill awareness based on remaining inventory

### AI Pill Identifier
Photograph a pill, blister pack, or medicine bottle. Google Gemini 2.0 Flash Vision analyzes the image and extracts the medicine name, dosage, form factor (tablet, capsule, syrup), and clinical notes. Results pre-fill the Add Medicine form, eliminating the need to type complex drug names on small screens.

### AI Drug Interaction Checker
When a new medicine is added, the system cross-references it against the user's existing prescriptions via Gemini. Potentially dangerous interactions are flagged with severity-graded warnings before the entry is saved.

### AI Food Warnings
Get AI-generated guidance on food and beverage interactions for each medicine -- what to avoid, what to take with meals, and timing considerations.

### AI Missed Dose Guidance
If a dose is missed, the AI provides personalized advice on whether to take it late, skip it, or adjust the next dose based on the specific medication.

### SOS Emergency System
A single-tap emergency button accessible from every screen via a floating action button. When triggered:
1. A 7-second countdown begins with a prominent cancel option
2. SMS messages are dispatched to all saved emergency contacts via the Fast2SMS API
3. Failed deliveries are retried automatically
4. Optional GPS coordinates are appended when location permission is granted

Emergency contacts are managed in Settings with validation (numeric, 7-15 digits).

### Adherence Calendar
A color-coded monthly grid inspired by iOS health interfaces. Days are marked green (all taken), yellow (partial), or red (missed). Tapping a day reveals the full timestamped dose history. Provides an at-a-glance compliance view for both patients and clinicians during checkups.

### Reminder Engine
A client-side polling engine that checks for due reminders every 30 seconds:
- Fires in-app alerts and FCM push notifications when a dose is due
- Opens a 15-minute response window for the user to act
- If no response: retries every 5 minutes, up to 3 times
- Push notifications include actionable buttons: Taken, Snooze, Skip
- Service worker handles background notification delivery

### Health Journal
Log daily vitals and observations including:
- Blood pressure, blood glucose, weight
- Mood tracking with a 5-level scale
- Free-text notes for symptoms and side effects

Entries are timestamped and stored in Firestore for longitudinal review.

### Insights and Analytics
Surfaces patterns and trends from dose logs and journal entries. Helps users and clinicians identify correlations between adherence, vitals, and symptoms over time.

### Gamification and Streaks
- Points awarded for on-time dose logging (+10 per dose, +5 streak bonus)
- Consecutive day streaks with visual tracking
- Unlockable badges (7-day streak, perfect day, AI explorer, and more)
- Points and badge system stored in Firestore user profile

### Appointment Tracking
Schedule and track doctor visits and follow-ups with date/time entries, linked to the user's medication profile.

### Doctor Report Export
One-click generation of formatted adherence reports suitable for sharing with healthcare providers before appointments.

### Family Profiles
Manage multiple patient profiles for caregivers and family members monitoring medication for elderly relatives or dependents.

### PIN Lock Security
- Optional 4-digit PIN lock with SHA-256 hashed storage (no plain text)
- Auto-lock after configurable inactivity period (default: 5 minutes)
- Activity tracking resets the lock timer on any user interaction

### Dark and Light Themes
Full theme system with dark mode as default. Persisted to localStorage and applied via CSS custom properties across the entire design system.

### Multi-Language Support
Interface localization for 12 Indian languages with a real-time DOM translation engine:

| Language | Script |
|----------|--------|
| English | English |
| Hindi | Devanagari |
| Bengali | Bengali |
| Telugu | Telugu |
| Marathi | Devanagari |
| Tamil | Tamil |
| Gujarati | Gujarati |
| Urdu | Arabic (RTL supported) |
| Kannada | Kannada |
| Odia | Odia |
| Malayalam | Malayalam |
| Punjabi | Gurmukhi |

Medicine names are deliberately kept in English to maintain pharmacological accuracy across all languages.

### Interactive Demo Mode
Seeded with realistic sample data (5 medicines, journal entries, streaks, badges) so evaluators can explore the full app experience without creating an account. All demo data is stored in localStorage and is fully interactive.

### Guided Onboarding
A step-by-step tutorial that walks new users through the app's features on first login. Can be replayed anytime from the Settings menu.

### Offline Support
An offline banner detects network loss and notifies the user. PWA service worker caching ensures core assets remain available during temporary disconnections.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Server-side rendering, API routes, file-based routing |
| UI | React 18 | Component architecture and state management |
| Styling | Vanilla CSS + CSS Modules | Design system with custom properties, no utility frameworks |
| Typography | Nunito (Google Fonts) | Warm, readable typeface optimized for accessibility |
| Authentication | Firebase Auth | Email/password and Google sign-in |
| Database | Cloud Firestore | Real-time NoSQL with offline persistence and live subscriptions |
| AI Engine | Google Gemini 2.0 Flash | Vision-based pill identification, drug interactions, food warnings |
| SMS | Fast2SMS API | SOS emergency message dispatch |
| Push Notifications | Firebase Cloud Messaging | Web push with service worker background delivery |
| State Management | React Context | Auth, Theme, and Language providers |
| PIN Security | Web Crypto API (SHA-256) | Hashed PIN storage with inactivity auto-lock |
| Hosting | Vercel | Edge-deployed with instant global distribution |

---

## Architecture

```
medmanage-web/
|
|-- app/                          # Next.js App Router
|   |-- page.js                   # Landing page with product showcase
|   |-- layout.js                 # Root layout (Auth, Theme, Language providers)
|   |-- auth/                     # Login and signup pages
|   |-- onboarding/               # Guided tutorial flow
|   |-- dashboard/                # Authenticated app shell
|   |   |-- layout.js             # Dashboard chrome (nav, header, drawer, SOS)
|   |   |-- page.js               # Home dashboard with schedule and stats
|   |   |-- medicines/            # Medicine CRUD, pill identifier, interaction checker
|   |   |-- calendar/             # Adherence calendar view
|   |   |-- reminders/            # Reminder management
|   |   |-- journal/              # Health journal entries
|   |   |-- analytics/            # Insights and trend analysis
|   |   |-- achievements/         # Gamification, streaks, badges
|   |   |-- appointments/         # Doctor appointment tracking
|   |   |-- sos/                  # SOS configuration and trigger
|   |   |-- export/               # Doctor report generation
|   |   |-- profiles/             # Family and caregiver profiles
|   |   `-- settings/             # Preferences, theme, language, PIN
|   |-- api/                      # Server-side API routes
|   |   |-- ai/                   # Gemini endpoints
|   |   |   |-- identify-pill/    # Vision-based pill identification
|   |   |   |-- interactions/     # Drug interaction analysis
|   |   |   |-- food-warnings/    # Food interaction guidance
|   |   |   `-- missed-dose/      # Missed dose advice
|   |   |-- sos/send/             # Fast2SMS dispatch
|   |   |-- doses/mark/           # Dose logging endpoint
|   |   `-- reminders/            # Reminder action processing
|   |-- privacy/                  # Privacy policy page
|   `-- terms/                    # Terms of service page
|
|-- components/                   # Reusable UI components
|   |-- ai/                       # AI feature interfaces
|   |-- dashboard/                # Dashboard widgets
|   |-- medicine/                 # Medicine cards, forms, lists
|   |-- calendar/                 # Calendar grid and day detail
|   |-- sos/                      # SOS button, contact manager
|   |-- caregiver/                # Caregiver monitoring views
|   |-- gamification/             # Streak counters, badge displays
|   |-- insights/                 # Analytics charts and cards
|   |-- journal/                  # Journal entry form and list
|   |-- export/                   # Report builder components
|   |-- onboarding/               # Onboarding step components
|   |-- layout/                   # Navigation, phone frame
|   `-- ui/                       # Shared primitives (FloatingSOS, OfflineBanner, PhoneFrame)
|
|-- context/                      # React context providers
|   |-- AuthContext.js             # Firebase auth state
|   |-- ThemeContext.js            # Dark/light theme management
|   `-- LanguageContext.js         # i18n with real-time DOM translation
|
|-- hooks/                        # Custom React hooks
|   |-- useMedicines.js           # Medicine subscription
|   |-- useNotifications.js       # FCM permission and token
|   |-- usePin.js                 # PIN lock lifecycle
|   `-- useStreak.js              # Streak and points reader
|
|-- lib/                          # Core business logic
|   |-- firebase.js               # Firebase app initialization
|   |-- auth.js                   # Auth operations (email, Google, sign-out, reset)
|   |-- firestore.js              # All Firestore CRUD (medicines, doses, SOS, journal, etc.)
|   |-- gemini.js                 # Gemini API client (text + vision)
|   |-- reminderEngine.js         # Client-side reminder polling and escalation
|   |-- reminderStore.js          # Reminder persistence layer
|   |-- notifications.js          # FCM token management and push handling
|   |-- pin.js                    # PIN hashing, verification, lock state
|   |-- demo.js                   # Demo data seeding and management
|   |-- theme.js                  # Theme utilities
|   |-- translations.js           # 12-language translation dictionaries
|   `-- uiTranslations.js         # UI text translation mappings
|
|-- styles/
|   `-- globals.css               # Design system (custom properties, tokens, utilities)
|
|-- public/                       # Static assets (icons, manifest, service worker)
`-- functions/                    # Firebase Cloud Functions
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- A Firebase project with Authentication and Firestore enabled
- API keys for Gemini and Fast2SMS (both have free tiers)

### Installation

```bash
cd medmanage-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Quick Demo (No Setup Required)

To explore the app without configuring Firebase, click "Try interactive demo" on the landing page. The demo seeds realistic sample data into localStorage and runs entirely client-side.

---

The app is currently live at:  
**https://medmanage-web-aujmed-manage-7iia2tc84-aujasya-rajputs-projects.vercel.app/**

### Install as Native App (PWA)

Once deployed, users can install MedManage to their home screen:
- **Android (Chrome):** Tap the three-dot menu > "Add to Home Screen"
- **iOS (Safari):** Tap the share icon > "Add to Home Screen"

The app launches in standalone mode with no browser chrome, behaving like a native application.

---

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js 14 App Router -- pages, layouts, and API routes |
| `components/` | 14 component modules organized by feature domain |
| `context/` | React context providers for Auth, Theme, and Language |
| `hooks/` | Custom hooks for medicines, notifications, PIN, and streaks |
| `lib/` | Core business logic: Firebase, Gemini, reminders, auth, demo, i18n |
| `styles/` | Global CSS design system with custom properties |
| `public/` | Static assets, PWA manifest, service worker |
| `functions/` | Firebase Cloud Functions |

---

## Future Roadmap

### Notification Escalation
- Automated voice call fallback when a critical dose is missed after all push notification retries are exhausted (architecture is in place -- `triggerVoiceCall` placeholder exists in the reminder engine).

### Platform Expansion
- Native Android and iOS builds using React Native or Flutter for deeper OS-level alarm integration.
- Wear OS and Apple Watch companion apps for wrist-based dose logging.

### Clinical Integration
- FHIR-compliant data export for interoperability with electronic health record (EHR) systems.
- Clinic dashboard (SaaS) for healthcare providers to monitor patient cohorts remotely.
- Automated pre-appointment adherence reports delivered directly to clinicians.

### Caregiver Enhancements
- Real-time push notifications to family members when a patient takes or misses a dose.
- Role-based access control with distinct permissions for family, nursing staff, and physicians.
- Multi-patient management for professional caregivers.

### Intelligence
- Predictive refill alerts based on dosage frequency and remaining pill count.
- Longitudinal adherence analytics with risk scoring.
- Natural language symptom search across journal entries.

### Accessibility
- Voice-guided medication logging for visually impaired users.
- Full offline-first architecture with background sync.
- SMS-based fallback interface for feature phone users in low-connectivity regions.

### Security
- Biometric authentication (fingerprint, face recognition) as an alternative to PIN lock.
- End-to-end encryption for shared caregiver data channels.
- HIPAA and DPDP Act compliance certification.

### Monetization (Planned)
- Freemium B2C subscription (MedManage Pro) for advanced caregiver sync, automated health reports, and priority SOS dispatch.
- B2B e-pharmacy affiliate integration for predictive medication refills.
- Clinic and hospital SaaS subscriptions for adherence monitoring dashboards.

---

## Health Checks

```bash
cd medmanage-web

# Lint
npm run lint

# Production build verification
npm run build
```

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: description of change"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description of the changes and their motivation.

Please ensure all contributions pass `npm run lint` before submitting.

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

Copyright (c) 2026 Aujasya Rajput

---

<p align="center">
  Built with precision for the people who need it most.
</p>
