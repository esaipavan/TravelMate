import { Link } from 'react-router-dom';
import { FolderOpen, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import {
  getBaselineDocumentSuggestions,
  getTripGuideDocumentSuggestions,
} from '../utils/documentSuggestions';
import { isSuggestionFulfilled } from '../utils/documentSuggestions';
import type { TripBriefRow } from '@/features/dashboard/hooks/useTripBrief';

interface Props {
  tripId: string;
  countryCode: string | null;
  brief: TripBriefRow | null;
}

export function PrepareDocumentsSection({ tripId, countryCode, brief }: Props) {
  const { data: existingDocs = [], isLoading } = useDocuments(tripId);

  const baseline = getBaselineDocumentSuggestions(countryCode);
  const fromGuide =
    brief?.status === 'complete'
      ? getTripGuideDocumentSuggestions(brief.required_documents, baseline)
      : [];
  const suggestions = [...baseline, ...fromGuide];

  const isInternational = !!countryCode && countryCode.trim().toUpperCase() !== 'IN';

  return (
    <section
      id="documents"
      className="scroll-mt-20 rounded-2xl border border-border/60 bg-card p-5"
    >
      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Documents</h2>
          <p className="text-xs text-muted-foreground">
            Make sure you have the important documents ready.
          </p>
        </div>
      </div>

      {isInternational && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Travel requirements are shown as suggestions based on your trip. Verify official
            requirements for your nationality before travelling.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-1.5" role="list">
          {suggestions.map((s) => {
            const fulfilled = isSuggestionFulfilled(s, existingDocs);
            return (
              <li
                key={s.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/60 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {fulfilled ? 'Already added' : 'Suggested for your trip'}
                  </p>
                </div>
                {fulfilled ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                ) : (
                  <Link
                    to={`/trips/${tripId}/documents`}
                    className="shrink-0 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    Upload
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Link
        to={`/trips/${tripId}/documents`}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Review all documents
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </section>
  );
}
