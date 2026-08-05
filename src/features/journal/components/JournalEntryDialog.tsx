import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  journalEntrySchema,
  type JournalEntryRow,
  type JournalFormValues,
  type MoodEnum,
} from '../types';

const MOODS: { value: MoodEnum; label: string; emoji: string }[] = [
  { value: 'amazing', label: 'Amazing', emoji: 'ðŸ¤©' },
  { value: 'good', label: 'Good', emoji: 'ðŸ˜Š' },
  { value: 'okay', label: 'Okay', emoji: 'ðŸ˜' },
  { value: 'bad', label: 'Bad', emoji: 'ðŸ˜”' },
  { value: 'terrible', label: 'Terrible', emoji: 'ðŸ˜¢' },
];

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_DEFAULTS: JournalFormValues = {
  title: '',
  content: '',
  date: TODAY,
  location_name: '',
  mood: '',
  rating: null,
  is_favourite: false,
  is_public: false,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntryRow | null;
  onSave: (
    values: JournalFormValues,
    existingUrls: string[],
    newFiles: File[],
    removedUrls: string[],
  ) => Promise<void>;
  isPending: boolean;
}

export function JournalEntryDialog({ open, onOpenChange, entry, onSave, isPending }: Props) {
  const isEdit = !!entry;

  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;

    if (entry) {
      form.reset({
        title: entry.title ?? '',
        content: entry.content ?? '',
        date: entry.date,
        location_name: entry.location_name ?? '',
        mood: entry.mood ?? '',
        rating: entry.rating,
        is_favourite: entry.is_favourite,
        is_public: entry.is_public,
      });
      setExistingUrls(entry.image_urls ?? []);
    } else {
      form.reset({ ...EMPTY_DEFAULTS, date: TODAY });
      setExistingUrls([]);
    }

    setRemovedUrls([]);
    setNewFiles([]);
    setNewPreviews([]);
  }, [open, entry, form]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeExisting(url: string) {
    setExistingUrls((p) => p.filter((u) => u !== url));
    setRemovedUrls((p) => [...p, url]);
  }

  function removeNew(idx: number) {
    setNewFiles((p) => p.filter((_, i) => i !== idx));
    setNewPreviews((p) => p.filter((_, i) => i !== idx));
  }

  const ratingValue = form.watch('rating');

  async function onSubmit(values: JournalFormValues) {
    await onSave(values, existingUrls, newFiles, removedUrls);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEdit ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Form {...form}>
            <form
              id="journal-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-5 px-6 py-4"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Give your entry a titleâ€¦" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Destination */}
                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="Where were you?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mood */}
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === '_none' ? '' : v)}
                        value={field.value || '_none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How were you feeling?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">
                            <span className="text-muted-foreground">No mood</span>
                          </SelectItem>
                          {MOODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.emoji} {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Star Rating */}
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex items-center gap-1 pt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const val = i + 1;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => form.setValue('rating', ratingValue === val ? null : val)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              ratingValue != null && val <= ratingValue
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/25 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    {ratingValue != null && (
                      <button
                        type="button"
                        onClick={() => form.setValue('rating', null)}
                        className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </FormItem>
              </div>

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write about your experienceâ€¦ Markdown is supported."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Images */}
              <div className="space-y-2">
                <Label>Photos</Label>

                {(existingUrls.length > 0 || newPreviews.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {existingUrls.map((url) => (
                      <div
                        key={url}
                        className="relative h-20 w-20 overflow-hidden rounded-lg border"
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => removeExisting(url)}
                          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {newPreviews.map((src, i) => (
                      <div
                        key={i}
                        className="relative h-20 w-20 overflow-hidden rounded-lg border border-dashed"
                      >
                        <img src={src} alt="Journal photo" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNew(i)}
                          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Add photos
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <FormField
                  control={form.control}
                  name="is_favourite"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="sw-favourite"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="sw-favourite">Mark as favourite</Label>
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="sw-public"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="sw-public">Make public</Label>
                    </div>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="journal-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
