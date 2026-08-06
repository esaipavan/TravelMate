import { Link } from 'react-router-dom';
import { Plane, Mail } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Get started', href: '/register' },
  ],
  Trust: [
    { label: 'Privacy Policy — We never sell your data', href: '/privacy' },
    { label: 'Security — End-to-end encrypted', href: '/security' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Contact: [
    { label: 'Sign in', href: '/login' },
    { label: 'Create account', href: '/register' },
  ],
} as const;

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 px-5 pb-10 pt-16 dark:bg-black" aria-label="Site footer">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Plane className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-gray-400">
              AI-powered travel planning for Indian travellers and beyond. Free forever.
            </p>
            <a
              href="mailto:saipavanetikala5@gmail.com"
              className="flex items-center gap-1.5 text-[13px] text-gray-500 transition-colors hover:text-gray-300"
              aria-label="Send email to TravelMate"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              saipavanetikala5@gmail.com
            </a>
          </div>

          {(
            Object.entries(FOOTER_LINKS) as [string, readonly { label: string; href: string }[]][]
          ).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                {section}
              </p>
              {links.map(({ label, href }) =>
                href.startsWith('#') ? (
                  <a
                    key={label}
                    href={href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-200"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={label}
                    to={href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-200"
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-800 pt-6">
          <p className="text-[12px] text-gray-600">
            © {new Date().getFullYear()} {APP_NAME} · Built by Sai Pavan Etikala
          </p>
          <p className="text-[12px] text-gray-600">Made in India 🇮🇳 · Free forever</p>
        </div>
      </div>
    </footer>
  );
}
