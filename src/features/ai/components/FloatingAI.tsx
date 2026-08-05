import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Loader2,
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  RotateCcw,
  Search,
  Send,
  Share2,
  Sparkles,
  Square,
  Trash2,
  X,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { chatWithAI } from '@/services/ai/ai.service';
import {
  clearConversation,
  createNewConversation,
  loadHistory,
  saveMessages,
} from '../services/conversation.service';
import { buildRichContext } from '../services/context.builder';
import { MarkdownMessage } from './MarkdownMessage';

// ── Constants ─────────────────────────────────────────────────────────────────

const SAVED_KEY = 'tm_ai_saved';

const TRIP_SUGGESTIONS = [
  'Best spots to visit',
  'What should I pack?',
  'Local food to try',
  'Safety tips',
  'Hidden gems',
  'Best time to go',
];

const GENERAL_SUGGESTIONS = [
  'Plan a beach vacation',
  'Budget travel tips',
  'Packing essentials',
  'Visa requirements',
];

const FOLLOW_UPS = ['Tell me more', 'Give me examples', 'Simplify this', 'What else?'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
  timestamp: Date;
}

interface SavedMessage {
  id: string;
  content: string;
  timestamp: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractTripId(pathname: string): string | null {
  const m = pathname.match(/\/trips\/([^/]+)/);
  return m ? m[1] : null;
}

function getSaved(): SavedMessage[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as SavedMessage[];
  } catch {
    return [];
  }
}

