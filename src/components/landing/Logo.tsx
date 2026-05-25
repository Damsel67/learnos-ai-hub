export function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      {/* L stroke */}
      <path
        d="M8 6 V20 a2 2 0 0 0 2 2 H16"
        stroke="url(#lo-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* O node ring */}
      <circle cx="22" cy="22" r="5" stroke="url(#lo-grad)" strokeWidth="2.4" fill="none" />
      {/* node dots */}
      <circle cx="8" cy="6" r="1.6" fill="#2EE6A6" />
      <circle cx="22" cy="22" r="1.6" fill="#2EE6A6" />
    </svg>
  );
}
