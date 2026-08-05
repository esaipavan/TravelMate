import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  reminderFormSchema,
  REMINDER_TYPES,
  REPEAT_OPTIONS,
  type ReminderRow,
  type ReminderFormValues,
} from '../types';

interface TripOption {
  id: string;
  title: string;
  destination: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: ReminderRow | null;
  trips: TripOption[];
  onSave: (values: ReminderFormValues) => Promise<void>;
  isPending: boolean;
}

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_DEFAULTS: ReminderFormValues = {
  title: '',
  description: '',
  trip_id: null,
  type: '',
  reminder_date: TODAY,
  reminder_time: null,
  priority: 'medium',
  repeat: 'none',
};

export function ReminderDialog({ open, onOpenChange, reminder, trips, onSave, isPending }: Props) {
  const isEdit = !!reminder;

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    if (reminder) {
      form.reset({
        title: reminder.title,
        description: reminder.description ?? '',
        trip_id: reminder.trip_id ?? null,
        type: reminder.type,
        reminder_date: reminder.reminder_date,
        reminder_time: reminder.reminder_time ?? null,
        priority: reminder.priority,
        repeat: reminder.repeat,
      });
    } else {
      form.reset(EMPTY_DEFAULTS);
    }
  }, [open, reminder, form]);

  async function onSubmit(values: ReminderFormValues) {
    await onSave(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEdit ? 'Edit Reminder' : 'New Reminder'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Form {...form}>
            <form
              id="reminder-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4 px-6 py-4"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Reminder title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional notesâ€¦"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REMINDER_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.emoji} {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="reminder_date"
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

                {/* Time */}
                <FormField
                  control={form.control}
                  name="reminder_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Repeat */}
                <FormField
                  control={form.control}
                  name="repeat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REPEAT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trip */}
                <FormField
                  control={form.control}
                  name="trip_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip (optional)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === '_none' ? null : v)}
                        value={field.value ?? '_none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No trip" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">No trip</SelectItem>
                          {trips.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.title} â€” {t.destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
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
          <Button type="submit" form="reminder-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
