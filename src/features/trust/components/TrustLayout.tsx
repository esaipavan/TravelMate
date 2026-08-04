import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

interface TrustLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function TrustLayout({ title, lastUpdated, children }: TrustLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            {APP_NAME}
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to app
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {lastUpdated}</p>
        </div>

        <article className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME} · Private Beta
        </p>
        <div className="mt-3 flex justify-center gap-6 text-xs">
          {[
            { to: '/privacy', label: 'Privacy' },
            { to: '/terms', label: 'Terms' },
            { to: '/security', label: 'Security' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
