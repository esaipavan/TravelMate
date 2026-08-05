import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, FileText, File as FileIcon, Loader2 } from 'lucide-react';
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
  documentFormSchema,
  DOCUMENT_TYPES,
  ACCEPTED_EXT_STR,
  MAX_FILE_SIZE,
  formatFileSize,
  isImageUrl,
  isPdfUrl,
  type TravelDocumentRow,
  type DocumentFormValues,
} from '../types';

interface TripOption {
  id: string;
  title: string;
  destination: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: TravelDocumentRow | null;
  trips: TripOption[];
  onSave: (values: DocumentFormValues, file?: File) => Promise<void>;
  isPending: boolean;
  defaultTripId?: string | null;
}

const EMPTY_DEFAULTS: DocumentFormValues = {
  name: '',
  type: '',
  trip_id: null,
  country: '',
  expiry_date: null,
  notes: '',
};

export function DocumentDialog({
  open,
  onOpenChange,
  document: doc,
  trips,
  onSave,
  isPending,
  defaultTripId,
}: Props) {
  const isEdit = !!doc;

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    if (doc) {
      form.reset({
        name: doc.name,
        type: doc.type,
        trip_id: doc.trip_id,
        country: doc.country ?? '',
        expiry_date: doc.expiry_date ?? null,
        notes: doc.notes ?? '',
      });
    } else {
      form.reset({ ...EMPTY_DEFAULTS, trip_id: defaultTripId ?? null });
    }
    setFile(null);
    setFilePreview(null);
    setFileError('');
  }, [open, doc, defaultTripId, form]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    if (picked.size > MAX_FILE_SIZE) {
      setFileError('File exceeds 10 MB limit');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setFileError('');
    setFile(picked);

    // Auto-fill name from filename (strip extension)
    if (!form.getValues('name')) {
      const nameWithoutExt = picked.name.replace(/\.[^.]+$/, '');
      form.setValue('name', nameWithoutExt);
    }

    // Preview for images
    if (picked.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(picked);
    } else {
      setFilePreview(null);
    }

    if (fileRef.current) fileRef.current.value = '';
  }

  function clearFile() {
    setFile(null);
    setFilePreview(null);
    setFileError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onSubmit(values: DocumentFormValues) {
    if (!isEdit && !file) {
      setFileError('Please select a file');
      return;
    }
    await onSave(values, file ?? undefined);
  }

  const currentFileUrl = doc?.file_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEdit ? 'Edit Document' : 'Upload Document'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Form {...form}>
            <form
              id="doc-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4 px-6 py-4"
            >
              {/* File picker (create only) */}
              {!isEdit && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    File <span className="text-destructive">*</span>
                  </p>

                  {file ? (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Document preview"
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <FileText className="h-8 w-8 shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <button type="button" onClick={clearFile} className="shrink-0">
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="h-6 w-6" />
                      <span>Click to upload PDF, JPG, or PNG</span>
                      <span className="text-xs">Max 10 MB</span>
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_EXT_STR}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                </div>
              )}

              {/* Edit mode: current file info */}
              {isEdit && currentFileUrl && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                  {isImageUrl(currentFileUrl) ? (
                    <img
                      src={currentFileUrl}
                      alt="Current document"
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : isPdfUrl(currentFileUrl) ? (
                    <FileText className="h-8 w-8 shrink-0 text-red-500" />
                  ) : (
                    <FileIcon className="h-8 w-8 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-muted-foreground">Current file</p>
                    <p className="truncate text-sm">{doc?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc?.file_size)}
                    </p>
                  </div>
                </div>
              )}

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Document title" {...field} />
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
                          {DOCUMENT_TYPES.map((dt) => (
                            <SelectItem key={dt.value} value={dt.value}>
                              {dt.emoji} {dt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. India" {...field} />
                      </FormControl>
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

                {/* Expiry date */}
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notesâ€¦"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          <Button type="submit" form="doc-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
