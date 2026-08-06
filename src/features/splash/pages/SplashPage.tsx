import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { LandingPage } from '../components/LandingPage';

export default function SplashPage() {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user) return;
    navigate('/dashboard', { replace: true });
  }, [user, isLoading, navigate]);

  if (isLoading) return <PageLoader />;
  if (user) return null;

  return <LandingPage />;
}
