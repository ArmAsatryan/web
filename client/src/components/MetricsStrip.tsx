import { useRef, useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useI18n } from "@/hooks/use-i18n";

interface Metric {
  value: number;
  suffix: string;
  labelKey: string;
}

const metrics: Metric[] = [
  { value: 5000, suffix: "+", labelKey: "metrics.users" },
  { value: 4, suffix: "", labelKey: "metrics.languages" },
  { value: 25, suffix: "+", labelKey: "metrics.countries" },
];

const metricLabels: Record<string, Record<string, string>> = {
  en: { "metrics.users": "Active Users", "metrics.languages": "Languages", "metrics.countries": "Countries" },
  fr: { "metrics.users": "Utilisateurs Actifs", "metrics.languages": "Langues", "metrics.countries": "Pays" },
  it: { "metrics.users": "Utenti Attivi", "metrics.languages": "Lingue", "metrics.countries": "Paesi" },
  es: { "metrics.users": "Usuarios Activos", "metrics.languages": "Idiomas", "metrics.countries": "Pa\u00edses" },
};

function useCountUp(target: number, duration = 1500, start = false, reduced = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setCount(target);
      return;
    }

    let startTime: number;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start, reduced]);

  return count;
}

function MetricItem({ metric, started, reduced }: { metric: Metric; started: boolean; reduced: boolean }) {
  const count = useCountUp(metric.value, 1500, started, reduced);
  const { locale } = useI18n();

  const label = metricLabels[locale]?.[metric.labelKey] || metricLabels.en[metric.labelKey];

  return (
    <div className="text-center px-6 py-4" data-testid={`metric-${metric.labelKey.split(".")[1]}`}>
      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
        {count.toLocaleString()}{metric.suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function MetricsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotion();

  const observe = useCallback(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return observe();
  }, [observe]);

  return (
    <div
      ref={ref}
      className="relative z-10 max-w-4xl mx-auto px-4 -mt-8 mb-12"
      data-testid="metrics-strip"
    >
      <div className="grid grid-cols-3 bg-card/60 backdrop-blur-md border border-border/50 rounded-md">
        {metrics.map((m, i) => (
          <MetricItem key={i} metric={m} started={started} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}