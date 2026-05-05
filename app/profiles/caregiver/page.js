'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Caregiver management lives inside the main dashboard profiles page.
// This route exists as a deep-link alias and redirects there.
export default function CaregiverPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/profiles');
  }, [router]);
  return null;
}
