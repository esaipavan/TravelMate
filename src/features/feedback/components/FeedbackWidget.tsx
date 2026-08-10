import { useState } from 'react';
import { MessageCirclePlus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FeedbackDialog } from './FeedbackDialog';

// Don't show the widget on admin pages — admins have direct DB access.
const HIDDEN_PREFIXES = ['/admin'];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Open feedback form"
        onClick={() => setOpen(true)}
        className={cn(
          // Position: above mobile nav (synced with MobileNav's safe-bottom padding) on mobile, fixed bottom-right on desktop
          'fixed bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),1rem))] right-4 z-40 lg:bottom-6 lg:right-6',
          'flex items-center gap-1.5 rounded-full border border-border/60',
          'bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-lifted',
          'transition-all duration-200 hover:border-primary/40 hover:text-primary hover:shadow-float',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <MessageCirclePlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Feedback
      </button>

      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
