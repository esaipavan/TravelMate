import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PROMPTS = ['Best time to visit Bali?', 'Budget tips for Europe', 'Hidden gems in Japan'];

export function AIAssistantPreview() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border-0 p-[1px] shadow-float"
      style={{ background: 'linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))' }}
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? {} : { scale: 1.01 }}
    >
      {/* Inner card */}
      <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-gradient-to-br from-primary/90 to-accent/80 p-5">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

        {/* Icon + heading */}
        <div className="relative space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                AI Assistant
              </p>
              <p className="text-sm font-bold text-white">Ask me anything</p>
            </div>
          </div>

          {/* Prompt chips */}
          <div className="flex flex-wrap gap-1.5">
            {PROMPTS.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
              >
                <MessageCircle className="h-2.5 w-2.5" />
                {p}
              </span>
            ))}
          </div>

          <Button
            asChild
            size="sm"
            className="w-full border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
          >
            <Link to="/assistant">
              Start chatting
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
