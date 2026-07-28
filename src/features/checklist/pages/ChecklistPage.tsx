import { useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, PackageOpen, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useChecklistData, useTogglePacked } from '../hooks/useChecklist';
import { ProgressCard } from '../components/ProgressCard';
import { PackingItemCard } from '../components/PackingItemCard';
import { ItemDialog } from '../components/ItemDialog';
import { DeleteItemDialog } from '../components/DeleteItemDialog';
import { PACKING_CATEGORIES } from '../types';
import type { PackingItemRow, FilterStatus } from '../types';

function ChecklistSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-36 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useChecklistData(tripId!);
  const { mutate: togglePacked } = useTogglePacked(tripId!);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PackingItemRow | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PackingItemRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = data?.items ?? [];
    if (catFilter !== 'all') {
      result = result.filter((i) => (i.category ?? 'Other') === catFilter);
    }
    if (statusFilter === 'packed') result = result.filter((i) => i.is_packed);
    if (statusFilter === 'unpacked') result = result.filter((i) => !i.is_packed);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [data, catFilter, statusFilter, search]);

  if (isLoading) return <ChecklistSkeleton />;
  if (isError || !data) return <Navigate to="/trips" replace />;

  const { tripTitle } = data;
  const items: PackingItemRow[] = data.items;

  const hasActiveFilters = search !== '' || catFilter !== 'all' || statusFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setCatFilter('all');
    setStatusFilter('all');
  }

  function handleToggle(item: PackingItemRow) {
    togglePacked(
      { id: item.id, is_packed: !item.is_packed },
      { onError: () => toast.error('Failed to update item.') },
    );
  }

  function openEdit(item: PackingItemRow) {
    setEditItem(item);
    setEditOpen(true);
  }
  function openDelete(item: PackingItemRow) {
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  const usedCategories = Array.from(new Set(items.map((i) => i.category ?? 'Other'))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          aria-label="Back to trip"
          asChild
        >
          <Link to={`/trips/${tripId}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <PageHeader title="Packing Checklist" description={tripTitle}>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </PageHeader>
      </div>

      {/* Progress */}
      {items.length > 0 && <ProgressCard items={items} />}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items…"
            aria-label="Search packing items"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {usedCategories.map((cat) => {
              const meta = PACKING_CATEGORIES.find((c) => c.value === cat);
              return (
                <SelectItem key={cat} value={cat}>
                  {meta?.emoji ?? '📦'} {cat}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All items</SelectItem>
            <SelectItem value="unpacked">Unpacked</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Item list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <PackageOpen className="h-10 w-10 text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="font-medium">No items yet</p>
            <p className="text-sm text-muted-foreground">
              Start adding items to pack for your trip
            </p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add your first item
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="font-medium">No items match your filters</p>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' matching filters'}
            {' · '}
            <span className="font-medium tabular-nums">
              {filtered.filter((i) => i.is_packed).length} packed
            </span>
          </p>
          {filtered.map((item) => (
            <PackingItemCard
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ItemDialog
        tripId={tripId!}
        totalItems={items.length}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      <ItemDialog
        tripId={tripId!}
        totalItems={items.length}
        item={editItem}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditItem(undefined);
        }}
      />
      <DeleteItemDialog
        tripId={tripId!}
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
