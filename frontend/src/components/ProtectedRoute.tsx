import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionStorage } from '@/storage/sessionStorage';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const user = SessionStorage.getUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}