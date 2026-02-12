export function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      <div className="page-grid absolute inset-0" />
      <div className="page-noise absolute inset-0" />

      <div
        className="page-orb absolute w-[600px] h-[600px] rounded-full blur-[160px]"
        style={{
          background: "radial-gradient(circle, hsl(188 100% 35%) 0%, transparent 70%)",
          top: "15%",
          left: "-5%",
          opacity: 0.06,
          animationDuration: "60s",
        }}
      />
      <div
        className="page-orb absolute w-[500px] h-[500px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, hsl(188 80% 40%) 0%, transparent 70%)",
          top: "45%",
          right: "-8%",
          opacity: 0.05,
          animationDuration: "50s",
          animationDelay: "-20s",
        }}
      />
      <div
        className="page-orb absolute w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, hsl(142 60% 40%) 0%, transparent 70%)",
          bottom: "10%",
          left: "20%",
          opacity: 0.04,
          animationDuration: "55s",
          animationDelay: "-35s",
        }}
      />
      <div
        className="page-orb absolute w-[350px] h-[350px] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(circle, hsl(188 100% 45%) 0%, transparent 70%)",
          top: "70%",
          right: "15%",
          opacity: 0.04,
          animationDuration: "45s",
          animationDelay: "-10s",
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden="true">
        <defs>
          <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="hsl(188 100% 35%)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>

      <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent" />
      <div className="absolute top-[60%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent" />
      <div className="absolute top-[85%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent" />
    </div>
  );
}