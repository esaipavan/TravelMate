import { useState } from 'react';
import { Star, Bug, Lightbulb, MessageCircle, Mail, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubmitFeedback, useSubmitBugReport } from '../hooks/useFeedback';
import type { FeedbackType } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPES: {
  value: FeedbackType | 'bug';
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  { value: 'bug', label: 'Bug Report', icon: Bug, desc: 'Something is broken or not working' },
  {
    value: 'feature_request',
    label: 'Feature Request',
    icon: Lightbulb,
    desc: 'Suggest something new',
  },
  { value: 'general', label: 'General Feedback', icon: MessageCircle, desc: 'Share your thoughts' },
  {
    value: 'compliment',
    label: 'Say Hi / Contact',
    icon: Mail,
    desc: 'Get in touch with the team',
  },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Star
            className={cn(
              'h-7 w-7 transition-colors',
              n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function FeedbackDialog({ open, onOpenChange }: Props) {
  const [type, setType] = useState<FeedbackType | 'bug'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [steps, setSteps] = useState('');

  const feedbackMutation = useSubmitFeedback();
  const bugMutation = useSubmitBugReport();

  const isBug = type === 'bug';
  const showRating = type === 'general' || type === 'compliment';
  const isPending = feedbackMutation.isPending || bugMutation.isPending;

  function reset() {
    setType('general');
    setSubject('');
    setMessage('');
    setRating(0);
    setSeverity('medium');
    setSteps('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    if (isBug) {
      await bugMutation.mutateAsync({
        title: subject.trim() || 'Bug report',
        description: message.trim(),
        steps: steps.trim() || undefined,
        severity,
      });
    } else {
      await feedbackMutation.mutateAsync({
        type: type as FeedbackType,
        subject: subject.trim() || type,
        message: message.trim(),
        rating: showRating && rating > 0 ? rating : undefined,
      });
    }

    reset();
    onOpenChange(false);
  }

  const selected = TYPES.find((t) => t.value === type)!;
  const SelectedIcon = selected.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4 text-primary" aria-hidden="true" />
            Share Feedback
          </DialogTitle>
          <DialogDescription>
            Help us build the best travel companion. Every message reaches the founding team.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <form
            id="feedback-form"
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-4 px-6 py-4"
          >
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(({ value: v, label, icon: Icon }) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={type === v}
                  onClick={() => setType(v)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    type === v
                      ? 'border-primary/60 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-border/80 hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {/* Star rating (general/compliment only) */}
            {showRating && (
              <div className="space-y-1.5">
                <Label>How&apos;s TravelMate treating you?</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>
            )}

            {/* Severity (bug only) */}
            {isBug && (
              <div className="space-y-1.5">
                <Label htmlFor="fb-severity">Severity</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                  <SelectTrigger id="fb-severity">
                    <SelectValue />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low â€” minor inconvenience</SelectItem>
                    <SelectItem value="medium">Medium â€” affects my workflow</SelectItem>
                    <SelectItem value="high">High â€” blocking core feature</SelectItem>
                    <SelectItem value="critical">Critical â€” data loss / crash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="fb-subject">{isBug ? 'Title' : 'Subject'}</Label>
              <Input
                id="fb-subject"
                placeholder={isBug ? 'What happened?' : 'One-line summary (optional)'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="fb-message">
                {isBug ? 'Description' : 'Message'}
                <span className="ml-1 text-destructive" aria-label="required">
                  *
                </span>
              </Label>
              <Textarea
                id="fb-message"
                placeholder={
                  isBug
                    ? 'Describe what went wrong and what you expected to happenâ€¦'
                    : 'Tell us what you thinkâ€¦'
                }
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
              />
            </div>

            {/* Steps to reproduce (bug only) */}
            {isBug && (
              <div className="space-y-1.5">
                <Label htmlFor="fb-steps">Steps to reproduce (optional)</Label>
                <Textarea
                  id="fb-steps"
                  placeholder="1. Go toâ€¦&#10;2. Clickâ€¦&#10;3. See error"
                  rows={3}
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  maxLength={1000}
                />
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" form="feedback-form" disabled={isPending || !message.trim()}>
            {isPending ? 'Sendingâ€¦' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
