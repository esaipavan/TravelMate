import { motion, useReducedMotion } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { rv, LIST_ITEM_VARIANTS, CARD_VARIANTS, rg, HOVER, PRESS } from '@/lib/motion';
import {
  type TravelDocumentRow,
  type ExpiryStatus,
  DOC_TYPE_MAP,
  formatFileSize,
  getExpiryStatus,
  isImageUrl,
  isPdfUrl,
} from '../../types';

interface Props {
  document: TravelDocumentRow;
  tripTitle?: string;
  onEdit: (doc: TravelDocumentRow) => void;
  onDelete: (doc: TravelDocumentRow) => void;
  staggered?: boolean;
}

const EXPIRY_CONFIG: Record<ExpiryStatus, { label: string; className: string } | null> = {
  expired: {
    label: 'Expired',
    className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  valid: {
    label: 'Valid',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  no_expiry: null,
};

// Type gradient map
const TYPE_GRADIENT: Partial<Record<string, string>> = {
  passport: 'from-indigo-500/80 to-violet-600/80',
  visa: 'from-violet-500/80 to-purple-600/80',
  flight_ticket: 'from-sky-500/80 to-blue-600/80',
  train_ticket: 'from-teal-500/80 to-cyan-600/80',
  bus_ticket: 'from-green-500/80 to-emerald-600/80',
  hotel: 'from-amber-500/80 to-orange-500/80',
  insurance: 'from-rose-500/80 to-pink-600/80',
  vaccination: 'from-lime-500/80 to-green-600/80',
  driving_license: 'from-orange-500/80 to-amber-600/80',
  ticket: 'from-fuchsia-500/80 to-pink-600/80',
  other: 'from-slate-500/80 to-slate-600/80',
};

async function triggerDownload(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank');
  }
}

export function DocumentVaultCard({
  document: doc,
  tripTitle,
  onEdit,
  onDelete,
  staggered = false,
}: Props) {
  const reduced = useReducedMotion();
  const meta = DOC_TYPE_MAP[doc.type] ?? DOC_TYPE_MAP['other'];
  const expiryStatus = getExpiryStatus(doc.expiry_date);
  const expiryCfg = EXPIRY_CONFIG[expiryStatus];
  const isUrgent = expiryStatus === 'expired' || expiryStatus === 'expiring_soon';
  const gradient = TYPE_GRADIENT[doc.type] ?? TYPE_GRADIENT['other']!;

  return (
    <motion.div
      variants={rv(staggered ? LIST_ITEM_VARIANTS : CARD_VARIANTS, reduced)}
      {...(!staggered && {
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once: true, margin: '-20px' },
      })}
      whileHover={rg(HOVER.lift, reduced)}
      whileTap={rg(PRESS.subtle, reduced)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg',
        isUrgent ? 'border-l-4 border-border/40 border-l-rose-500/60' : 'border-border/40',
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-muted/30">
        {isImageUrl(doc.file_url) ? (
          <img
            src={doc.file_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br',
              gradient,
            )}
          >
            {isPdfUrl(doc.file_url) ? (
              <FileText className="h-10 w-10 text-white/80" aria-hidden="true" />
            ) : (
              <File className="h-10 w-10 text-white/80" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Type badge */}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
          {meta.emoji} {meta.label}
        </span>

        {/* Expiry badge */}
        {expiryCfg && (
          <span
            className={cn(
              'absolute right-2 top-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              expiryCfg.className,
            )}
          >
            {expiryCfg.label}
          </span>
        )}

        {/* Hover action bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 bg-black/60 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/90 hover:bg-white/20 hover:text-white"
                onClick={() => window.open(doc.file_url, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/90 hover:bg-white/20 hover:text-white"
                onClick={() => void triggerDownload(doc.file_url, doc.name)}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-white/30" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/90 hover:bg-white/20 hover:text-white"
                onClick={() => onEdit(doc)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-400 hover:bg-white/20 hover:text-rose-300"
                onClick={() => onDelete(doc)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="truncate text-sm font-semibold text-foreground" title={doc.name}>
          {doc.name}
        </p>

        <div className="space-y-1 text-xs text-muted-foreground">
          {doc.country && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {doc.country}
            </span>
          )}
          {doc.expiry_date && (
            <span
              className={cn(
                'flex items-center gap-1',
                expiryStatus === 'expired'
                  ? 'text-rose-500'
                  : expiryStatus === 'expiring_soon'
                    ? 'text-amber-500'
                    : '',
              )}
            >
              <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
              Expires {format(new Date(doc.expiry_date), 'dd MMM yyyy')}
            </span>
          )}
          {tripTitle && (
            <span className="flex items-center gap-1 truncate">
              ✈️ <span className="truncate">{tripTitle}</span>
            </span>
          )}
          <span className="text-[11px]">
            {formatFileSize(doc.file_size)}
            {doc.file_size && doc.created_at ? ' · ' : ''}
            {doc.created_at && format(new Date(doc.created_at), 'dd MMM yyyy')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
