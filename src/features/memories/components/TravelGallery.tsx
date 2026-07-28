import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { rv, CARD_VARIANTS, LIST_VARIANTS, HOVER, rg } from '@/lib/motion';
import type { JournalEntryRow } from '@/features/journal/types';

interface Photo {
  url: string;
  title: string;
  date: string;
}

interface Props {
  entries: JournalEntryRow[];
}

export function TravelGallery({ entries }: Props) {
  const reduced = useReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos: Photo[] = entries.flatMap((entry) =>
    (entry.image_urls ?? []).map((url) => ({
      url,
      title: entry.title ?? 'Memory',
      date: entry.date,
    })),
  );

  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;

  const prev = () => setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  const next = () =>
    setLightboxIndex((i) => (i !== null ? Math.min(photos.length - 1, i + 1) : null));

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
          <Camera className="h-6 w-6 text-muted-foreground/40" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-foreground">No photos yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add photos to your journal entries to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="columns-2 gap-3 sm:columns-3 lg:columns-4"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        role="list"
        aria-label="Photo gallery"
      >
        {photos.map((photo, i) => (
          <motion.div
            key={`${photo.url}-${i}`}
            role="listitem"
            variants={rv(CARD_VARIANTS, reduced)}
            whileHover={rg(HOVER.lift, reduced)}
            className="mb-3 break-inside-avoid"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`View photo: ${photo.title}`}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            </button>
          </motion.div>
        ))}
      </motion.div>

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
      >
        <DialogContent className="max-w-5xl border-none bg-black/95 p-2 shadow-2xl">
          <div className="relative flex min-h-[40vh] items-center justify-center">
            {current && (
              <img
                src={current.url}
                alt={current.title}
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            )}

            {/* Prev / Next */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-30"
              onClick={prev}
              disabled={lightboxIndex === 0}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-30"
              onClick={next}
              disabled={lightboxIndex === photos.length - 1}
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Close */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute right-2 top-2 rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close photo viewer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Caption */}
            {current && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-white/70">
                  {current.title}
                  {lightboxIndex !== null && (
                    <span className="ml-2 text-white/40">
                      {lightboxIndex + 1} / {photos.length}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
