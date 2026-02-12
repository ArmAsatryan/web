export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="hero-grid absolute inset-0" />
      <div className="hero-noise absolute inset-0" />

      <div
        className="hero-orb absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.15]"
        style={{
          background: "radial-gradient(circle, hsl(188 100% 35%) 0%, transparent 70%)",
          top: "10%",
          left: "15%",
          animationDuration: "45s",
        }}
      />
      <div
        className="hero-orb absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.1]"
        style={{
          background: "radial-gradient(circle, hsl(142 76% 40%) 0%, transparent 70%)",
          bottom: "20%",
          right: "10%",
          animationDuration: "55s",
          animationDelay: "-15s",
        }}
      />
      <div
        className="hero-orb absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, hsl(188 100% 50%) 0%, transparent 70%)",
          top: "50%",
          right: "35%",
          animationDuration: "35s",
          animationDelay: "-25s",
        }}
      />

      <svg
        className="hero-trajectory absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="trajGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(188 100% 35%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(188 100% 35%)" stopOpacity="0.3" />
            <stop offset="70%" stopColor="hsl(142 76% 40%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(142 76% 40%)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M -50 500 Q 200 350, 400 400 T 800 300 T 1250 200"
          stroke="url(#trajGrad)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          opacity="0.5"
        />
        <circle cx="400" cy="400" r="3" fill="hsl(188 100% 45%)" filter="url(#glow)" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="800" cy="300" r="3" fill="hsl(188 100% 45%)" filter="url(#glow)" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="1100" cy="220" r="2.5" fill="hsl(142 76% 50%)" filter="url(#glow)" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}