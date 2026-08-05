import { useState, useEffect } from 'react';
import { GripVertical, PlusCircle, Clock } from 'lucide-react';
import { parseISO, isBefore, startOfDay } from 'date-fns';
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
import { formatDate, formatCurrency } from '@/utils/formatters';
import { useReorderItems } from '../hooks/useItinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { ItemDialog } from './ItemDialog';
import { DeleteItemDialog } from './DeleteItemDialog';
import type { ItineraryDay, ItineraryItemRow } from '../types';

interface SortableItemProps {
  item: ItineraryItemRow;
  currency: string;
  onEdit: (item: ItineraryItemRow) => void;
  onDelete: (item: ItineraryItemRow) => void;
}

function SortableItem({ item, currency, onEdit, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItineraryItemCard
        item={item}
        currency={currency}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <button
            {...attributes}
            {...listeners}
            className="touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}

interface Props {
  day: ItineraryDay;
  tripId: string;
  currency: string;
}

export function DaySection({ day, tripId, currency }: Props) {
  const [items, setItems] = useState<ItineraryItemRow[]>(day.items);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItineraryItemRow | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ItineraryItemRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setItems(day.items);
  }, [day.items]);

  const { mutate: reorderItems } = useReorderItems(tripId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    reorderItems(reordered.map((item, idx) => ({ id: item.id, order_index: idx })));
  }

  function openEdit(item: ItineraryItemRow) {
    setEditItem(item);
    setEditOpen(true);
  }
  function openDelete(item: ItineraryItemRow) {
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  const totalCost = items.reduce((s, i) => s + (i.estimated_cost ?? 0), 0);
  const isPast = isBefore(parseISO(day.date + 'T00:00:00'), startOfDay(new Date()));

  return (
    <div className={`rounded-lg border bg-card ${isPast ? 'opacity-60' : ''}`}>
      {/* Day header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}
          >
            {day.day_number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold leading-tight">Day {day.day_number}</h3>
              {isPast && (
                <span className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                  Past
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(day.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalCost > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              Est. {formatCurrency(totalCost, currency)}
            </span>
          )}
          {!isPast && (
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="p-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {isPast ? (
              'Nothing was planned for this day.'
            ) : (
              <>
                No activities yet.{' '}
                <button
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={() => setAddOpen(true)}
                >
                  Add one
                </button>
              </>
            )}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    currency={currency}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add dialog */}
      <ItemDialog
        tripId={tripId}
        dayId={day.id}
        nextOrderIndex={items.length}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {/* Edit dialog */}
      <ItemDialog
        tripId={tripId}
        dayId={day.id}
        nextOrderIndex={items.length}
        item={editItem}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditItem(undefined);
        }}
      />

      {/* Delete dialog */}
      <DeleteItemDialog
        tripId={tripId}
        item={deleteTarget}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
