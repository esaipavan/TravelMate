import { Map, Globe, BookOpen, FileText, Bell, Receipt } from 'lucide-react';
import { useProfileStats } from '../hooks/useProfile';
import { useProfile } from '../hooks/useProfile';
import { formatCurrency } from '@/utils/formatters';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4">
      <div className="space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tabular-nums leading-none">{value}</p>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
    </div>
  );
}

export function ProfileStats() {
  const stats = useProfileStats();
  const { data: profile } = useProfile();
  const currency = profile?.home_currency ?? 'INR';

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        Statistics
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Map className="size-[18px] text-primary" />}
          label="Total Trips"
          value={stats.totalTrips}
        />
        <StatCard
          icon={<Globe className="size-[18px] text-primary" />}
          label="Countries Visited"
          value={stats.countriesVisited}
        />
        <StatCard
          icon={<BookOpen className="size-[18px] text-primary" />}
          label="Journal Entries"
          value={stats.journalEntries}
        />
        <StatCard
          icon={<FileText className="size-[18px] text-primary" />}
          label="Documents"
          value={stats.documentsStored}
        />
        <StatCard
          icon={<Bell className="size-[18px] text-primary" />}
          label="Reminders"
          value={stats.reminders}
        />
        <StatCard
          icon={<Receipt className="size-[18px] text-primary" />}
          label="Total Expenses"
          value={formatCurrency(stats.totalExpenses, currency)}
        />
      </div>
    </div>
  );
}
