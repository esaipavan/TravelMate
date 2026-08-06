import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
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
  Resources: [
    { label: 'Sign in', href: '/login' },
    { label: 'Create account', href: '/register' },
    { label: 'GitHub', href: 'https://github.com/esaipavan/TravelMate', external: true },
    {
      label: 'Report a bug',
      href: 'https://github.com/esaipavan/TravelMate/issues',
      external: true,
    },
  ],
} as const;

export function SiteFooter() {
  return (
    <footer
      className="bg-white px-5 pb-10 pt-16"
      style={{ borderTop: '1px solid #E5E7EB' }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
                <Plane className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-gray-900">{APP_NAME}</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-gray-400">
              AI-powered travel planning for Indian travellers and beyond. Free forever.
            </p>
          </div>

          {(
            Object.entries(FOOTER_LINKS) as [
              string,
              readonly { label: string; href: string; external?: boolean }[],
            ][]
          ).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                {section}
              </p>
              {links.map(({ label, href, external }) =>
                external ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-gray-400 transition-colors hover:text-gray-700"
                  >
                    {label}
                  </a>
                ) : href.startsWith('#') ? (
                  <a
                    key={label}
                    href={href}
                    className="text-[13px] text-gray-400 transition-colors hover:text-gray-700"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={label}
                    to={href}
                    className="text-[13px] text-gray-400 transition-colors hover:text-gray-700"
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid #F3F4F6' }}
        >
          <p className="text-[12px] text-gray-300">
            © {new Date().getFullYear()} {APP_NAME} · Built by Sai Pavan Etikala
          </p>
          <p className="text-[12px] text-gray-300">Made in India 🇮🇳 · Free forever</p>
        </div>
      </div>
    </footer>
  );
}
