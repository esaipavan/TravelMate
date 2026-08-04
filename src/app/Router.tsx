import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useAuthStore } from '@/store/auth.store';

// ─── Lazy page imports ────────────────────────────────────────────────────────

// Splash
const SplashPage = lazy(() => import('@/features/splash/pages/SplashPage'));

// Onboarding
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'));

// Auth Hub
const AuthHubPage = lazy(() => import('@/features/auth/pages/AuthHubPage'));

// Auth (Phase 1)
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const OAuthCallbackPage = lazy(() => import('@/features/auth/pages/OAuthCallbackPage'));

// App pages (Phases 4–20)
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TripsPage = lazy(() => import('@/features/trips/pages/TripsPage'));
const TripDetailPage = lazy(() => import('@/features/trips/pages/TripDetailPage'));
const TripNewPage = lazy(() => import('@/features/trips/pages/TripNewPage'));
const BudgetPage = lazy(() => import('@/features/budget/pages/BudgetPage'));
const ExpensesPage = lazy(() => import('@/features/expenses/pages/ExpensesPage'));
const ItineraryPage = lazy(() => import('@/features/itinerary/pages/ItineraryPage'));
const ChecklistPage = lazy(() => import('@/features/checklist/pages/ChecklistPage'));
const JournalPage = lazy(() => import('@/features/journal/pages/JournalPage'));
const WeatherPage = lazy(() => import('@/features/weather/pages/WeatherPage'));
const CurrencyPage = lazy(() => import('@/features/currency/pages/CurrencyPage'));
const NearbyPage = lazy(() => import('@/features/nearby/pages/NearbyPage'));
const DestinationPage = lazy(() => import('@/features/destination/pages/DestinationPage'));
const DestinationIntelPage = lazy(
  () => import('@/features/destination-intel/pages/DestinationIntelPage'),
);
const DocumentsPage = lazy(() => import('@/features/documents/pages/DocumentsPage'));
const RemindersPage = lazy(() => import('@/features/reminders/pages/RemindersPage'));
const AssistantPage = lazy(() => import('@/features/assistant/pages/AssistantPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const ExportPage = lazy(() => import('@/features/export/pages/ExportPage'));
const MemoriesPage = lazy(() => import('@/features/memories/pages/MemoriesPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/features/profile/pages/SettingsPage'));

// Admin pages (Phase 3)
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/UserManagementPage'));
const AdminAnalyticsPage = lazy(() => import('@/features/admin/pages/UserAnalyticsPage'));
const AdminFeedbackPage = lazy(() => import('@/features/admin/pages/FeedbackPage'));
const AdminBugsPage = lazy(() => import('@/features/admin/pages/BugReportsPage'));
const AdminFlagsPage = lazy(() => import('@/features/admin/pages/FeatureFlagsPage'));
const AdminFounderPage = lazy(() => import('@/features/admin/pages/FounderDashboardPage'));
const AdminHealthPage = lazy(() => import('@/features/admin/pages/ApiHealthPage'));
const AdminAIPage = lazy(() => import('@/features/admin/pages/AIUsagePage'));

// Share (public)
const SharePage = lazy(() => import('@/features/trips/pages/SharePage'));

// Trust pages (public)
const PrivacyPage = lazy(() => import('@/features/trust/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/features/trust/pages/TermsPage'));
const SecurityPage = lazy(() => import('@/features/trust/pages/SecurityPage'));
const ContactPage = lazy(() => import('@/features/trust/pages/ContactPage'));

// ─── Guards ──────────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // Splash — must be first so it wins over the pathless protected layout
  {
    path: '/',
    element: (
      <Wrap>
        <SplashPage />
      </Wrap>
    ),
  },

  // Onboarding — requires auth so the email-verify redirect lands correctly;
  // the page itself redirects to /dashboard if onboarding is already complete.
  {
    path: '/onboarding',
    element: (
      <RequireAuth>
        <Wrap>
          <OnboardingPage />
        </Wrap>
      </RequireAuth>
    ),
  },

  // Auth Hub — between onboarding and login
  {
    path: '/auth',
    element: (
      <RequireGuest>
        <Wrap>
          <AuthHubPage />
        </Wrap>
      </RequireGuest>
    ),
  },

  // Public auth routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: (
          <RequireGuest>
            <Wrap>
              <LoginPage />
            </Wrap>
          </RequireGuest>
        ),
      },
      {
        path: '/register',
        element: (
          <RequireGuest>
            <Wrap>
              <RegisterPage />
            </Wrap>
          </RequireGuest>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <RequireGuest>
            <Wrap>
              <ForgotPasswordPage />
            </Wrap>
          </RequireGuest>
        ),
      },
      // No RequireGuest — user arrives mid-recovery-session from the email link
      {
        path: '/reset-password',
        element: (
          <Wrap>
            <ResetPasswordPage />
          </Wrap>
        ),
      },
    ],
  },

  // OAuth callback — no auth guard
  {
    path: '/auth/callback',
    element: (
      <Wrap>
        <OAuthCallbackPage />
      </Wrap>
    ),
  },

  // Public share page (no auth required)
  {
    path: '/share/:id',
    element: (
      <Wrap>
        <SharePage />
      </Wrap>
    ),
  },

  // Trust pages (public, no layout wrapper)
  {
    path: '/privacy',
    element: (
      <Wrap>
        <PrivacyPage />
      </Wrap>
    ),
  },
  {
    path: '/terms',
    element: (
      <Wrap>
        <TermsPage />
      </Wrap>
    ),
  },
  {
    path: '/security',
    element: (
      <Wrap>
        <SecurityPage />
      </Wrap>
    ),
  },
  {
    path: '/contact',
    element: (
      <Wrap>
        <ContactPage />
      </Wrap>
    ),
  },

  // Protected app routes
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <Wrap>
            <DashboardPage />
          </Wrap>
        ),
      },
      {
        path: '/trips',
        element: (
          <Wrap>
            <TripsPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/new',
        element: (
          <Wrap>
            <TripNewPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id',
        element: (
          <Wrap>
            <TripDetailPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/budget',
        element: (
          <Wrap>
            <BudgetPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/expenses',
        element: (
          <Wrap>
            <ExpensesPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/itinerary',
        element: (
          <Wrap>
            <ItineraryPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/checklist',
        element: (
          <Wrap>
            <ChecklistPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/journal',
        element: (
          <Wrap>
            <JournalPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/export',
        element: (
          <Wrap>
            <ExportPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/destination-intel',
        element: (
          <Wrap>
            <DestinationIntelPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/memories',
        element: (
          <Wrap>
            <MemoriesPage />
          </Wrap>
        ),
      },
      {
        path: '/trips/:id/documents',
        element: (
          <Wrap>
            <DocumentsPage />
          </Wrap>
        ),
      },
      {
        path: '/weather',
        element: (
          <Wrap>
            <WeatherPage />
          </Wrap>
        ),
      },
      {
        path: '/currency',
        element: (
          <Wrap>
            <CurrencyPage />
          </Wrap>
        ),
      },
      {
        path: '/nearby',
        element: (
          <Wrap>
            <NearbyPage />
          </Wrap>
        ),
      },
      {
        path: '/destination',
        element: (
          <Wrap>
            <DestinationPage />
          </Wrap>
        ),
      },
      {
        path: '/documents',
        element: (
          <Wrap>
            <DocumentsPage />
          </Wrap>
        ),
      },
      {
        path: '/reminders',
        element: (
          <Wrap>
            <RemindersPage />
          </Wrap>
        ),
      },
      {
        path: '/assistant',
        element: (
          <Wrap>
            <AssistantPage />
          </Wrap>
        ),
      },
      {
        path: '/analytics',
        element: (
          <Wrap>
            <AnalyticsPage />
          </Wrap>
        ),
      },
      {
        path: '/profile',
        element: (
          <Wrap>
            <ProfilePage />
          </Wrap>
        ),
      },
      {
        path: '/settings',
        element: (
          <Wrap>
            <SettingsPage />
          </Wrap>
        ),
      },
    ],
  },

  // Admin routes — accessible to ADMIN and SUPER_ADMIN
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AppLayout />
      </RequireAdmin>
    ),
    children: [
      {
        index: true,
        element: (
          <Wrap>
            <AdminDashboardPage />
          </Wrap>
        ),
      },
      {
        path: 'users',
        element: (
          <Wrap>
            <AdminUsersPage />
          </Wrap>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Wrap>
            <AdminAnalyticsPage />
          </Wrap>
        ),
      },
      {
        path: 'feedback',
        element: (
          <Wrap>
            <AdminFeedbackPage />
          </Wrap>
        ),
      },
      {
        path: 'bugs',
        element: (
          <Wrap>
            <AdminBugsPage />
          </Wrap>
        ),
      },
      {
        path: 'founder',
        element: (
          <Wrap>
            <AdminFounderPage />
          </Wrap>
        ),
      },
      {
        path: 'flags',
        element: (
          <Wrap>
            <AdminFlagsPage />
          </Wrap>
        ),
      },
      {
        path: 'health',
        element: (
          <Wrap>
            <AdminHealthPage />
          </Wrap>
        ),
      },
      {
        path: 'ai',
        element: (
          <Wrap>
            <AdminAIPage />
          </Wrap>
        ),
      },
    ],
  },

  // Splash — standalone, no layout wrapper
  // Catch-all
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
