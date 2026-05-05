import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import OfflineBanner from '@/components/ui/OfflineBanner';
import PhoneFrame from '@/components/ui/PhoneFrame';

export const metadata = {
  title:       'MedManage — Free Medication Tracker for India',
  description: 'Never miss a dose. AI-powered drug interaction checker, SOS emergency alerts, gamified streaks. Free forever. The best Medisafe alternative in India.',
  keywords:    'medication reminder, medicine tracker, medisafe alternative, india, free, pill reminder, drug interaction checker',
  openGraph: {
    title:       'MedManage — Free Medication Tracker',
    description: 'AI-powered. SOS emergency. Gamified streaks. Free forever.',
    type:        'website',
  },
};

export const viewport = {
  themeColor:    '#0D9488',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <OfflineBanner />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <PhoneFrame>
                {children}
              </PhoneFrame>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
