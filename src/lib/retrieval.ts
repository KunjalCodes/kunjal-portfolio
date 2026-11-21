import { projects } from '../data/projects';
import { profile } from '../data/profile';

/**
 * A small, real retrieval pipeline over this site's own content.
 * Chunk -> tokenize -> BM25 ranking -> top-k passages with sources.
 * Runs entirely in the browser; there is no LLM, so results are the
 * retrieved passages themselves, each with a link to where it came from.
 */

export interface Chunk {
  id: string;
  text: string;
  source: string; // human label, e.g. "AI Second Brain · Challenges"
  href: string;
}

export interface Hit {
  chunk: Chunk;
  score: number;
  matched: string[];
}

export interface SearchResult {
  hits: Hit[];
  queryTerms: string[];
  scanned: number;
  ms: number;
}

const STOP = new Set(
  'a an and are as at be by did do does for from has have how i in is it its kunjal kunjals joshi me my of on or she he they their the to used use uses using was what when where which who why with work worked you your can could would about any ever get got happen happens built build made make there tell show list project projects run runs which'.split(
    ' ',
  ),
);

// Small domain synonym map so natural questions hit the right terms.
const SYNONYMS: Record<string, string[]> = {
  graph: ['neo4j', 'knowledge'],
  graphdb: ['neo4j'],
  vector: ['pgvector', 'chromadb', 'embedding'],
  vectordb: ['pgvector', 'chromadb'],
  embeddings: ['embedding'],
  llm: ['gemini', 'groq', 'llama', 'ollama'],
  llms: ['gemini', 'groq', 'llama', 'ollama'],
  agent: ['agents', 'tool'],
  agents: ['agent', 'tool'],
  rag: ['retrieval', 'chunk'],
  local: ['ollama', 'locally'],
  fast: ['speedup', 'latency', 'faster'],
  faster: ['speedup', 'latency'],
  speed: ['speedup', 'latency'],
  ocr: ['vision', 'drawing'],
  vision: ['ocr', 'opencv'],
  company: ['igniters'],
  job: ['igniters', 'intern'],
  experience: ['intern', 'igniters', 'actecal'],
  memory: ['memories', 'temporal'],
  eval: ['evaluation', 'recall', 'precision'],
  evaluation: ['recall', 'precision', 'benchmark'],
  mcp: ['protocol', 'tool'],
};

const stem = (w: string) =>
  w.length > 4 ? w.replace(/(ings|ing|ed|es|s)$/u, '') : w;

export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, ' ')
    .split(/[\s\-/]+/)
    .map(t => t.replace(/^\.+|\.+$/g, ''))
    .filter(t => t.length > 1 && !STOP.has(t))
    .map(stem);

/** Build the corpus from the structured site data. */
const buildCorpus = (): Chunk[] => {
  const chunks: Chunk[] = [];
  const add = (source: string, href: string, text: string) => {
    if (text && text.trim().length > 20) chunks.push({ id: `c${chunks.length}`, text: text.trim(), source, href });
  };

  for (const p of projects) {
    const name = p.title.split(' — ')[0];
    const href = `/work/${p.slug}`;
    add(`${name} · Overview`, href, `${p.title}. ${p.subtitle}. ${p.shortDescription}`);
    add(`${name} · Problem`, href, p.problemStatement);
    add(`${name} · What was built`, href, p.projectOverview);
    add(`${name} · Stack`, href, `${name} uses ${p.tags.join(', ')}.`);
    for (const l of p.architecture.layers) add(`${name} · ${l.name}`, href, `${l.description} (${l.technologies.join(', ')})`);
    for (const t of p.technicalImplementation) add(`${name} · ${t.aspect}`, href, t.description);
    for (const c of p.engineeringChallenges)
      add(`${name} · Challenge`, href, `${c.challenge}. ${c.solution} ${c.outcome ?? ''}`);
    if (p.actualResults.length) add(`${name} · Results`, href, p.actualResults.join('. '));
    if (p.limitations.length) add(`${name} · Limitations`, href, p.limitations.join('. '));
  }

  profile.bio.forEach(b => add('About · Bio', '/about', b));
  for (const e of profile.experience)
    add(`${e.role}, ${e.organization} · ${e.period}`, '/about', `${e.description.join('. ')}. Tools: ${e.technologies.join(', ')}.`);
  for (const s of profile.skills)
    add(`Skills · ${s.category}`, '/about', s.skills.map(k => (k.note ? `${k.name}: ${k.note}` : k.name)).join('. '));
  add('About · Highlights', '/about', profile.achievements.join('. '));
  for (const ed of profile.education) add('About · Education', '/about', `${ed.degree} in ${ed.field}, ${ed.institution}, ${ed.period}. ${(ed.details ?? []).join('. ')}`);

  return chunks;
};

// ---- BM25 index --------------------------------------------------------------
const K1 = 1.2;
const B = 0.75;

const corpus = buildCorpus();
const docTokens = corpus.map(c => tokenize(`${c.source} ${c.text}`));
const sourceTokens = corpus.map(c => new Set(tokenize(c.source)));
const avgLen = docTokens.reduce((a, d) => a + d.length, 0) / docTokens.length;
const df = new Map<string, number>();
for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
const idf = (t: string) => {
  const n = df.get(t) ?? 0;
  return Math.log(1 + (corpus.length - n + 0.5) / (n + 0.5));
};

export const corpusSize = corpus.length;

export function search(query: string, k = 4): SearchResult {
  const t0 = performance.now();
  const base = tokenize(query);
  const baseSet = new Set(base);
  const expanded = new Map<string, number>(); // term -> weight
  for (const t of base) {
    expanded.set(t, Math.max(expanded.get(t) ?? 0, 1));
    for (const syn of SYNONYMS[t] ?? []) {
      const s = stem(syn);
      expanded.set(s, Math.max(expanded.get(s) ?? 0, 0.5));
    }
  }

  const hits: Hit[] = [];
  docTokens.forEach((toks, i) => {
    let score = 0;
    let baseHits = 0;
    const matched: string[] = [];
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [term, w] of expanded) {
      const f = tf.get(term);
      if (!f) continue;
      const norm = f * (K1 + 1) / (f + K1 * (1 - B + B * toks.length / avgLen));
      score += w * idf(term) * norm;
      // a term in the passage's title (e.g. "Igniters Hub", a project name) is strong evidence
      if (sourceTokens[i].has(term)) score += 0.8 * w * idf(term);
      if (baseSet.has(term)) baseHits++;
      matched.push(term);
    }
    // reward passages that cover more of the question's own words
    if (score > 0 && baseSet.size > 0) score *= 0.5 + baseHits / baseSet.size;
    if (score > 0) hits.push({ chunk: corpus[i], score, matched });
  });

  hits.sort((a, b) => b.score - a.score);
  // keep at most two passages per source page so results stay varied
  const perPage = new Map<string, number>();
  const top: Hit[] = [];
  for (const h of hits) {
    const n = perPage.get(h.chunk.href) ?? 0;
    if (n >= 2) continue;
    perPage.set(h.chunk.href, n + 1);
    top.push(h);
    if (top.length === k) break;
  }

  return { hits: top, queryTerms: [...expanded.keys()], scanned: corpus.length, ms: performance.now() - t0 };
}
