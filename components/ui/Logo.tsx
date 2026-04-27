export default function Logo({
    size = 36,
    showText = true,
  }: {
    size?:     number
    showText?: boolean
  }) {
    return (
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#7B2FBE" />
              <stop offset="60%"  stopColor="#4F8EF7" />
              <stop offset="100%" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
  
          {/* Rounded square outline */}
          <rect
            x="6" y="6"
            width="88" height="88"
            rx="22" ry="22"
            stroke="url(#logo-grad)"
            strokeWidth="6"
            fill="none"
          />
  
          {/* 42 text */}
          <text
            x="50" y="68"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="46"
            fill="url(#logo-grad)"
          >
            42
          </text>
  
          {/* Sparkle */}
          <g transform="translate(72, 12)">
            <path
              d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z"
              fill="white"
              opacity="0.9"
            />
          </g>
        </svg>
  
        {/* Text */}
        {showText && (
          <div className="flex items-baseline gap-0.5">
            <span className="font-black text-white text-lg tracking-tight">
              Studio42
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: '#00C2FF' }}
            >
              .ai
            </span>
          </div>
        )}
      </div>
    )
  }