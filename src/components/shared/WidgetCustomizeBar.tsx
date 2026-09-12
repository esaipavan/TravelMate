import { useEffect, useState } from 'react';
import { Settings2, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { WidgetOrderEntry } from '@/hooks/useWidgetOrder';

// Reuses the exact dnd-kit pattern already proven in
// src/features/itinerary/components/DaySection.tsx: DndContext +
// SortableContext (verticalListSortingStrategy) + useSortable, PointerSensor
// + KeyboardSensor for full keyboard drag support, a dedicated drag-handle
// button, and explicit Move Up/Down buttons as a non-drag fallback — so
// reordering widgets is never drag-only here either.

interface RowProps {
  entry: WidgetOrderEntry;
  label: string;
  onToggleHidden: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function SortableRow({ entry, label, onToggleHidden, onMoveUp, onMoveDown }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : entry.hidden ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-xl border border-border/50 bg-card px-2 py-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none rounded p-1.5 text-muted-foreground hover:text-foreground"
        aria-label={`Drag to reorder ${label}`}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <span className={cn('flex-1 truncate text-sm', entry.hidden && 'text-muted-foreground')}>
        {label}
      </span>

      {/* Accessible alternative to drag — same reorder path, no drag required. */}
      <div className="flex items-center">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          aria-label={`Move ${label} up`}
        >
          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          aria-label={`Move ${label} down`}
        >
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={onToggleHidden}
        aria-label={entry.hidden ? `Show ${label}` : `Hide ${label}`}
        aria-pressed={!entry.hidden}
      >
        {entry.hidden ? (
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

interface Props {
  entries: WidgetOrderEntry[];
  labels: Record<string, string>;
  onReorder: (nextIds: string[]) => void;
  onToggleHidden: (id: string) => void;
  /** Widget ids pinned outside the reorderable set (e.g. the page hero) —
   *  shown as context, not draggable. */
  pinnedLabels?: string[];
}

export function WidgetCustomizeBar({
  entries,
  labels,
  onReorder,
  onToggleHidden,
  pinnedLabels = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState(entries.map((e) => e.id));

  // Keep the local drag order in sync when the panel (re)opens or the
  // underlying entries change from outside (e.g. another tab).
  useEffect(() => {
    setLocalOrder(entries.map((e) => e.id));
  }, [entries]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedEntries = localOrder
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is WidgetOrderEntry => !!e);

  function commit(next: string[]) {
    setLocalOrder(next);
    onReorder(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localOrder.indexOf(String(active.id));
    const newIndex = localOrder.indexOf(String(over.id));
    commit(arrayMove(localOrder, oldIndex, newIndex));
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= localOrder.length) return;
    commit(arrayMove(localOrder, index, target));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customize layout</SheetTitle>
          <SheetDescription>
            Drag to reorder, or use the arrows. Hidden widgets stay listed here so you can bring
            them back anytime. Saved on this device only.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {pinnedLabels.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                Always shown first
              </p>
              {pinnedLabels.map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3 py-2 text-sm text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {orderedEntries.map((entry, index) => (
                  <SortableRow
                    key={entry.id}
                    entry={entry}
                    label={labels[entry.id] ?? entry.id}
                    onToggleHidden={() => onToggleHidden(entry.id)}
                    onMoveUp={index > 0 ? () => handleMove(index, -1) : undefined}
                    onMoveDown={
                      index < orderedEntries.length - 1 ? () => handleMove(index, 1) : undefined
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </SheetContent>
    </Sheet>
  );
}
