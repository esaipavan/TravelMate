import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { Separator } from '@/components/ui/separator';
import { ErrorState } from '@/components/shared/ErrorState';
import { useProfile } from '../hooks/useProfile';
import { AvatarUploader } from '../components/AvatarUploader';
import { ProfileForm } from '../components/ProfileForm';
import { ProfileStats } from '../components/ProfileStats';

export default function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="w-full space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <ErrorState
        title="Couldn't load profile"
        message="We ran into a problem loading your profile."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Profile"
        description="Manage your personal information and travel identity."
      />

      {/* Avatar + form laid out side-by-side on larger screens */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <AvatarUploader avatarUrl={profile.avatar_url} fullName={profile.full_name} />
          </div>
          <div className="w-full min-w-0">
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Statistics */}
      <ProfileStats />
    </div>
  );
}
