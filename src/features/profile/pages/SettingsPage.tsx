import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '../hooks/useProfile';
import { AccountSection } from '../components/AccountSection';
import { PreferencesSection } from '../components/PreferencesSection';
import { NotificationsSection } from '../components/NotificationsSection';
import { PrivacySection } from '../components/PrivacySection';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Settings"
        description="Account security, preferences, notifications, and privacy controls."
      />

      <Tabs defaultValue="account">
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="mt-6">
          <AccountSection />
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : profile ? (
            <PreferencesSection profile={profile} />
          ) : (
            <p className="text-sm text-muted-foreground">Could not load preferences.</p>
          )}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : profile ? (
            <NotificationsSection profile={profile} />
          ) : (
            <p className="text-sm text-muted-foreground">Could not load notification settings.</p>
          )}
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="mt-6">
          <PrivacySection />
        </TabsContent>
      </Tabs>

      {/* Danger zone — visually separated from normal settings */}
      <section
        aria-labelledby="danger-zone-heading"
        className="mt-10 rounded-2xl border border-destructive/25 bg-destructive/5 p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="danger-zone-heading" className="text-sm font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete account
          </Button>
        </div>
      </section>

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
