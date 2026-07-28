import { motion, useReducedMotion } from 'framer-motion';
import { rv, LIST_VARIANTS } from '@/lib/motion';
import { type TravelDocumentRow, type DocumentType } from '../../types';
import { DocumentVaultCard } from './DocumentVaultCard';

export interface DocGroup {
  key: string;
  label: string;
  emoji: string;
  types: DocumentType[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const DOC_GROUPS: DocGroup[] = [
  {
    key: 'identity',
    label: 'Identity',
    emoji: '🛂',
    types: ['passport', 'visa', 'driving_license'],
  },
  {
    key: 'transport',
    label: 'Transport',
    emoji: '✈️',
    types: ['flight_ticket', 'train_ticket', 'bus_ticket'],
  },
  { key: 'accomm', label: 'Accommodation', emoji: '🏨', types: ['hotel'] },
  { key: 'health', label: 'Insurance & Health', emoji: '🛡️', types: ['insurance', 'vaccination'] },
  { key: 'other', label: 'Other', emoji: '📄', types: ['ticket', 'other'] },
];

interface Props {
  label: string;
  emoji: string;
  documents: TravelDocumentRow[];
  tripMap: Record<string, string>;
  onEdit: (doc: TravelDocumentRow) => void;
  onDelete: (doc: TravelDocumentRow) => void;
}

export function DocumentGroupSection({
  label,
  emoji,
  documents,
  tripMap,
  onEdit,
  onDelete,
}: Props) {
  const reduced = useReducedMotion();

  if (documents.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </h2>
        <span className="ml-1 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {documents.length}
        </span>
      </div>

      <motion.div
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-20px' }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {documents.map((doc) => (
          <DocumentVaultCard
            key={doc.id}
            document={doc}
            tripTitle={doc.trip_id ? tripMap[doc.trip_id] : undefined}
            onEdit={onEdit}
            onDelete={onDelete}
            staggered
          />
        ))}
      </motion.div>
    </section>
  );
}
