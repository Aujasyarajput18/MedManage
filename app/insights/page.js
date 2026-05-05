'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The full Insights / Analytics page lives at /dashboard/analytics.
// This top-level alias ensures any external link to /insights still works.
export default function InsightsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/analytics');
  }, [router]);
  return null;
}
