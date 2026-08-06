import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95'
          : 'bg-white dark:bg-gray-950',
      ].join(' ')}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight text-gray-900 dark:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 shadow-sm">
            <Plane className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {(
            [
              ['#features', 'Features'],
              ['#how-it-works', 'How it works'],
              ['#faq', 'FAQ'],
            ] as [string, string][]
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#F59E0B' }}
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
