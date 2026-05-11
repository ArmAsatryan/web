/**
 * Adapty Export Analytics API client (server-side only).
 * @see https://adapty.io/docs/api-export-analytics
 *
 * Rate limit: 2 req/s — requests are serialized with a short delay.
 *
 * Production: implement the same logic on api.ballistiq.xyz (or your API gateway)
 * with ADAPTY_SECRET_API_KEY in server env and admin JWT checks, then remove
 * or disable this dev route if unused.
 */

const ADAPTY_ANALYTICS_URL =
  "https://api-admin.adapty.io/api/v1/client-api/metrics/analytics/";

const BETWEEN_MS = 550;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type AdaptyChartId =
  | "revenue"
  | "mrr"
  | "arr"
  | "subscriptions_active"
  | "trials_active"
  | "billing_issue";

export interface AdaptyMetricPayload {
  value?: number | null;
  unit?: string | null;
  metric_name?: string | null;
  data?: unknown;
}

export interface AdaptyAnalyticsResponse {
  data?: Record<string, AdaptyMetricPayload>;
}

function metricForChart(
  json: AdaptyAnalyticsResponse,
  chartId: AdaptyChartId
): AdaptyMetricPayload | undefined {
  const block = json.data;
  if (!block || typeof block !== "object") return undefined;
  const direct = block[chartId];
  if (direct && typeof direct === "object") return direct;
  const values = Object.values(block);
  return values.find((v) => v && typeof v === "object");
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function extractScalar(metric: AdaptyMetricPayload | undefined): number | null {
  if (!metric) return null;
  return numOrNull(metric.value);
}

function extractSeries(metric: AdaptyMetricPayload | undefined): Array<{ date: string; value: number }> {
  if (!metric?.data || !Array.isArray(metric.data)) return [];
  const out: Array<{ date: string; value: number }> = [];
  for (const row of metric.data) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const date = String(o.date ?? o.period_start ?? o.period ?? o.label ?? "").trim();
    const raw = o.value ?? o.sum ?? o.total;
    const value = numOrNull(raw) ?? 0;
    if (date) out.push({ date, value });
  }
  return out;
}

async function postAdaptyChart(
  apiKey: string,
  tz: string,
  body: {
    chart_id: AdaptyChartId;
    filters: { date: [string, string] };
    period_unit: "day" | "week" | "month";
    format?: "json";
  }
): Promise<AdaptyAnalyticsResponse> {
  const res = await fetch(ADAPTY_ANALYTICS_URL, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
      "Adapty-Tz": tz,
    },
    body: JSON.stringify({ ...body, format: "json" }),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Adapty response not JSON (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const err = json as { errors?: unknown; error_code?: string };
    const msg =
      typeof err?.error_code === "string"
        ? err.error_code
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json as AdaptyAnalyticsResponse;
}

export interface AdaptyAdminSummaryOk {
  ok: true;
  dateFrom: string;
  dateTo: string;
  timezone: string;
  metrics: {
    mrr: number | null;
    mrrUnit: string | null;
    arr: number | null;
    arrUnit: string | null;
    subscriptionsActive: number | null;
    trialsActive: number | null;
    revenueInPeriod: number | null;
    revenueUnit: string | null;
    billingIssues: number | null;
  };
  revenueByDay: Array<{ date: string; value: number }>;
}

export interface AdaptyAdminSummaryErr {
  ok: false;
  error: string;
  detail?: string;
}

export async function fetchAdaptySummary(opts: {
  apiKey: string;
  timezone?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdaptyAdminSummaryOk | AdaptyAdminSummaryErr> {
  const tz = opts.timezone?.trim() || "UTC";
  const today = new Date();
  const defaultTo = isoDate(today);
  const defaultFromD = new Date(today);
  defaultFromD.setDate(defaultFromD.getDate() - 29);
  const dateFrom = opts.dateFrom?.trim() || isoDate(defaultFromD);
  const dateTo = opts.dateTo?.trim() || defaultTo;
  const range: [string, string] = [dateFrom, dateTo];
  const apiKey = opts.apiKey;

  try {
    const mrrRes = await postAdaptyChart(apiKey, tz, {
      chart_id: "mrr",
      filters: { date: range },
      period_unit: "month",
    });
    const mrrMetric = metricForChart(mrrRes, "mrr");
    await sleep(BETWEEN_MS);

    const arrRes = await postAdaptyChart(apiKey, tz, {
      chart_id: "arr",
      filters: { date: range },
      period_unit: "month",
    });
    const arrMetric = metricForChart(arrRes, "arr");
    await sleep(BETWEEN_MS);

    const subsRes = await postAdaptyChart(apiKey, tz, {
      chart_id: "subscriptions_active",
      filters: { date: range },
      period_unit: "month",
    });
    const subsMetric = metricForChart(subsRes, "subscriptions_active");
    await sleep(BETWEEN_MS);

    const trialsRes = await postAdaptyChart(apiKey, tz, {
      chart_id: "trials_active",
      filters: { date: range },
      period_unit: "month",
    });
    const trialsMetric = metricForChart(trialsRes, "trials_active");
    await sleep(BETWEEN_MS);

    const revenueRes = await postAdaptyChart(apiKey, tz, {
      chart_id: "revenue",
      filters: { date: range },
      period_unit: "day",
    });
    const revenueMetric = metricForChart(revenueRes, "revenue");
    await sleep(BETWEEN_MS);

    const billingRes = await postAdaptyChart(apiKey, tz, {
      chart_id: "billing_issue",
      filters: { date: range },
      period_unit: "month",
    });
    const billingMetric = metricForChart(billingRes, "billing_issue");

    const revenueByDay = extractSeries(revenueMetric);
    const revenueSum =
      revenueByDay.length > 0
        ? revenueByDay.reduce((s, p) => s + p.value, 0)
        : extractScalar(revenueMetric);

    return {
      ok: true,
      dateFrom,
      dateTo,
      timezone: tz,
      metrics: {
        mrr: extractScalar(mrrMetric),
        mrrUnit: mrrMetric?.unit ?? null,
        arr: extractScalar(arrMetric),
        arrUnit: arrMetric?.unit ?? null,
        subscriptionsActive: extractScalar(subsMetric),
        trialsActive: extractScalar(trialsMetric),
        revenueInPeriod: revenueSum,
        revenueUnit: revenueMetric?.unit ?? null,
        billingIssues: extractScalar(billingMetric),
      },
      revenueByDay,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Adapty request failed";
    return { ok: false, error: "adapty_error", detail: message };
  }
}
