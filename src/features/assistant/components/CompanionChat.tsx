import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, Bot, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { chatWithAI } from '@/services/ai/ai.service';
import { getTripStatus } from '@/utils/tripStatus';
import type { TripRow } from '@/features/trips/types';
import type { AIMessage } from '@/services/ai/ai.types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(trip: TripRow): string {
  const status = getTripStatus(trip);
  const budget = trip.total_budget ? `${trip.total_budget} ${trip.currency}` : 'not set';
  return `You are a friendly, knowledgeable AI travel companion for TravelMate. Current trip: "${trip.title}" to ${trip.destination}, ${trip.start_date}–${trip.end_date}, status: ${status}, budget: ${budget}. Give concise, practical travel advice. Stay focused on travel topics.`;
}

interface Props {
  trip: TripRow;
}

export function CompanionChat({ trip }: Props) {
  const reduced = useReducedMotion();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }, [messages, isLoading, reduced]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const snapshot = messages;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);

    try {
      const history: AIMessage[] = [
        { role: 'system', content: buildSystemPrompt(trip) },
        ...snapshot.slice(-10).map((m) => ({ role: m.role, content: m.content }) as AIMessage),
        { role: 'user', content: text },
      ];
      const res = await chatWithAI(history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const shortDestination = trip.destination.split(',')[0];

  return (
    <motion.section
      aria-label="AI travel companion chat"
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="h-3.5 w-3.5 text-primary" aria-hidden />
        </div>
        <span className="text-sm font-semibold text-foreground">Chat</span>
        <span className="ml-auto truncate text-xs text-muted-foreground">{shortDestination}</span>
      </div>

      {/* Message area */}
      <div
        className="flex max-h-72 min-h-[140px] flex-col overflow-y-auto px-5 py-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Bot className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">Ask your travel companion</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Local tips for {shortDestination}, packing advice, budget help, food spots, or
              must-see attractions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}
                initial={reduced ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === 'assistant' && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3 w-3 text-primary" aria-hidden />
                  </div>
                )}
                <p
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground',
                  )}
                >
                  {msg.content}
                </p>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3 w-3 text-primary" aria-hidden />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-muted px-3.5 py-2.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  Thinking…
                </span>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} aria-hidden />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 px-5 py-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            disabled={isLoading}
            placeholder={`Ask about ${shortDestination}…`}
            aria-label="Type your message"
            className={cn(
              'flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'disabled:opacity-50',
            )}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className={cn(
              'flex h-[52px] w-10 shrink-0 items-center justify-center rounded-xl',
              'bg-primary text-primary-foreground shadow-sm',
              'transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </motion.section>
  );
}
