import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';

export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amount);
}

// Parse a date value without UTC-offset shifting.
// Date-only strings (YYYY-MM-DD) from the DB are stored in local time; appending
// T00:00:00 forces date-fns / JS to parse them as local midnight rather than UTC
// midnight (which would display the wrong calendar day in negative-offset timezones).
export function parseLocalDate(date: string | Date): Date {
  if (typeof date !== 'string') return date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return parseISO(`${date}T00:00:00`);
  return parseISO(date);
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  return format(parseLocalDate(date), fmt);
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function tripDuration(startDate: string, endDate: string): number {
  return differenceInDays(parseLocalDate(endDate), parseLocalDate(startDate)) + 1;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
