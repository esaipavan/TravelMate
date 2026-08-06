import { ShieldCheck, IndianRupee, WifiOff, Sparkles, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ITEMS: { icon: LucideIcon; text: string }[] = [
  { icon: ShieldCheck, text: 'End-to-end encrypted' },
  { icon: IndianRupee, text: 'Plan in ₹' },
  { icon: WifiOff, text: 'Works offline' },
  { icon: Sparkles, text: 'Free forever' },
  { icon: MapPin, text: 'Built for India' },
];

export function TrustBar() {
  return (
    <div className="border-b border-gray-200 bg-gray-50 py-3 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" role="list">
          {ITEMS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400"
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
