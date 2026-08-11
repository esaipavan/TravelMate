import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { chatWithAI } from '@/services/ai/ai.service';

const PROMPTS = [
  {
    label: 'Write a vivid journal entry',
    icon: '✍️',
    prompt: (dest: string) =>
      `Write a vivid, first-person travel journal entry (200-250 words) for a traveller visiting ${dest}. Include sensory details — sights, sounds, smells. Make it personal and memorable. Return only the journal entry text, no heading.`,
  },
  {
    label: 'Draft a travel story',
    icon: '📖',
    prompt: (dest: string) =>
      `Write a short travel narrative (180-220 words) about exploring ${dest} — a small adventure or discovery that captures the spirit of the place. First-person, past tense. Return only the story text.`,
  },
  {
    label: 'Describe a local experience',
    icon: '🌏',
    prompt: (dest: string) =>
      `Write a 150-200 word journal entry about a memorable local experience in ${dest}: a market, a meal, a conversation with a local, or a hidden gem. First-person, reflective tone. Return only the entry text.`,
  },
] as const;

interface Props {
  tripDestination: string;
  onUse: (text: string) => void;
}

export function AIJournalWriter({ tripDestination, onUse }: Props) {
  const [open, setOpen] = useState(false);
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const dest = tripDestination || 'my destination';

  async function generate(idx: number) {
    setActivePrompt(idx);
    setGenerated('');
    setLoading(true);
    try {
      const promptFn = PROMPTS[idx].prompt;
      const result = await chatWithAI([{ role: 'user', content: promptFn(dest) }]);
      setGenerated(result.content.trim());
    } catch {
      setGenerated('Could not generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  function useText() {
    onUse(generated);
    setOpen(false);
    setGenerated('');
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sparkles className="mr-2 h-4 w-4 text-primary" />
        AI Write
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setGenerated('');
            setActivePrompt(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Journal Writer
            </DialogTitle>
            <DialogDescription>
              Generate a journal entry for {dest}. Pick a style below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Style buttons */}
            <div className="grid grid-cols-1 gap-2">
              {PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => void generate(idx)}
                  disabled={loading}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-accent ${activePrompt === idx ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card'}`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="font-medium text-foreground">{p.label}</span>
                  {loading && activePrompt === idx && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Generated text */}
            {generated && (
              <div className="space-y-2">
                <div className="max-h-56 overflow-y-auto rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                  {generated}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={useText} className="flex-1">
                    Use this entry
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void copy()} className="w-24">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  {activePrompt !== null && (
                    <Button variant="ghost" size="sm" onClick={() => void generate(activePrompt)}>
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
