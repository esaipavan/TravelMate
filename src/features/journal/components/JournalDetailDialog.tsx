import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { MapPin, Calendar, Star, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JournalEntryRow, MoodEnum } from '../types';

const MOOD_EMOJI: Record<MoodEnum, string> = {
  amazing: '🤩',
  good: '😊',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
};

const mdComponents: Components = {
  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-base font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-sm font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-semibold">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-border pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{children}</pre>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={`${className} font-mono text-xs`}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
    ),
  hr: () => <hr className="my-4 border-border" />,
};

interface Props {
  entry: JournalEntryRow | null;
  onClose: () => void;
}

export function JournalDetailDialog({ entry, onClose }: Props) {
  return (
    <Dialog
      open={!!entry}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="pr-6 text-lg leading-snug">
            {entry?.title ?? 'Untitled Entry'}
          </DialogTitle>

          {entry && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(entry.date), 'MMMM d, yyyy')}
              </span>
              {entry.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {entry.location_name}
                </span>
              )}
              {entry.is_favourite && (
                <span className="flex items-center gap-1 text-rose-500">
                  <Heart className="h-3.5 w-3.5 fill-rose-500" /> Favourite
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        {entry && (
          <ScrollArea className="flex-1">
            <div className="space-y-4 px-6 py-4">
              {/* Mood + rating */}
              {(entry.mood || entry.rating != null) && (
                <div className="flex flex-wrap items-center gap-3">
                  {entry.mood && (
                    <Badge variant="secondary" className="gap-1.5">
                      {MOOD_EMOJI[entry.mood]} {entry.mood}
                    </Badge>
                  )}
                  {entry.rating != null && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < entry.rating!
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/25'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Image gallery */}
              {entry.image_urls && entry.image_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {entry.image_urls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt=""
                        className="h-36 w-full rounded-lg object-cover transition-opacity hover:opacity-85"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Content */}
              {entry.content ? (
                <div className="border-t pt-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {entry.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="border-t pt-4 text-sm italic text-muted-foreground">
                  No description written for this entry.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
