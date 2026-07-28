import { useState } from 'react';
import { ArrowLeftRight, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate, formatTimeAgo } from '@/utils/formatters';
import { useCurrencies, useExchangeRate } from '../hooks/useCurrency';
import { CurrencySelect } from '../components/CurrencySelect';

const COMMON_PAIRS: [string, string][] = [
  ['USD', 'INR'],
  ['USD', 'EUR'],
  ['USD', 'GBP'],
  ['EUR', 'GBP'],
  ['USD', 'JPY'],
  ['USD', 'AUD'],
  ['GBP', 'INR'],
  ['EUR', 'INR'],
];

function formatResult(value: number): string {
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(6);
}

export default function CurrencyPage() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [amount, setAmount] = useState('1');

  const qc = useQueryClient();

  const { data: currencies, isLoading: loadingCurrencies } = useCurrencies();
  const {
    data: rateData,
    isLoading: loadingRate,
    isError: rateError,
    isFetching,
    dataUpdatedAt,
  } = useExchangeRate(from, to);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function refresh() {
    void qc.invalidateQueries({ queryKey: ['exchange-rate', from, to] });
  }

  const numericAmount = parseFloat(amount) || 0;
  const result = rateData ? numericAmount * rateData.rate : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Currency Converter"
        description="Live exchange rates powered by Frankfurter"
      />

      {/* Quick-pair chips */}
      <div className="flex flex-wrap gap-2">
        {COMMON_PAIRS.map(([f, t]) => (
          <button
            key={`${f}-${t}`}
            onClick={() => {
              setFrom(f);
              setTo(t);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent ${
              from === f && to === t
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {f} → {t}
          </button>
        ))}
      </div>

      {/* Converter card */}
      <div className="space-y-5 rounded-xl border bg-card p-6">
        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label>From</Label>
            {loadingCurrencies ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <CurrencySelect value={from} onChange={setFrom} currencies={currencies ?? {}} />
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={swap}
            className="mb-0.5 shrink-0"
            title="Swap currencies"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div className="flex-1 space-y-1.5">
            <Label>To</Label>
            {loadingCurrencies ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <CurrencySelect value={to} onChange={setTo} currencies={currencies ?? {}} />
            )}
          </div>
        </div>

        {/* Result */}
        <div className="space-y-3 rounded-lg bg-muted/50 px-4 py-4">
          {loadingRate && !rateData ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : rateError ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Couldn't load the exchange rate. Please try again.
              </p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : rateData ? (
            <>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    {numericAmount.toLocaleString()} {from} =
                  </p>
                  <p className="text-3xl font-bold tabular-nums">
                    {result !== null ? formatResult(result) : '—'}
                  </p>
                  <p className="text-base font-medium text-muted-foreground">{to}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refresh}
                  disabled={isFetching}
                  title="Refresh rate"
                  className="shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div className="flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                <span>
                  1 {from} = {formatResult(rateData.rate)} {to}
                  {from !== to && (
                    <>
                      {' '}
                      &nbsp;·&nbsp; 1 {to} = {formatResult(1 / rateData.rate)} {from}
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Rate as of {formatDate(rateData.updatedAt)}</span>
                {dataUpdatedAt > 0 && (
                  <span className="flex shrink-0 items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(new Date(dataUpdatedAt))}
                  </span>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
