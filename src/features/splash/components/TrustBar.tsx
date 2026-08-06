export function TrustBar() {
  const items = [
    { icon: '🔒', text: 'End-to-end encrypted' },
    { icon: '₹', text: 'Plan in rupees' },
    { icon: '📱', text: 'Works offline' },
    { icon: '🆓', text: 'Free forever' },
    { icon: '🇮🇳', text: 'Built for Indian trips' },
  ];

  return (
    <div className="bg-gray-50 py-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
      <div className="mx-auto max-w-6xl px-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" role="list">
          {items.map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-1.5 text-[13px] text-gray-500">
              <span aria-hidden="true">{icon}</span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
