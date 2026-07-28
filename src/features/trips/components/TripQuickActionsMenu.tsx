import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ExternalLink,
  Pencil,
  Share2,
  Copy,
  Archive,
  FileDown,
  Trash2,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDuplicateTrip } from '../hooks/useTrips';
import type { TripRow } from '../types';

interface Props {
  trip: TripRow;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function TripQuickActionsMenu({ trip, onEdit, onShare, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate: duplicate, isPending } = useDuplicateTrip();

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    duplicate(trip, {
      onSuccess: () =>
        toast.success(`"${trip.title}" duplicated`, {
          description: 'A copy has been added to your trips.',
        }),
      onError: () => toast.error('Could not duplicate trip'),
    });
    setOpen(false);
  }

  function handleArchive(e: React.MouseEvent) {
    e.preventDefault();
    toast.info('Archive coming soon', {
      description: 'Trip archiving will be available in the next release.',
    });
    setOpen(false);
  }

  function stopProp(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div onClick={stopProp} onMouseDown={stopProp}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Trip actions"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              'bg-black/40 text-white backdrop-blur-sm',
              'transition-colors hover:bg-black/60',
              'outline-none focus-visible:ring-2 focus-visible:ring-white/60',
            )}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5" sideOffset={6}>
          <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-xl">
            <Link to={`/trips/${trip.id}`}>
              <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Open trip
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl"
            onSelect={() => {
              onEdit();
              setOpen(false);
            }}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Edit details
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl"
            onSelect={() => {
              onShare();
              setOpen(false);
            }}
          >
            <Share2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Share trip
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-1" />

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl"
            onSelect={handleDuplicate as unknown as (e: Event) => void}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-xl">
            <Link to={`/trips/${trip.id}/export`}>
              <FileDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Export PDF
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl"
            onSelect={handleArchive as unknown as (e: Event) => void}
          >
            <Archive className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Archive
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-1" />

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl text-destructive focus:text-destructive"
            onSelect={() => {
              onDelete();
              setOpen(false);
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
