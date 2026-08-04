import { useState } from 'react';
import { Mail, MessageCircle, Twitter, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { submitFeedback } from '@/features/feedback/services/feedback.service';
import { TrustLayout } from '../components/TrustLayout';

export default function ContactPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await submitFeedback(
        {
          type: 'general',
          subject: `Contact from ${name || 'beta user'}`,
          message: message.trim(),
        },
        user?.id ?? null,
      );
      toast.success('Message sent!', {
        description: "We'll get back to you within 48 hours.",
      });
      setName('');
      setMessage('');
    } catch {
      toast.error('Could not send your message. Email us directly at hello@travelmate.app');
    } finally {
      setSending(false);
    }
  }

  return (
    <TrustLayout title="Contact" lastUpdated="August 2026">
      <p className="text-base text-muted-foreground">
        We&apos;re a small team and we read every message. Expect a reply within 48 hours on
        business days.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Mail,
            label: 'Email',
            value: 'hello@travelmate.app',
            href: 'mailto:hello@travelmate.app',
          },
          {
            icon: MessageCircle,
            label: 'In-app Feedback',
            value: 'Click "Feedback" in the app',
            href: null,
          },
          {
            icon: Twitter,
            label: 'Twitter / X',
            value: '@travelmateapp',
            href: 'https://x.com/travelmateapp',
          },
        ].map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            {href ? (
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="mt-0.5 block text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {value}
              </a>
            ) : (
              <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
            )}
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-6">Send a Message</h2>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-message">
              Message
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            </Label>
            <Textarea
              id="contact-message"
              placeholder="How can we help you?"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={2000}
            />
          </div>
          <Button type="submit" disabled={sending || !message.trim()} className="gap-2">
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            {sending ? 'Sending…' : 'Send Message'}
          </Button>
        </form>
      </section>
    </TrustLayout>
  );
}
