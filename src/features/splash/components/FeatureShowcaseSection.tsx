import { useState, useRef } from 'react';
import { LayoutDashboard, Map, MessageSquare, Wallet, FileText } from 'lucide-react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  headline: string;
  description: string;
  accent: string;
  visual: React.ReactNode;
}

function DashboardVisual() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-700">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-400">Upcoming</p>
          <p className="text-[15px] font-bold text-gray-900 dark:text-white">Manali Trip</p>
        </div>
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          In 12 days
        </span>
      </div>
      <div className="mb-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-[12px] font-medium text-blue-800 dark:text-blue-200">
          🌅 Morning Brief — Weather: -2°C. Pack thermals. Bus departs 6:00 AM from ISBT.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Budget', value: '₹32K', sub: 'of ₹45K' },
          { label: 'Days', value: '7', sub: 'planned' },
          { label: 'People', value: '4', sub: 'in group' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-600">
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItineraryVisual() {
  const days = [
    { day: 'Day 1', activity: 'Arrive Delhi → overnight bus to Manali', tag: 'Transit' },
    { day: 'Day 2', activity: 'Manali arrival, Hadimba Temple, Old Manali', tag: 'Explore' },
    { day: 'Day 3', activity: 'Solang Valley — skiing & cable car', tag: 'Adventure' },
    { day: 'Day 4', activity: 'Rohtang Pass (permit required)', tag: 'Permit' },
  ];
  return (
    <div className="space-y-2">
      {days.map((d) => (
        <div
          key={d.day}
          className="flex items-start gap-3 rounded-lg bg-white p-3 dark:bg-gray-700"
        >
          <div className="mt-0.5 w-10 flex-shrink-0 text-center">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400">{d.day}</p>
          </div>
          <p className="flex-1 text-[12px] text-gray-700 dark:text-gray-200">{d.activity}</p>
          <span className="flex-shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            {d.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

function AIChatVisual() {
  const messages = [
    { from: 'user', text: 'What should I pack for Kedarnath in October?' },
    {
      from: 'ai',
      text: 'For Kedarnath in October: thermals (base layer), heavy fleece, waterproof jacket, trekking shoes, and warm gloves. Temperature drops to 0–5°C at night. Carry your yatra registration.',
    },
    { from: 'user', text: 'Is it safe to trek without a guide?' },
    {
      from: 'ai',
      text: "The main pilgrimage route is well-marked and patrolled. A guide isn't mandatory but is helpful for the Vasuki Tal side trek. Check GMVN advisories before starting.",
    },
  ];
  return (
    <div className="space-y-2.5">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
              msg.from === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetVisual() {
  const expenses = [
    { who: 'Priya', item: 'Villa booking', amount: 12000, paid: true },
    { who: 'Arjun', item: 'Groceries & food', amount: 8500, paid: true },
    { who: 'You', item: 'Water sports', amount: 6200, paid: true },
  ];
  return (
    <div className="rounded-xl bg-white p-4 dark:bg-gray-700">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Goa Trip</p>
        <p className="text-[18px] font-bold text-gray-900 dark:text-white">₹48,300 total</p>
      </div>
      <div className="space-y-2">
        {expenses.map((exp) => (
          <div key={exp.item} className="flex items-center gap-2 text-[12px]">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
            <span className="flex-1 text-gray-600 dark:text-gray-300">
              <span className="font-medium">{exp.who}</span> · {exp.item}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{exp.amount.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
        <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
          Settlement: Arjun owes you ₹1,850 · Priya owes Arjun ₹3,100
        </p>
      </div>
    </div>
  );
}

function DocsVisual() {
  const docs = [
    { name: 'Tirupati_Darshan_eTicket.pdf', type: 'PDF', color: 'text-red-500' },
    { name: 'IndiGo_Flight_Booking.pdf', type: 'PDF', color: 'text-red-500' },
    { name: 'Hotel_Confirmation_Goa.pdf', type: 'PDF', color: 'text-red-500' },
    { name: 'Travel_Insurance.pdf', type: 'PDF', color: 'text-red-500' },
  ];
  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div
          key={doc.name}
          className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 dark:bg-gray-700"
        >
          <FileText className={`h-4 w-4 flex-shrink-0 ${doc.color}`} aria-hidden="true" />
          <p className="flex-1 truncate text-[12px] text-gray-700 dark:text-gray-200">{doc.name}</p>
          <span className="text-[10px] text-gray-400">{doc.type}</span>
        </div>
      ))}
      <p className="pt-1 text-center text-[11px] text-gray-400">
        End-to-end encrypted · accessible offline
      </p>
    </div>
  );
}

const TABS: Tab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    headline: 'Everything at a glance.',
    description:
      'See your upcoming trip, AI morning brief, budget status, and group members — all on one screen.',
    accent: '#1D4ED8',
    visual: <DashboardVisual />,
  },
  {
    id: 'itinerary',
    label: 'Itinerary',
    icon: Map,
    headline: 'Day-by-day, drag and drop.',
    description:
      'AI-generated day plans you can edit. Add activities, reorder days, and share the final plan with your group.',
    accent: '#8B5CF6',
    visual: <ItineraryVisual />,
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: MessageSquare,
    headline: 'Ask anything about your trip.',
    description:
      "Your AI knows your itinerary, budget, and destination. Ask packing questions, get safety tips, or plan a detour — it has context you'd otherwise have to explain.",
    accent: '#0EA5E9',
    visual: <AIChatVisual />,
  },
  {
    id: 'budget',
    label: 'Group Budget',
    icon: Wallet,
    headline: 'Who paid what. Who owes whom.',
    description:
      'Track group expenses in ₹, auto-split bills, and settle up at the end. No spreadsheets, no awkward chases.',
    accent: '#16A34A',
    visual: <BudgetVisual />,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    headline: 'All your travel docs, organized.',
    description:
      'Upload confirmations once. Access passports, tickets, permits, and insurance — all in one encrypted vault, accessible offline.',
    accent: '#F59E0B',
    visual: <DocsVisual />,
  },
];

export function FeatureShowcaseSection() {
  const [active, setActive] = useState<string>('dashboard');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;

  const tab = TABS.find((t) => t.id === active)!;
  const TabIcon = tab.icon;

  return (
    <section
      className="bg-[#FAFAF7] py-20 dark:bg-gray-950"
      aria-label="Feature Showcase"
      id="showcase"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-purple-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            Inside the App
          </span>
          <h2 className="mb-4 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white sm:text-[36px]">
            Built for how you actually travel.
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-gray-500 dark:text-gray-400">
            Five tools that replace the five apps you currently use. All connected, all in sync.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Tab bar */}
          <div
            className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
            role="tablist"
            aria-label="App features"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`showcase-panel-${t.id}`}
                  onClick={() => setActive(t.id)}
                  className={`flex min-w-max flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                    isActive
                      ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  style={isActive ? { borderColor: t.accent, color: t.accent } : {}}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              id={`showcase-panel-${active}`}
              role="tabpanel"
              aria-label={tab.label}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid gap-8 p-6 lg:grid-cols-[1fr_1.4fr] lg:p-8"
            >
              {/* Copy */}
              <div className="flex flex-col justify-center">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: tab.accent + '18' }}
                  aria-hidden="true"
                >
                  <TabIcon className="h-5 w-5" style={{ color: tab.accent }} />
                </div>
                <h3 className="mb-3 text-[22px] font-bold text-gray-900 dark:text-white">
                  {tab.headline}
                </h3>
                <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {tab.description}
                </p>
              </div>

              {/* Visual */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/60">{tab.visual}</div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
