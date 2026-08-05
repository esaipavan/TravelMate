import { format } from 'date-fns';
import {
  FileText,
  File,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  type TravelDocumentRow,
  type ExpiryStatus,
  DOC_TYPE_MAP,
  formatFileSize,
  getExpiryStatus,
  isImageUrl,
  isPdfUrl,
} from '../types';

// ── Expiry badge ──────────────────────────────────────────────────────────────

const EXPIRY_CONFIG: Record<ExpiryStatus, { label: string; className: string } | null> = {
  expired: {
    label: 'Expired',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400',
  },
  valid: {
    label: 'Valid',
    className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  },
  no_expiry: null,
};

function ExpiryBadge({ status }: { status: ExpiryStatus }) {
  const cfg = EXPIRY_CONFIG[status];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ── File thumbnail / icon ─────────────────────────────────────────────────────

function FilePreview({ url }: { url: string }) {
  if (isImageUrl(url)) {
    return <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />;
  }
  if (isPdfUrl(url)) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <File className="h-8 w-8 text-muted-foreground" />;
}

// ── Download helper ───────────────────────────────────────────────────────────

async function triggerDownload(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank');
  }
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface Props {
  document: TravelDocumentRow;
  tripTitle?: string;
  onEdit: (doc: TravelDocumentRow) => void;
  onDelete: (doc: TravelDocumentRow) => void;
}

export function DocumentCard({ document: doc, tripTitle, onEdit, onDelete }: Props) {
  const meta = DOC_TYPE_MAP[doc.type] ?? DOC_TYPE_MAP['other'];
  const expiryStatus = getExpiryStatus(doc.expiry_date);
  const isExpiredOrSoon = expiryStatus === 'expired' || expiryStatus === 'expiring_soon';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md ${
        isExpiredOrSoon ? 'border-l-4 border-l-destructive/60' : ''
      }`}
    >
      {/* Thumbnail / icon strip */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-muted/40">
        <FilePreview url={doc.file_url} />

        {/* Type badge overlay */}
        <span className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
          {meta.emoji} {meta.label}
        </span>

        {expiryStatus !== 'no_expiry' && (
          <span className="absolute right-2 top-2">
            <ExpiryBadge status={expiryStatus} />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="truncate font-semibold leading-snug" title={doc.name}>
          {doc.name}
        </p>

        <div className="space-y-1 text-xs text-muted-foreground">
          {doc.country && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {doc.country}
            </span>
          )}
          {doc.expiry_date && (
            <span
              className={`flex items-center gap-1 ${
                expiryStatus === 'expired'
                  ? 'text-destructive'
                  : expiryStatus === 'expiring_soon'
                    ? 'text-amber-600 dark:text-amber-400'
                    : ''
              }`}
            >
              <Calendar className="h-3 w-3 shrink-0" />
              Expires {format(new Date(doc.expiry_date), 'dd MMM yyyy')}
            </span>
          )}
          {tripTitle && <span className="flex items-center gap-1">✈️ {tripTitle}</span>}
          <span className="flex items-center gap-1.5">
            {formatFileSize(doc.file_size)}
            {doc.file_size && doc.created_at ? '·' : ''}
            {doc.created_at && format(new Date(doc.created_at), 'dd MMM yyyy')}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-1 border-t pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Open document"
                onClick={() => window.open(doc.file_url, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Download document"
                onClick={() => void triggerDownload(doc.file_url, doc.name)}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>

          <div className="ml-auto flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Edit document"
                  onClick={() => onEdit(doc)}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  aria-label="Delete document"
                  onClick={() => onDelete(doc)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
