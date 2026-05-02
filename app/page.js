'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { seedDemoData } from '@/lib/demo';
import QRCode from '@/components/ui/QRCode';
import styles from './page.module.css';

const USPS = [
  { icon: '🆘', title: 'SOS Emergency', desc: 'Hold 3 seconds → live GPS location sent to all contacts via SMS. Zero competitors have this.' },
  { icon: '🤖', title: 'AI Drug Checker', desc: 'Plain-language interaction checks you can run from your medicine list. No medical jargon.' },
  { icon: '🔥', title: 'Gamified Streaks', desc: 'Points, badges, streak counters. The MangoHealth model — revived and better.' },
  { icon: '🆓', title: 'Free Forever', desc: 'Medisafe went paid in Jan 2026. We\'re the replacement. No paywalls. No ads. Ever.' },
  { icon: '🇮🇳', title: 'India-First', desc: 'Indian drug database, Fast2SMS, Hindi support, and pharmacy links built-in.' },
  { icon: '📴', title: 'Works Offline', desc: 'Full functionality without internet. Syncs when you reconnect.' },
];

export default function LandingPage() {
  const router = useRouter();

  const handleDemo = () => {
    seedDemoData();
    router.push('/dashboard?demo=true');
  };

  return (
    <div className={styles.wrapper}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>💊</span>
          <span className={styles.navLogoText}>MedManage</span>
        </div>
        <div className={styles.navActions}>
          <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/auth/signup" className="btn btn-primary btn-sm">Sign Up Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          🚨 Medisafe just went paid. We're the free replacement.
        </div>

        <h1 className={styles.heroTitle}>
          The Free, AI-Powered
          <br />
          <span className="text-gradient">Medication App for India.</span>
          <br />
          Forever.
        </h1>

        <p className={styles.heroSub}>
          Drug interaction warnings in plain language. Emergency SOS with live GPS.
          Gamified streaks. Caregiver alerts. No paywalls. No ads. Always free.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Get Started Free →
          </Link>
          <button onClick={handleDemo} className="btn btn-ghost btn-lg">
            Try Demo (no login)
          </button>
        </div>

        {/* Social proof */}
        <div className={styles.socialProof}>
          <span>✅ No credit card</span>
          <span>✅ Free forever</span>
          <span>✅ Works on any phone</span>
          <span>✅ Installs like an app</span>
        </div>

        {/* QR Code for jury */}
        <div className={styles.qrSection}>
          <QRCode size={160} />
          <p className={styles.qrText}>📱 Scan to try on your phone right now</p>
        </div>
      </section>

      {/* USP Grid */}
      <section className={styles.uspSection}>
        <h2 className={styles.sectionTitle}>
          Everything your medication app <span className="text-gradient">should have been.</span>
        </h2>
        <div className={styles.uspGrid}>
          {USPS.map((u) => (
            <div key={u.title} className={`glass-card ${styles.uspCard}`}>
              <div className={styles.uspIcon}>{u.icon}</div>
              <h3 className={styles.uspTitle}>{u.title}</h3>
              <p className={styles.uspDesc}>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className={styles.compareSection}>
        <h2 className={styles.sectionTitle}>
          How we compare
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Feature</th>
                <th className={styles.ourCol}>MedManage</th>
                <th>Medisafe</th>
                <th>MyTherapy</th>
                <th>EveryDose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Always Free', '✅', '❌ Paid 2026', '✅', '❌'],
                ['SOS Emergency', '✅', '❌', '❌', '❌'],
                ['AI Drug Checker', '✅', '❌', '❌', '⚠️ Partial'],
                ['India-First', '✅', '❌', '❌', '❌'],
                ['Offline Mode', '✅', '❌', '❌', '❌'],
                ['Gamification', '✅', '❌', '❌', '❌'],
                ['Caregiver Alerts', '✅ Instant', '⚠️ 4hr delay', '❌', '❌'],
                ['No Account Needed', '✅', '❌', '❌', '❌'],
              ].map(([feat, ...vals]) => (
                <tr key={feat}>
                  <td>{feat}</td>
                  <td className={styles.ourCol}>{vals[0]}</td>
                  <td>{vals[1]}</td>
                  <td>{vals[2]}</td>
                  <td>{vals[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Start tracking for free.<br/>Takes 30 seconds.</h2>
        <div className={styles.heroCtas}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Sign Up — It's Free →
          </Link>
          <button onClick={handleDemo} className="btn btn-ghost btn-lg">
            Try Demo First
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 MedManage · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></p>
        <p className={styles.footerTagline}>We never sell your health data. Ever.</p>
      </footer>
    </div>
  );
}
