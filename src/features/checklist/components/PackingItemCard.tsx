import { memo } from 'react';
import { Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PACKING_CATEGORIES } from '../types';
import type { PackingItemRow } from '../types';

interface Props {
  item: PackingItemRow;
  onToggle: (item: PackingItemRow) => void;
  onEdit: (item: PackingItemRow) => void;
  onDelete: (item: PackingItemRow) => void;
}

const emojiMap = Object.fromEntries(PACKING_CATEGORIES.map((c) => [c.value, c.emoji]));

export const PackingItemCard = memo(function PackingItemCard({
  item,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const emoji = emojiMap[item.category ?? 'Other'] ?? '📦';

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm ${
        item.is_packed ? 'opacity-60' : ''
      }`}
    >
      <Checkbox
        checked={item.is_packed}
        onCheckedChange={() => onToggle(item)}
        aria-label={`Mark ${item.name} as ${item.is_packed ? 'unpacked' : 'packed'}`}
        className="shrink-0"
      />

      <span
        className="shrink-0 text-lg leading-none"
        role="img"
        aria-label={item.category ?? 'Other'}
      >
        {emoji}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={`font-medium leading-snug ${
              item.is_packed ? 'text-muted-foreground line-through' : ''
            }`}
          >
            {item.name}
          </p>
          {item.is_essential && (
            <Star
              className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
              aria-label="Essential"
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.category && <span>{item.category}</span>}
          {item.quantity > 1 && <span>× {item.quantity}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => onEdit(item)}
          aria-label="Edit item"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item)}
          aria-label="Delete item"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
});
