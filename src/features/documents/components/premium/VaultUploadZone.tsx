import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UploadCloud, FileText, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';

interface Props {
  onUploadClick: () => void;
}

export function VaultUploadZone({ onUploadClick }: Props) {
  const reduced = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onUploadClick();
  }

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: 'rgba(99,102,241,0.10)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
          <ShieldCheck className="h-[15px] w-[15px]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Secure Upload</p>
          <p className="text-[11px] text-muted-foreground">Add a new document to your vault</p>
        </div>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        onClick={onUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload document"
        className={cn(
          'flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragging
            ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
            : 'hover:bg-indigo-500/3 border-border/60 hover:border-indigo-400/50',
        )}
      >
        <motion.div
          animate={isDragging && !reduced ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200',
            isDragging ? 'bg-indigo-500/15 text-indigo-500' : 'bg-muted/60 text-muted-foreground',
          )}
        >
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </motion.div>

        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Secure encrypted storage · Up to 10 MB per file
          </p>
        </div>

        {/* Format chips */}
        <div className="flex items-center gap-2">
          {[
            { icon: FileText, label: 'PDF', color: 'text-red-400' },
            { icon: ImageIcon, label: 'JPG', color: 'text-blue-400' },
            { icon: ImageIcon, label: 'PNG', color: 'text-green-400' },
          ].map(({ icon: Icon, label, color }) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <Icon className={cn('h-3 w-3', color)} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </button>
    </motion.div>
  );
}
