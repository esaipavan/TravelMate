import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { ArrowLeft, Download, FileSpreadsheet, FileText, Printer, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useBudget } from '@/features/budget/hooks/useBudget';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { useItineraryData } from '@/features/itinerary/hooks/useItinerary';
import { useChecklistData } from '@/features/checklist/hooks/useChecklist';
import { formatDate, formatDateRange, formatCurrency } from '@/utils/formatters';
import type { TripRow } from '@/features/trips/types';
import type { BudgetData } from '@/features/budget/services/budget.service';
import type { ExpenseData, ExpenseRow } from '@/features/expenses/types';
import type { ItineraryData } from '@/features/itinerary/types';
import type { ChecklistData } from '@/features/checklist/types';

type ExportFormat = 'excel' | 'csv' | 'print';

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'excel',
    label: 'Excel Workbook',
    description: 'Full workbook: overview, budget, expenses, itinerary, and packing list',
    icon: FileSpreadsheet,
    badge: 'Recommended',
  },
  {
    value: 'csv',
    label: 'CSV Spreadsheet',
    description: 'Expense list in comma-separated format, compatible with any spreadsheet app',
    icon: FileText,
  },
  {
    value: 'print',
    label: 'Print / PDF',
    description: 'Opens a print-ready summary with all trip data — use "Save as PDF"',
    icon: Printer,
  },
];

