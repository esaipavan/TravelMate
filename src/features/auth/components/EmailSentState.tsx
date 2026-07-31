import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

interface Props {
  email: string;
  /** Message shown below the email address. Defaults to register copy. */
  message?: string;
  /** Footer link label + destination. Defaults to "Back to sign in" → /login. */
  backTo?: { label: string; to: string };
}

export function EmailSentState({
  email,
  message = 'Click the link in the email to verify your account and get started.',
  backTo = { label: 'Back to sign in', to: '/login' },
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20"
      >
        <Mail className="h-6 w-6 text-primary" />
      </div>

      <div className="space-y-1.5">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight text-foreground outline-none"
        >
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a link to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-1.5 rounded-xl border border-border/60 bg-muted/40 p-4 text-left text-sm text-muted-foreground">
        <p>{message}</p>
        <p>Didn't receive it? Check your spam or junk folder.</p>
      </div>

      <Link
        to={backTo.to}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {backTo.label}
      </Link>
    </div>
  );
}
