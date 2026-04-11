export function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 isolate z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="page-grid absolute inset-0" />
      <div className="page-noise absolute inset-0" />

      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(135vmin,56rem)] w-[min(135vmin,56rem)] -translate-x-1/2 -translate-y-1/2"
        aria-hidden={true}
      >
        <div className="page-aurora h-full w-full rounded-full" />
      </div>
      <div className="page-vbeam page-vbeam--a" aria-hidden={true} />
      <div className="page-vbeam page-vbeam--b" aria-hidden={true} />

      <div
        className="absolute h-[600px] w-[600px] rounded-full blur-[160px]"
        style={{
          background: "radial-gradient(circle, hsl(188 100% 35%) 0%, transparent 70%)",
          top: "15%",
          left: "-5%",
          opacity: 0.06,
        }}
      />
      <div
        className="absolute h-[500px] w-[500px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, hsl(188 80% 40%) 0%, transparent 70%)",
          top: "45%",
          right: "-8%",
          opacity: 0.05,
        }}
      />
      <div
        className="absolute h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, hsl(142 60% 40%) 0%, transparent 70%)",
          bottom: "10%",
          left: "20%",
          opacity: 0.04,
        }}
      />
      <div
        className="absolute h-[350px] w-[350px] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(circle, hsl(188 100% 45%) 0%, transparent 70%)",
          top: "70%",
          right: "15%",
          opacity: 0.04,
        }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-[0.03]" aria-hidden="true">
        <defs>
          <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="hsl(188 100% 35%)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>

      <div className="absolute left-0 right-0 top-[30%] h-px bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent" />
      <div className="absolute left-0 right-0 top-[60%] h-px bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent" />
      <div className="absolute left-0 right-0 top-[85%] h-px bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent" />
    </div>
  );
}
