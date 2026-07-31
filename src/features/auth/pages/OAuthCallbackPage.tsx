import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { getOAuthReturnTo } from '../services/auth.service';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      const returnTo = getOAuthReturnTo();
      navigate(returnTo, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader />
    </div>
  );
}
