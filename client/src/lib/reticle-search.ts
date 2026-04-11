import reticleNames from "@/data/reticles.json";

export const RETICLE_NAMES: readonly string[] = reticleNames;

export type IndexedReticle = {
  raw: string;
  norm: string;
  words: string[];
};

/** Lowercase, NFKC, punctuation → spaces (Elasticsearch-style analyzer). */
export function normalizeReticleText(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  const dp = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n]!;
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let pos = 0;
  while (pos <= haystack.length - needle.length) {
    const idx = haystack.indexOf(needle, pos);
    if (idx === -1) break;
    count++;
    pos = idx + needle.length;
  }
  return count;
}

function scoreTokenInDoc(
  norm: string,
  words: string[],
  token: string,
): { ok: boolean; score: number; firstIndex: number } {
  if (token.length === 0) return { ok: true, score: 0, firstIndex: 0 };

  const idx = norm.indexOf(token);
  if (idx !== -1) {
    const occ = Math.max(1, countOccurrences(norm, token));
    const tf = (occ * token.length) / Math.max(norm.length, 1);
    const positionBoost = 1 / (1 + idx / 40);
    return { ok: true, score: 4 + tf * 12 + positionBoost, firstIndex: idx };
  }

  let bestScore = 0;
  let bestIdx = norm.length;

  for (const w of words) {
    if (w.length < 2) continue;
    if (w.startsWith(token) && token.length >= 2) {
      const s = 2.5 + token.length * 0.08;
      const at = norm.indexOf(w);
      if (at !== -1 && at < bestIdx) bestIdx = at;
      if (s > bestScore) bestScore = s;
    }
  }

  const maxDist = token.length <= 3 ? 0 : token.length <= 6 ? 1 : 2;
  if (maxDist > 0) {
    for (const w of words) {
      if (w.length < 2 || Math.abs(w.length - token.length) > 3) continue;
      if (levenshtein(w, token) <= maxDist) {
        const s = 1.8;
        const at = norm.indexOf(w);
        if (at !== -1 && at < bestIdx) bestIdx = at;
        if (s > bestScore) bestScore = s;
      }
    }
  }

  if (bestScore > 0) {
    const positionBoost = 1 / (1 + bestIdx / 40);
    return { ok: true, score: bestScore + positionBoost * 0.5, firstIndex: bestIdx };
  }

  return { ok: false, score: 0, firstIndex: norm.length };
}

function tokenizeQuery(q: string): string[] {
  return normalizeReticleText(q)
    .split(" ")
    .filter((t) => t.length > 0);
}

function phraseBonus(norm: string, tokens: string[]): number {
  if (tokens.length < 2) return 0;
  let bonus = 0;
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i]!;
    const b = tokens[i + 1]!;
    if (a.length === 0 || b.length === 0) continue;
    const bigram = `${a} ${b}`;
    if (norm.includes(bigram)) bonus += 3;
    else {
      const ia = norm.indexOf(a);
      const ib = norm.indexOf(b, ia === -1 ? 0 : ia + a.length);
      if (ia !== -1 && ib !== -1 && ib >= ia) bonus += 1.2;
    }
  }
  return bonus;
}

let cachedIndex: IndexedReticle[] | null = null;

export function getReticleIndex(): IndexedReticle[] {
  if (cachedIndex) return cachedIndex;
  cachedIndex = RETICLE_NAMES.map((raw) => {
    const norm = normalizeReticleText(raw);
    const words = norm.split(" ").filter(Boolean);
    return { raw, norm, words };
  });
  return cachedIndex;
}

export function searchReticles(query: string, limit = 200): string[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];

  const index = getReticleIndex();
  const scored: { raw: string; score: number }[] = [];

  for (const row of index) {
    let score = 0;
    let minFirst = row.norm.length;
    let allOk = true;

    for (const t of tokens) {
      const m = scoreTokenInDoc(row.norm, row.words, t);
      if (!m.ok) {
        allOk = false;
        break;
      }
      score += m.score;
      if (m.firstIndex < minFirst) minFirst = m.firstIndex;
    }

    if (!allOk) continue;

    score += phraseBonus(row.norm, tokens);
    score += 0.15 * (1 / (1 + minFirst / 60));

    scored.push({ raw: row.raw, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.raw);
}

export function pickRandomReticles(count: number, seedRng?: () => number): string[] {
  const rng = seedRng ?? Math.random;
  const list = [...RETICLE_NAMES];
  const out: string[] = [];
  const n = Math.min(count, list.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (list.length - i));
    const tmp = list[i]!;
    list[i] = list[j]!;
    list[j] = tmp;
    out.push(list[i]!);
  }
  return out;
}
