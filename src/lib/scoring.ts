// Deterministic, rule-based answer scoring — NO LLM judgment.
// Pure functions so they can run on server or client and are fully reproducible.

export type RuleBreakdown = {
  starScore: number; // 0-100 STAR completeness (behavioral)
  keywordCoverage: number; // 0-100 role/question keyword coverage
  lengthScore: number; // 0-100 answer length/completeness heuristic
  conceptScore: number; // 0-100 named technical concepts / trade-offs (technical)
  overall: number; // 0-100 blended rule-based score
  detectedStar: { situation: boolean; task: boolean; action: boolean; result: boolean; quantified: boolean };
  matchedKeywords: string[];
  matchedConcepts: string[];
  wordCount: number;
};

const STAR_SIGNALS = {
  situation: [
    "when", "while", "during", "at the time", "project", "team", "company",
    "situation", "context", "faced", "working on", "there was", "we had",
  ],
  task: [
    "i was responsible", "my job", "my task", "needed to", "had to", "goal was",
    "objective", "responsible for", "asked to", "required to", "my role",
  ],
  action: [
    "i implemented", "i built", "i designed", "i decided", "i led", "i created",
    "i wrote", "i refactored", "i proposed", "i coordinated", "i analyzed",
    "i introduced", "i migrated", "i optimized", "i debugged", "i tested",
    "so i", "then i", "i started", "i chose", "i set up",
  ],
  result: [
    "as a result", "resulted in", "led to", "outcome", "impact", "we achieved",
    "improved", "reduced", "increased", "delivered", "shipped", "in the end",
    "finally", "this allowed", "which meant", "success",
  ],
};

// Numbers, percentages, time spans, money → quantified impact
const QUANT_RE = /(\d+(\.\d+)?\s?%|\$\s?\d|\d+\s?(x|times|ms|s|seconds|minutes|hours|days|weeks|months|users|requests|k|m|million|thousand|percent)\b|\breduced\b.*\d|\bincreased\b.*\d|\d{2,})/i;

// Generic technical vocabulary — presence signals depth and trade-off awareness.
const TECH_CONCEPTS = [
  "trade-off", "tradeoff", "complexity", "scalab", "latency", "throughput",
  "cache", "caching", "index", "database", "sql", "nosql", "queue", "async",
  "concurren", "thread", "lock", "transaction", "consistency", "availability",
  "partition", "shard", "load balanc", "microservice", "api", "rest", "graphql",
  "algorithm", "data structure", "big o", "time complexity", "space complexity",
  "test", "unit test", "integration", "ci/cd", "deploy", "monitor", "logging",
  "security", "authentication", "authorization", "encryption", "rate limit",
  "retry", "idempoten", "fault toleran", "redundan", "failover", "cap theorem",
  "memory", "garbage collect", "immutab", "pure function", "dependency",
  "abstraction", "coupling", "cohesion", "design pattern", "refactor",
];

const STOP = new Set([
  "the", "and", "for", "with", "that", "this", "have", "from", "your", "you",
  "are", "was", "were", "will", "would", "should", "could", "about", "which",
  "their", "them", "they", "what", "when", "where", "how", "why", "who", "a",
  "an", "of", "to", "in", "on", "at", "is", "it", "as", "be", "or", "we", "i",
  "my", "me", "our", "us", "do", "does", "did", "can", "may", "role", "job",
  "candidate", "interview", "question", "answer", "level", "please", "tell",
  "describe", "explain", "give", "example", "would", "using", "used",
]);

function words(s: string): string[] {
  return (s.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) ?? []);
}

function countHits(haystack: string, needles: string[]): string[] {
  const found: string[] = [];
  for (const n of needles) if (haystack.includes(n)) found.push(n);
  return found;
}

/** Extract meaningful keywords from question + role for coverage checks. */
function extractKeywords(question: string, role: string): string[] {
  const raw = words(`${question} ${role}`);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of raw) {
    if (STOP.has(w) || seen.has(w)) continue;
    seen.add(w);
    out.push(w);
  }
  return out.slice(0, 14);
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function scoreAnswerRuleBased(input: {
  question: string;
  answer: string;
  role: string;
  category?: string;
}): RuleBreakdown {
  const answer = (input.answer ?? "").trim();
  const lower = answer.toLowerCase();
  const wc = words(answer).length;
  const isBehavioral = /behav/i.test(input.category ?? "");

  // --- STAR structural detection ---
  const situation = countHits(lower, STAR_SIGNALS.situation).length > 0;
  const task = countHits(lower, STAR_SIGNALS.task).length > 0;
  const action = countHits(lower, STAR_SIGNALS.action).length > 0;
  const result = countHits(lower, STAR_SIGNALS.result).length > 0;
  const quantified = QUANT_RE.test(answer);
  // Weighted: situation 20, task 15, action 30, result 25, quantified impact 10
  const starScore = clamp(
    (situation ? 20 : 0) + (task ? 15 : 0) + (action ? 30 : 0) + (result ? 25 : 0) + (quantified ? 10 : 0),
  );

  // --- Keyword / skill coverage ---
  const keywords = extractKeywords(input.question, input.role);
  const answerWordSet = new Set(words(answer));
  const matchedKeywords = keywords.filter((k) => answerWordSet.has(k) || lower.includes(k));
  const keywordCoverage = keywords.length
    ? clamp((matchedKeywords.length / keywords.length) * 100)
    : answer
      ? 50
      : 0;

  // --- Length / completeness heuristic ---
  // Sweet spot ~60-220 words; too short or rambling loses points.
  let lengthScore: number;
  if (wc === 0) lengthScore = 0;
  else if (wc < 20) lengthScore = clamp(wc * 2.5); // 0-50
  else if (wc <= 220) lengthScore = clamp(50 + ((wc - 20) / 200) * 50); // 50-100
  else lengthScore = clamp(100 - Math.min(30, (wc - 220) / 20)); // gentle penalty

  // --- Technical concepts / trade-offs ---
  const matchedConcepts = countHits(lower, TECH_CONCEPTS);
  const conceptScore = clamp(Math.min(matchedConcepts.length, 6) * (100 / 6));

  // --- Blend rule-based sub-scores by question type ---
  let overall: number;
  if (isBehavioral) {
    overall = clamp(starScore * 0.5 + keywordCoverage * 0.25 + lengthScore * 0.25);
  } else {
    overall = clamp(conceptScore * 0.45 + keywordCoverage * 0.3 + lengthScore * 0.25);
  }

  return {
    starScore,
    keywordCoverage,
    lengthScore,
    conceptScore,
    overall,
    detectedStar: { situation, task, action, result, quantified },
    matchedKeywords,
    matchedConcepts,
    wordCount: wc,
  };
}

/** Composite: LLM subjective quality 60% + deterministic rule-based 40%. */
export const LLM_WEIGHT = 0.6;
export const RULE_WEIGHT = 0.4;

export function composite(llmOverall: number, ruleOverall: number): number {
  return clamp(llmOverall * LLM_WEIGHT + ruleOverall * RULE_WEIGHT);
}
