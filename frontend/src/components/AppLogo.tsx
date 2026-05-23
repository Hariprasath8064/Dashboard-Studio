interface Props {
  size?: number
  showWordmark?: boolean
}

/** Dashboard Studio brand mark — grid + chart bars */
export default function AppLogo({ size = 36, showWordmark = true }: Props) {
  return (
    <div className="app-logo">
      <div className="app-logo-mark" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />
          <rect x="8" y="8" width="10" height="10" rx="2.5" fill="white" fillOpacity="0.95" />
          <rect x="22" y="8" width="10" height="10" rx="2.5" fill="white" fillOpacity="0.55" />
          <rect x="8" y="22" width="10" height="10" rx="2.5" fill="white" fillOpacity="0.75" />
          <path
            d="M22 28V22h3v2h2v4h-2v-2h-1v2h-2zm4-6V18h2v4h-2zm3 3V15h2v7h-2z"
            fill="white"
            fillOpacity="0.9"
          />
          <defs>
            <linearGradient id="logo-bg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0072CE" />
              <stop offset="1" stopColor="#004494" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showWordmark && (
        <span className="app-logo-title">Dashboard Studio</span>
      )}
    </div>
  )
}