function setSaved(msgs: SavedMessage[]): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(msgs));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function SuggestionChip({ label, onClick }: { label: string; onClick: (label: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
    >
      {label}
    </button>
  );
}

interface MessageActionsProps {
  isSaved: boolean;
  isLast: boolean;
  isStreaming: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  onShare: () => void;
  onCopy: () => void;
}

function MessageActions({
  isSaved,
  isLast,
  isStreaming,
  onSave,
  onRegenerate,
  onShare,
  onCopy,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isStreaming) return null;

  return (
    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <ActionBtn label={copied ? 'Copied!' : 'Copy'} onClick={handleCopy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </ActionBtn>
      <ActionBtn label={isSaved ? 'Unsave' : 'Save'} onClick={onSave}>
        {isSaved ? (
          <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </ActionBtn>
      <ActionBtn label="Share" onClick={onShare}>
        <Share2 className="h-3.5 w-3.5" />
      </ActionBtn>
      {isLast && (
        <ActionBtn label="Regenerate" onClick={onRegenerate}>
          <RotateCcw className="h-3.5 w-3.5" />
        </ActionBtn>
      )}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FloatingAI() {
  const reduced = useReducedMotion();
  const { user } = useAuthStore();
  const location = useLocation();
  const tripId = extractTripId(location.pathname);
  const { data: trip } = useTrip(tripId ?? '');

  // Context data — only fetch when panel is open
  const { data: expenseData } = useExpenseData(tripId && trip ? tripId : '');
  const { data: weather } = useWeather(trip?.destination ?? '');

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<'chat' | 'search'>('chat');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>(getSaved);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [lastUserText, setLastUserText] = useState('');

  const fetchCancelledRef = useRef(false);
  const streamCancelRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Load history ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open || !user?.id) return;
    let cancelled = false;
    setHistoryLoaded(false);
    setShowFollowUps(false);
    void loadHistory(user.id, tripId).then((history) => {
      if (cancelled) return;
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        })),
      );
      setHistoryLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, user?.id, tripId]);

  // ── Auto-scroll & scroll detection ───────────────────────────────────────

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    }
  }, [messages, isFetching, isAtBottom, reduced]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (view === 'search') setTimeout(() => searchRef.current?.focus(), 80);
  }, [view]);

  // ── Global keyboard shortcut ──────────────────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // ── Focus trap ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = panel!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  const handleScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
  }, []);

  if (!user) return null;

  const systemPrompt = buildRichContext({
    trip,
    expenses: expenseData,
    weather,
    intel: undefined,
  });

  const userId = user.id;
  const suggestions = tripId ? TRIP_SUGGESTIONS : GENERAL_SUGGESTIONS;
  const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantId =
    lastAssistantIdx >= 0 ? messages[messages.length - 1 - lastAssistantIdx]?.id : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function runTypewriter(text: string, msgId: string) {
    const delay = Math.max(4, Math.min(20, 1800 / text.length));
    let built = '';
    for (let i = 0; i < text.length; i++) {
      if (streamCancelRef.current) break;
      built += text[i];
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, content: built } : m)));
      await new Promise<void>((r) => setTimeout(r, delay));
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content: text, isStreaming: false } : m)),
    );
    setIsStreaming(false);
    setShowFollowUps(true);
  }

  async function send(overrideText?: string, historyOverride?: UIMessage[]) {
    const text = (overrideText ?? input).trim();
    if (!text || isFetching || isStreaming) return;

    setInput('');
    setLastUserText(text);
    setShowFollowUps(false);
    fetchCancelledRef.current = false;
    streamCancelRef.current = false;
    setIsAtBottom(true);

    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsFetching(true);

    try {
      const history = (historyOverride ?? messages)
        .filter((m) => !m.isError)
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

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

      if (fetchCancelledRef.current) {
        setIsFetching(false);
        return;
      }

      setIsFetching(false);
      setIsStreaming(true);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          isStreaming: true,
          timestamp: new Date(),
        },
      ]);

      await runTypewriter(response.content, assistantId);
      saveMessages(userId, tripId, text, response.content);
    } catch {
      setIsFetching(false);
      if (!fetchCancelledRef.current) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "Sorry, I couldn't connect. Please try again.",
            isError: true,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }

  function stop() {
    fetchCancelledRef.current = true;
    streamCancelRef.current = true;
    setIsFetching(false);
    setIsStreaming(false);
  }

  async function newChat() {
    try {
      await createNewConversation(userId, tripId);
    } catch {
      // non-critical
    }
    setMessages([]);
    setShowFollowUps(false);
    setLastUserText('');
    setHistoryLoaded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function clearChat() {
    setMessages([]);
    setShowFollowUps(false);
    setLastUserText('');
    await clearConversation(userId, tripId);
    toast.success('Conversation cleared');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function regenerate() {
    // Compute pruned history synchronously to avoid stale closure in send()
    const idx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
    const pruned = idx >= 0 ? messages.filter((_, i) => i !== messages.length - 1 - idx) : messages;
    setMessages(pruned);
    const textToRetry =
      lastUserText || [...pruned].reverse().find((m) => m.role === 'user')?.content;
    if (textToRetry) await send(textToRetry, pruned);
  }

  function copyMessage(content: string) {
    void navigator.clipboard.writeText(content).catch(() => {
      toast.error('Could not copy — try selecting text manually.');
    });
  }

  async function shareMessage(content: string) {
    const text = content.replace(/[*_#`]/g, '').slice(0, 500);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TravelMate AI', text });
        return;
      } catch {
        // fall through
      }
    }
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard');
      })
      .catch(() => {
        toast.error('Could not copy');
      });
  }

  function toggleSave(msg: UIMessage) {
    const existing = savedMessages.find((s) => s.id === msg.id);
    let updated: SavedMessage[];
    if (existing) {
      updated = savedMessages.filter((s) => s.id !== msg.id);
      toast.success('Removed from saved');
    } else {
      updated = [
        ...savedMessages,
        { id: msg.id, content: msg.content, timestamp: msg.timestamp.toISOString() },
      ];
      toast.success('Saved response');
    }
    setSavedMessages(updated);
    setSaved(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function scrollToBottom() {
    setIsAtBottom(true);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Search ────────────────────────────────────────────────────────────────

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredSaved = searchQuery.trim()
    ? savedMessages.filter((s) => s.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : savedMessages;

  // ── Animations ────────────────────────────────────────────────────────────

  const panelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 16, scale: 0.97 },
  };

  const mobilePanelVariants = {
    hidden: { opacity: 0, y: '100%' },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  };

  const fabVariants = reduced ? {} : { whileHover: { scale: 1.1 }, whileTap: { scale: 0.92 } };

  const isBusy = isFetching || isStreaming;

  // Desktop width: normal = 460px, expanded = 720px
  const desktopWidth = expanded ? 'lg:w-[720px]' : 'lg:w-[460px]';
  const desktopHeight = expanded ? 'lg:h-[80vh] lg:max-h-[800px]' : 'lg:h-[640px]';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="AI assistant"
            aria-modal="true"
            className={cn(
              'fixed z-[60] flex flex-col overflow-hidden',
              // Mobile: full-width bottom sheet
              'inset-x-0 bottom-0 h-[88dvh] rounded-t-3xl',
              // Desktop: floating panel with variable size
              'lg:inset-x-auto lg:bottom-[5.5rem] lg:right-4 lg:rounded-2xl',
              desktopWidth,
              desktopHeight,
              // Glassmorphism
              'border border-border/40 bg-background/90 shadow-lifted backdrop-blur-xl',
              'dark:bg-background/85',
              // Smooth size transition
              'lg:transition-[width,height] lg:duration-300',
            )}
            variants={
              reduced
                ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
                : window.innerWidth < 1024
                  ? mobilePanelVariants
                  : panelVariants
            }
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Mobile drag handle */}
            <div
              className="mx-auto mb-1 mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border/60 lg:hidden"
              aria-hidden
            />

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex shrink-0 items-center gap-2.5 border-b border-border/40 px-4 py-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent, var(--primary))))',
                }}
              >
                <Sparkles className="h-4 w-4 text-white" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-none text-foreground">AI Assistant</p>
                {trip && (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {trip.destination ?? trip.title}
                  </p>
                )}
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-0.5">
                <HeaderBtn
                  label={view === 'search' ? 'Back to chat' : 'Search messages'}
                  onClick={() => {
                    setView((v) => (v === 'search' ? 'chat' : 'search'));
                    setSearchQuery('');
                  }}
                  active={view === 'search'}
                >
                  <Search className="h-4 w-4" />
                </HeaderBtn>
                <HeaderBtn label="New conversation" onClick={() => void newChat()}>
                  <MessageSquarePlus className="h-4 w-4" />
                </HeaderBtn>
                {messages.length > 0 && (
                  <HeaderBtn label="Clear conversation" onClick={() => void clearChat()}>
                    <Trash2 className="h-4 w-4" />
                  </HeaderBtn>
                )}
                {/* Desktop-only expand toggle */}
                <span className="hidden lg:inline-flex">
                  <HeaderBtn
                    label={expanded ? 'Collapse panel' : 'Expand panel'}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </HeaderBtn>
                </span>
                <HeaderBtn label="Close" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </HeaderBtn>
              </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait" initial={false}>
              {view === 'search' ? (
                /* Search view */
                <motion.div
                  key="search"
                  className="flex flex-1 flex-col overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="shrink-0 p-3">
                    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages…"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                        aria-label="Search messages"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          aria-label="Clear search"
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 pb-4">
                    {/* Saved responses */}
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchQuery ? 'Saved matches' : 'Saved responses'}
                    </p>
                    {filteredSaved.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60">No saved responses yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredSaved.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-xl border border-border/50 bg-card p-3 text-xs text-muted-foreground"
                          >
                            <p className="line-clamp-3 leading-relaxed">{s.content}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] opacity-60">
                                {new Date(s.timestamp).toLocaleDateString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = savedMessages.filter((m) => m.id !== s.id);
                                  setSavedMessages(updated);
                                  setSaved(updated);
                                }}
                                aria-label={`Remove saved response: ${s.content.slice(0, 50)}`}
                                className="text-[10px] text-destructive hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search results in conversation */}
                    {searchQuery && filteredMessages.length > 0 && (
                      <>
                        <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          In conversation
                        </p>
                        <div className="space-y-2">
                          {filteredMessages.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setView('chat');
                                setTimeout(() => {
                                  document.getElementById(`msg-${m.id}`)?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                  });
                                }, 200);
                              }}
                              className="w-full rounded-xl border border-border/50 bg-card p-3 text-left"
                            >
                              <span
                                className={cn(
                                  'mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium',
                                  m.role === 'user'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground',
                                )}
                              >
                                {m.role === 'user' ? 'You' : 'AI'}
                              </span>
                              <p className="line-clamp-2 text-xs text-foreground/80">{m.content}</p>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {searchQuery && filteredMessages.length === 0 && filteredSaved.length === 0 && (
                      <p className="mt-4 text-center text-xs text-muted-foreground/60">
                        No results for &ldquo;{searchQuery}&rdquo;
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Chat view */
                <motion.div
                  key="chat"
                  className="flex flex-1 flex-col overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Messages */}
                  <div
                    ref={messagesRef}
                    className="flex-1 overflow-y-auto px-4 py-3"
                    role="log"
                    aria-live="polite"
                    aria-label="Conversation"
                    onScroll={handleScroll}
                  >
                    {!historyLoaded ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
                      </div>
                    ) : messages.length === 0 ? (
                      /* Empty state */
                      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl"
                          style={{
                            background:
                              'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent, var(--primary)) / 0.1))',
                          }}
                        >
                          <Sparkles className="h-7 w-7 text-primary" aria-hidden />
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-semibold text-foreground">Ask me anything</p>
                          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                            {trip
                              ? `I know your ${trip.destination ?? 'trip'} details, spending, and weather. Ask about packing, budget, activities, or local tips.`
                              : 'Destinations, visas, packing, budgets — anything travel.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {suggestions.map((s) => (
                            <SuggestionChip
                              key={s}
                              label={s}
                              onClick={(label) => void send(label)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, idx) => {
                          const isUser = msg.role === 'user';
                          const isLast = msg.id === lastAssistantId;
                          const isSaved = savedMessages.some((s) => s.id === msg.id);

                          // Error message bubble
                          if (msg.isError) {
                            return (
                              <motion.div
                                key={msg.id}
                                id={`msg-${msg.id}`}
                                className="flex items-start gap-2.5"
                                initial={reduced ? {} : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                                  <AlertCircle
                                    className="h-3.5 w-3.5 text-destructive"
                                    aria-hidden
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="rounded-2xl rounded-tl-sm border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
                                    {msg.content}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void regenerate()}
                                    className="flex w-fit items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Retry
                                  </button>
                                </div>
                              </motion.div>
                            );
                          }

                          return (
                            <motion.div
                              key={msg.id}
                              id={`msg-${msg.id}`}
                              className={cn('group flex gap-2.5', isUser && 'flex-row-reverse')}
                              initial={reduced ? {} : { opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Avatar */}
                              {!isUser && (
                                <div
                                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                                  style={{
                                    background:
                                      'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent, var(--primary)) / 0.15))',
                                  }}
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                                </div>
                              )}

                              <div
                                className={cn(
                                  'flex max-w-[82%] flex-col gap-1',
                                  isUser && 'items-end',
                                )}
                              >
                                {/* Bubble */}
                                <div
                                  className={cn(
                                    'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                                    isUser
                                      ? 'rounded-tr-sm bg-primary text-primary-foreground'
                                      : 'rounded-tl-sm bg-muted/80 text-foreground',
                                    msg.isStreaming &&
                                      'after:ml-0.5 after:animate-pulse after:content-["▌"]',
                                  )}
                                >
                                  {isUser ? (
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                  ) : (
                                    <MarkdownMessage content={msg.content} />
                                  )}
                                </div>

                                {/* Actions (assistant only) */}
                                {!isUser && (
                                  <MessageActions
                                    isSaved={isSaved}
                                    isLast={isLast}
                                    isStreaming={!!msg.isStreaming}
                                    onCopy={() => copyMessage(msg.content)}
                                    onSave={() => toggleSave(msg)}
                                    onShare={() => void shareMessage(msg.content)}
                                    onRegenerate={() => void regenerate()}
                                  />
                                )}

                                {/* Timestamp */}
                                {idx === messages.length - 1 && !msg.isStreaming && (
                                  <span className="px-1 text-[10px] text-muted-foreground/50">
                                    {msg.timestamp.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Typing indicator */}
                        {isFetching && (
                          <div className="flex items-start gap-2.5">
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                              style={{
                                background:
                                  'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent, var(--primary)) / 0.15))',
                              }}
                            >
                              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm bg-muted/80 px-3.5 py-2.5">
                              <TypingDots />
                            </div>
                          </div>
                        )}

                        {/* Follow-up suggestions after last response */}
                        {showFollowUps && !isBusy && messages.length > 0 && (
                          <motion.div
                            className="flex flex-wrap gap-1.5 pt-1"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {FOLLOW_UPS.map((f) => (
                              <SuggestionChip key={f} label={f} onClick={(l) => void send(l)} />
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}
                    <div ref={bottomRef} aria-hidden />
                  </div>

                  {/* Scroll-to-bottom button */}
                  <AnimatePresence>
                    {!isAtBottom && messages.length > 0 && (
                      <motion.button
                        type="button"
                        onClick={scrollToBottom}
                        aria-label="Scroll to bottom"
                        className="absolute bottom-[4.5rem] left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-float backdrop-blur-sm hover:text-foreground"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                        New messages
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* ── Input area ───────────────────────────────────── */}
                  <div className="shrink-0 border-t border-border/40 p-3">
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        placeholder="Ask anything…"
                        rows={1}
                        disabled={!historyLoaded}
                        aria-label="Message input"
                        className={cn(
                          'flex-1 resize-none rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm',
                          'placeholder:text-muted-foreground/60',
                          'focus:outline-none focus:ring-2 focus:ring-primary/40',
                          'disabled:opacity-40',
                          'transition-shadow',
                        )}
                        style={{ height: '42px', maxHeight: '120px' }}
                      />

                      {isBusy ? (
                        <button
                          type="button"
                          onClick={stop}
                          aria-label="Stop generation"
                          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Square className="h-4 w-4 fill-current" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void send()}
                          disabled={!input.trim() || !historyLoaded}
                          aria-label="Send message"
                          className={cn(
                            'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                            'transition-all hover:opacity-90 disabled:pointer-events-none disabled:opacity-35',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          )}
                          style={{
                            background:
                              'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent, var(--primary))))',
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
                      ↵ to send · Shift+↵ for new line · ⌘K to toggle
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant (⌘K)'}
        aria-expanded={open}
        className={cn(
          'fixed z-[60] flex h-12 w-12 items-center justify-center rounded-full text-white shadow-glow',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
          'transition-shadow hover:shadow-lifted',
          // Mobile: above FeedbackWidget + mobile nav
          'bottom-[8.5rem] right-4',
          // Desktop: to the left of FeedbackWidget
          'lg:bottom-6 lg:right-[7.5rem]',
        )}
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent, var(--primary))))',
        }}
        {...fabVariants}
      >
        {/* Pulse ring */}
        {!open && (
          <span
            className="absolute inset-0 animate-[tm-pulse-ring_2s_ease-out_infinite] rounded-full"
            style={{ background: 'hsl(var(--primary) / 0.35)' }}
            aria-hidden
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={reduced ? {} : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduced ? {} : { rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="s"
              initial={reduced ? {} : { rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduced ? {} : { rotate: -90, opacity: 0 }}
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

// ── HeaderBtn ─────────────────────────────────────────────────────────────────

function HeaderBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
