import { format } from 'date-fns';
import { Star, Heart, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JournalEntryRow, MoodEnum } from '../types';

const MOOD_EMOJI: Record<MoodEnum, string> = {
  amazing: '🤩',
  good: '😊',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'
          }`}
        />
      ))}
    </div>
  );
}

interface Props {
  entry: JournalEntryRow;
  onView: (entry: JournalEntryRow) => void;
  onEdit: (entry: JournalEntryRow) => void;
  onDelete: (entry: JournalEntryRow) => void;
  onToggleFavourite: (entry: JournalEntryRow) => void;
}

export function JournalEntryCard({ entry, onView, onEdit, onDelete, onToggleFavourite }: Props) {
  const coverImage = entry.image_urls?.[0];
  const extraCount = (entry.image_urls?.length ?? 0) - 1;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {/* Cover image */}
      {coverImage ? (
        <div
          className="relative h-44 cursor-pointer overflow-hidden bg-muted"
          onClick={() => onView(entry)}
        >
          <img
            src={coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              +{extraCount} more
            </span>
          )}
        </div>
      ) : null}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="cursor-pointer truncate font-semibold leading-snug hover:underline"
              onClick={() => onView(entry)}
            >
              {entry.title ?? 'Untitled'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(new Date(entry.date), 'MMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={() => onToggleFavourite(entry)}
            className="mt-0.5 shrink-0 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={entry.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
            title={entry.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                entry.is_favourite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-muted-foreground/30 hover:text-rose-400'
              }`}
            />
          </button>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2">
          {entry.location_name && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {entry.location_name}
            </span>
          )}
          {entry.mood && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
              {MOOD_EMOJI[entry.mood]} {entry.mood}
            </Badge>
          )}
        </div>

        {entry.rating != null && <StarRating rating={entry.rating} />}

        {entry.content && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {entry.content}
          </p>
        )}

        {/* Action bar */}
        <div className="mt-auto flex items-center gap-1 border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-1 text-xs"
            onClick={() => onView(entry)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(entry)}
            aria-label={`Edit journal entry: ${entry.title ?? 'Untitled'}`}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(entry)}
            aria-label={`Delete journal entry: ${entry.title ?? 'Untitled'}`}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
