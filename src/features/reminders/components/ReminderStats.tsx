import { Bell, Clock, CheckCircle, AlertTriangle, Flag } from 'lucide-react';
import { addDays, isAfter } from 'date-fns';
import { parseLocalDate } from '@/utils/formatters';
import type { ReminderRow } from '../types';
import { getEffectiveStatus } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight }: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 ${
        highlight ? 'border-destructive/40 bg-destructive/5' : 'bg-card'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          highlight ? 'bg-destructive/10' : 'bg-primary/10'
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface Props {
  reminders: ReminderRow[];
}

export function ReminderStats({ reminders }: Props) {
  const total = reminders.length;
  const completed = reminders.filter((r) => r.status === 'completed').length;
  const overdue = reminders.filter((r) => getEffectiveStatus(r) === 'overdue').length;
  const highPri = reminders.filter((r) => r.priority === 'high' && r.status !== 'completed').length;

  const now7 = addDays(new Date(), 7);
  const upcoming = reminders.filter((r) => {
    if (r.status === 'completed') return false;
    try {
      return isAfter(now7, parseLocalDate(r.reminder_date));
    } catch {
      return false;
    }
  }).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard icon={<Bell className="h-5 w-5 text-primary" />} label="Total" value={total} />
      <StatCard
        icon={<Clock className="h-5 w-5 text-primary" />}
        label="Upcoming (7 days)"
        value={upcoming}
      />
      <StatCard
        icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
        label="Completed"
        value={completed}
      />
      <StatCard
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        label="Overdue"
        value={overdue}
        highlight={overdue > 0}
      />
      <StatCard
        icon={<Flag className="h-5 w-5 text-destructive" />}
        label="High Priority"
        value={highPri}
        highlight={highPri > 0}
      />
    </div>
  );
}
