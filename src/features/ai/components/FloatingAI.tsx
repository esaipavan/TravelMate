import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Send, Bot, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth.store';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { chatWithAI } from '@/services/ai/ai.service';
import { loadHistory, saveMessages } from '../services/conversation.service';
import type { ConversationMessage } from '../services/conversation.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractTripId(pathname: string): string | null {
  const m = pathname.match(/\/trips\/([^/]+)/);
  return m ? m[1] : null;
}

function buildSystemPrompt(
  trip?: {
    destination?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    title?: string | null;
  } | null,
): string {
  const base = `You are an expert AI travel assistant embedded in TravelMate. Answer concisely using markdown.`;
  if (!trip) return base;
  const parts = [`Trip: ${trip.title ?? trip.destination ?? 'unknown'}`];
  if (trip.destination) parts.push(`Destination: ${trip.destination}`);
  if (trip.start_date)
    parts.push(`Dates: ${trip.start_date}${trip.end_date ? ` → ${trip.end_date}` : ''}`);
  return `${base}\n\n${parts.join(' · ')}\n\nPersonalise every answer to this trip context.`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function dbToUI(m: ConversationMessage): UIMessage {
  return { id: m.id, role: m.role, content: m.content };
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm bg-muted text-foreground'
        }`}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FloatingAI() {
  const reduced = useReducedMotion();
  const { user } = useAuthStore();
  const location = useLocation();
  const tripId = extractTripId(location.pathname);
  const { data: trip } = useTrip(tripId ?? '');

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history when panel opens (or tripId changes)
  useEffect(() => {
    if (!open || !user?.id) return;
    setHistoryLoaded(false);
    void loadHistory(user.id, tripId).then((history) => {
      setMessages(history.map(dbToUI));
      setHistoryLoaded(true);
    });
  }, [open, user?.id, tripId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
  }, [messages, reduced]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!user) return null;

  const systemPrompt = buildSystemPrompt(trip);

  async function send() {
    const text = input.trim();
    const userId = user?.id;
    if (!text || loading || !userId) return;
    setInput('');

    const userMsg: UIMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build message array from current history (last 20) + new message
      const history = messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));
      const response = await chatWithAI([...history, { role: 'user' as const, content: text }], {
        systemPrompt,
        tripContext: trip
          ? {
              tripId: tripId ?? '',
              destination: trip.destination ?? '',
              startDate: trip.start_date ?? '',
              endDate: trip.end_date ?? '',
              budget: trip.total_budget ?? undefined,
              currency: trip.currency,
            }
          : undefined,
      });
      const assistantMsg: UIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      saveMessages(userId, tripId, text, response.content);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Sorry, I couldn't connect. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function reset() {
    setMessages([]);
  }

  const panelVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 16, scale: 0.97 },
  };

  const reducedPanelVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-[4.5rem] right-4 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
            variants={reduced ? reducedPanelVariants : panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                {trip && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {trip.destination ?? trip.title}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={reset}
                aria-label="Clear conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {!historyLoaded ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Ask me anything</p>
                    <p className="text-xs text-muted-foreground">
                      {trip
                        ? `I know your ${trip.destination ?? 'trip'} details. Ask about packing, budget, itinerary, or local tips.`
                        : 'Ask about destinations, packing, budgets, or travel tips.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {(trip
                      ? ['Best spots to visit', 'What to pack?', 'Budget tips', 'Local food']
                      : ['Plan a beach trip', 'Packing essentials', 'Budget travel tips']
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setInput(s);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <Bubble key={msg.id} msg={msg} />
                  ))}
                  {loading && (
                    <div className="flex gap-2">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      </div>
                      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything…"
                  rows={1}
                  className="min-h-[38px] resize-none text-sm"
                  style={{ height: 'auto', maxHeight: '96px' }}
                  disabled={loading || !historyLoaded}
                />
                <Button
                  size="icon"
                  className="h-[38px] w-[38px] shrink-0"
                  onClick={() => void send()}
                  disabled={!input.trim() || loading || !historyLoaded}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
                AI responses may be inaccurate. Verify important info.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        className="fixed bottom-[4.75rem] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20 transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 lg:bottom-6"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
        whileHover={reduced ? {} : { scale: 1.08 }}
        whileTap={reduced ? {} : { scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="s"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