function safeFilename(name: string): string {
  return name
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToCSV(expenses: ExpenseRow[], tripTitle: string): void {
  const headers = ['Date', 'Title', 'Category', 'Amount', 'Currency', 'Payment Method', 'Notes'];
  const rows = expenses.map((e) => [
    e.date,
    e.title,
    e.category,
    e.amount.toString(),
    e.currency,
    e.payment_method,
    e.notes ?? '',
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${safeFilename(tripTitle)}-expenses.csv`);
}

function exportToExcel(
  trip: TripRow,
  budgetData: BudgetData,
  expenseData: ExpenseData,
  itineraryData?: ItineraryData,
  checklistData?: ChecklistData,
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewWs = XLSX.utils.aoa_to_sheet([
    ['TravelMate — Trip Export'],
    [],
    ['Trip', trip.title],
    ['Destination', trip.destination],
    ['Dates', formatDateRange(trip.start_date, trip.end_date)],
    ['Status', trip.status],
    ['Total Budget', trip.total_budget ?? 'Not set'],
    ['Currency', trip.currency],
    ['Notes', trip.notes ?? ''],
  ]);
  overviewWs['!cols'] = [{ wch: 16 }, { wch: 44 }];
  XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview');

  // Sheet 2: Budget breakdown
  const activeItems = budgetData.items.filter((i) => i.allocated > 0 || i.spent > 0);
  const budgetWs = XLSX.utils.aoa_to_sheet([
    ['Category', 'Allocated', 'Spent', 'Remaining', '% Used', 'Currency'],
    ...activeItems.map((i) => [
      i.label,
      i.allocated,
      i.spent,
      i.allocated - i.spent,
      i.allocated > 0 ? Math.round((i.spent / i.allocated) * 100) : 0,
      i.currency,
    ]),
    [],
    [
      'TOTAL',
      budgetData.summary.totalAllocated,
      budgetData.summary.totalSpent,
      budgetData.summary.remaining,
      budgetData.summary.totalAllocated > 0
        ? Math.round((budgetData.summary.totalSpent / budgetData.summary.totalAllocated) * 100)
        : 0,
      trip.currency,
    ],
  ]);
  budgetWs['!cols'] = [
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, budgetWs, 'Budget');

  // Sheet 3: Expense log
  const expenseWs = XLSX.utils.aoa_to_sheet([
    ['Date', 'Title', 'Category', 'Amount', 'Currency', 'Payment Method', 'Notes'],
    ...expenseData.expenses.map((e) => [
      e.date,
      e.title,
      e.category,
      e.amount,
      e.currency,
      e.payment_method,
      e.notes ?? '',
    ]),
  ]);
  expenseWs['!cols'] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
    { wch: 32 },
  ];
  XLSX.utils.book_append_sheet(wb, expenseWs, 'Expenses');

  // Sheet 4: Itinerary (if data available and has items)
  const itineraryItems = (itineraryData?.days ?? []).flatMap((day) =>
    day.items.map((item) => [
      `Day ${day.day_number}`,
      day.date,
      item.start_time ?? '',
      item.end_time ?? '',
      item.title,
      item.category,
      item.location_name ?? '',
      item.status,
      item.estimated_cost != null ? item.estimated_cost : '',
      item.description ?? '',
    ]),
  );
  if (itineraryItems.length > 0) {
    const itineraryWs = XLSX.utils.aoa_to_sheet([
      [
        'Day',
        'Date',
        'Start',
        'End',
        'Activity',
        'Category',
        'Location',
        'Status',
        'Est. Cost',
        'Notes',
      ],
      ...itineraryItems,
    ]);
    itineraryWs['!cols'] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 8 },
      { wch: 8 },
      { wch: 30 },
      { wch: 14 },
      { wch: 22 },
      { wch: 12 },
      { wch: 12 },
      { wch: 36 },
    ];
    XLSX.utils.book_append_sheet(wb, itineraryWs, 'Itinerary');
  }

  // Sheet 5: Packing List (if data available)
  if (checklistData && checklistData.items.length > 0) {
    const packingWs = XLSX.utils.aoa_to_sheet([
      ['Category', 'Item', 'Quantity', 'Essential', 'Status'],
      ...checklistData.items.map((item) => [
        item.category,
        item.name,
        item.quantity,
        item.is_essential ? 'Yes' : 'No',
        item.is_packed ? '✓ Packed' : 'Pending',
      ]),
    ]);
    packingWs['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, packingWs, 'Packing List');
  }

  XLSX.writeFile(wb, `${safeFilename(trip.title)}-export.xlsx`);
}

function openPrintView(
  trip: TripRow,
  budgetData: BudgetData,
  expenseData: ExpenseData,
  itineraryData?: ItineraryData,
  checklistData?: ChecklistData,
): void {
  const fmt = (n: number) => formatCurrency(n, trip.currency);
  const activeItems = budgetData.items.filter((i) => i.allocated > 0 || i.spent > 0);
  const itineraryItems = (itineraryData?.days ?? []).flatMap((d) =>
    d.items.map((item) => ({ day: d.day_number, date: d.date, item })),
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${trip.title} — TravelMate Export</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; font-size: 13px; color: #111; padding: 32px; line-height: 1.5; max-width: 960px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #555; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    .meta { color: #555; font-size: 13px; margin-bottom: 6px; }
    .badge { display: inline-block; background: #f3f4f6; border-radius: 4px; padding: 2px 8px; font-size: 11px; text-transform: capitalize; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    th { text-align: left; padding: 7px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; background: #f9fafb; border-bottom: 2px solid #e5e7eb; color: #555; }
    td { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .total-row td { font-weight: 700; border-top: 2px solid #e5e7eb; border-bottom: none; }
    .over { color: #dc2626; }
    .good { color: #16a34a; }
    .packed { color: #16a34a; }
    .pending { color: #9ca3af; }
    .essential { font-weight: 600; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px; }
    @media print { body { padding: 20px; } @page { margin: 20mm; } }
  </style>
</head>
<body>
  <h1>${trip.title}</h1>
  <p class="meta">📍 ${trip.destination} &nbsp;·&nbsp; 📅 ${formatDateRange(trip.start_date, trip.end_date)} &nbsp;·&nbsp; <span class="badge">${trip.status}</span></p>
  ${trip.total_budget ? `<p class="meta">💰 Budget: <strong>${fmt(trip.total_budget)}</strong></p>` : ''}
  ${trip.notes ? `<p class="meta" style="margin-top:8px;">${trip.notes}</p>` : ''}

  ${
    activeItems.length > 0
      ? `<h2>Budget Summary</h2>
  <table>
    <tr><th>Category</th><th class="num">Allocated</th><th class="num">Spent</th><th class="num">Remaining</th></tr>
    ${activeItems
      .map((i) => {
        const rem = i.allocated - i.spent;
        return `<tr>
      <td>${i.emoji} ${i.label}</td>
      <td class="num">${fmt(i.allocated)}</td>
      <td class="num">${fmt(i.spent)}</td>
      <td class="num ${rem < 0 ? 'over' : 'good'}">${rem < 0 ? '−' : ''}${fmt(Math.abs(rem))}</td>
    </tr>`;
      })
      .join('')}
    <tr class="total-row">
      <td>Total</td>
      <td class="num">${fmt(budgetData.summary.totalAllocated)}</td>
      <td class="num">${fmt(budgetData.summary.totalSpent)}</td>
      <td class="num ${budgetData.summary.remaining < 0 ? 'over' : 'good'}">${budgetData.summary.remaining < 0 ? '−' : ''}${fmt(Math.abs(budgetData.summary.remaining))}</td>
    </tr>
  </table>`
      : ''
  }

  ${
    expenseData.expenses.length > 0
      ? `<h2>Expense Log <span style="font-weight:400;color:#9ca3af;">(${expenseData.expenses.length} transactions)</span></h2>
  <table>
    <tr><th>Date</th><th>Description</th><th>Category</th><th>Method</th><th class="num">Amount</th></tr>
    ${expenseData.expenses
      .map(
        (e) => `<tr>
      <td style="white-space:nowrap;">${e.date}</td>
      <td>${e.title}</td>
      <td style="text-transform:capitalize;">${e.category}</td>
      <td style="text-transform:capitalize;">${e.payment_method}</td>
      <td class="num">${fmt(e.amount)}</td>
    </tr>`,
      )
      .join('')}
  </table>`
      : ''
  }

  ${
    itineraryItems.length > 0
      ? `<h2>Itinerary <span style="font-weight:400;color:#9ca3af;">(${itineraryItems.length} activities)</span></h2>
  <table>
    <tr><th>Day</th><th>Date</th><th>Time</th><th>Activity</th><th>Location</th><th>Status</th></tr>
    ${itineraryItems
      .map(
        ({ day, date, item }) => `<tr>
      <td style="white-space:nowrap;font-weight:600;">Day ${day}</td>
      <td style="white-space:nowrap;">${date}</td>
      <td style="white-space:nowrap;">${item.start_time ?? ''}${item.start_time && item.end_time ? '–' : ''}${item.end_time ?? ''}</td>
      <td><strong>${item.title}</strong>${item.description ? `<br><span style="color:#555;font-size:11px;">${item.description}</span>` : ''}</td>
      <td>${item.location_name ?? ''}</td>
      <td style="text-transform:capitalize;">${item.status}</td>
    </tr>`,
      )
      .join('')}
  </table>`
      : ''
  }

  ${
    checklistData && checklistData.items.length > 0
      ? `<h2>Packing List <span style="font-weight:400;color:#9ca3af;">(${checklistData.items.filter((i) => i.is_packed).length}/${checklistData.items.length} packed)</span></h2>
  <table>
    <tr><th>Category</th><th>Item</th><th>Qty</th><th>Status</th></tr>
    ${checklistData.items
      .map(
        (item) => `<tr>
      <td>${item.category}</td>
      <td class="${item.is_essential ? 'essential' : ''}">${item.name}${item.is_essential ? ' ★' : ''}</td>
      <td>${item.quantity}</td>
      <td class="${item.is_packed ? 'packed' : 'pending'}">${item.is_packed ? '✓ Packed' : 'Pending'}</td>
    </tr>`,
      )
      .join('')}
  </table>`
      : ''
  }

  <div class="footer">Exported from TravelMate &nbsp;·&nbsp; ${formatDate(new Date().toISOString().slice(0, 10))}</div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function ExportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-10 w-36" />
    </div>
  );
}

export default function ExportPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data: trip, isLoading: tripLoading, isError: tripError } = useTrip(tripId!);
  const { data: budgetData, isLoading: budgetLoading } = useBudget(tripId!);
  const { data: expenseData, isLoading: expenseLoading } = useExpenseData(tripId!);
  const { data: itineraryData, isLoading: itineraryLoading } = useItineraryData(tripId!);
  const { data: checklistData, isLoading: checklistLoading } = useChecklistData(tripId!);

  const [format, setFormat] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const isLoading =
    tripLoading || budgetLoading || expenseLoading || itineraryLoading || checklistLoading;

  if (isLoading) return <ExportSkeleton />;
  if (tripError || !trip || !budgetData || !expenseData) return <Navigate to="/trips" replace />;

  const expenseCount = expenseData.expenses.length;
  const activeCategories = budgetData.items.filter((i) => i.allocated > 0 || i.spent > 0).length;
  const itineraryCount = (itineraryData?.days ?? []).reduce((s, d) => s + d.items.length, 0);
  const checklistCount = checklistData?.items.length ?? 0;
  const packedCount = checklistData?.items.filter((i) => i.is_packed).length ?? 0;

  const sheetCount = 3 + (itineraryCount > 0 ? 1 : 0) + (checklistCount > 0 ? 1 : 0);

  function handleExport() {
    if (!trip || !budgetData || !expenseData) return;
    setIsExporting(true);
    try {
      if (format === 'csv') {
        exportToCSV(expenseData.expenses, trip.title);
        toast.success('CSV downloaded');
      } else if (format === 'excel') {
        exportToExcel(trip, budgetData, expenseData, itineraryData, checklistData);
        toast.success('Excel workbook downloaded');
      } else {
        openPrintView(trip, budgetData, expenseData, itineraryData, checklistData);
      }
      track('export_downloaded', { format, trip_destination: trip.destination ?? '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
          <Link to={`/trips/${tripId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Export Trip" description={trip.title} />
      </div>

      {/* Format picker */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Export format
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {FORMAT_OPTIONS.map(({ value, label, description, icon: Icon, badge }) => {
            const selected = format === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFormat(value)}
                className={`relative rounded-lg border p-4 text-left transition-all hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'
                }`}
              >
                {badge && (
                  <span className="absolute right-3 top-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {badge}
                    </Badge>
                  </span>
                )}
                {selected && (
                  <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                )}
                <div
                  className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm font-semibold leading-tight">{label}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* What's included */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold">What's included</p>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Trip overview &amp; details</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                Budget breakdown
                {activeCategories > 0 && (
                  <span className="ml-1 font-medium text-foreground">
                    ({activeCategories} categories)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                Expense log
                {expenseCount > 0 && (
                  <span className="ml-1 font-medium text-foreground">
                    ({expenseCount} transactions)
                  </span>
                )}
              </span>
            </div>
            {format !== 'csv' && (
              <>
                <div className="flex items-start gap-2">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${itineraryCount > 0 ? 'text-emerald-500' : 'text-muted-foreground/40'}`}
                  />
                  <span className={itineraryCount === 0 ? 'text-muted-foreground/50' : ''}>
                    Itinerary
                    {itineraryCount > 0 ? (
                      <span className="ml-1 font-medium text-foreground">
                        ({itineraryCount} activities)
                      </span>
                    ) : (
                      <span className="ml-1 text-muted-foreground/50">(none added)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${checklistCount > 0 ? 'text-emerald-500' : 'text-muted-foreground/40'}`}
                  />
                  <span className={checklistCount === 0 ? 'text-muted-foreground/50' : ''}>
                    Packing list
                    {checklistCount > 0 ? (
                      <span className="ml-1 font-medium text-foreground">
                        ({packedCount}/{checklistCount} packed)
                      </span>
                    ) : (
                      <span className="ml-1 text-muted-foreground/50">(none added)</span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          {format === 'excel' && (
            <p className="border-t pt-3 text-xs text-muted-foreground">
              Excel file contains {sheetCount} sheets: Overview, Budget, Expenses
              {itineraryCount > 0 && ', Itinerary'}
              {checklistCount > 0 && ', Packing List'}.
            </p>
          )}
          {format === 'csv' && (
            <p className="border-t pt-3 text-xs text-muted-foreground">
              CSV contains the expense log only. Use Excel export for the full budget, itinerary,
              and packing list.
            </p>
          )}
          {format === 'print' && (
            <p className="border-t pt-3 text-xs text-muted-foreground">
              A new tab opens with the full print view. Press <strong>Ctrl+P</strong> (or ⌘+P) and
              choose "Save as PDF".
            </p>
          )}
        </CardContent>
      </Card>

      {/* Export button */}
      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={() => void handleExport()}
          disabled={isExporting}
          className="gap-2"
        >
          {format === 'print' ? <Printer className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {isExporting
            ? 'Exporting…'
            : format === 'print'
              ? 'Open Print View'
              : `Download ${format.toUpperCase()}`}
        </Button>
        {expenseCount === 0 && format === 'csv' && (
          <p className="text-sm text-muted-foreground">No expenses to export yet.</p>
        )}
      </div>
    </div>
  );
}
