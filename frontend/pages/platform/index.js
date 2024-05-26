import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfileIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/platform/agents');
  }, [router]);

  return null;
}