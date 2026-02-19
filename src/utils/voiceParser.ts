import stringSimilarity from 'string-similarity';
import { StatType, Player } from '../state/gameState';

const FUZZY_MATCH_THRESHOLD = 0.5;

export interface ParsedEvent {
  playerId: string;
  statType: StatType;
}

export interface ClauseWithImpliedStat {
  text: string;
  impliedStatType: StatType | null;
}

/**
 * Find the best-matching player: try number, exact/substring name, then fuzzy name match.
 */
export function findBestPlayerMatch(token: string, roster: Player[]): Player | null {
  if (!token.trim() || roster.length === 0) return null;

  const tokenLower = token.toLowerCase().trim();

  // 1. Match by jersey number
  const numMatch = tokenLower.match(/\d+/);
  if (numMatch) {
    const number = numMatch[0];
    const player = roster.find((p) => p.number === number);
    if (player) return player;
  }

  // 2. Exact or substring name match
  const exactPlayer = roster.find(
    (p) =>
      p.name.toLowerCase() === tokenLower ||
      p.name.toLowerCase().includes(tokenLower) ||
      tokenLower.includes(p.name.toLowerCase())
  );
  if (exactPlayer) return exactPlayer;

  // 3. Fuzzy match by name
  const names = roster.map((p) => p.name);
  const best = stringSimilarity.findBestMatch(tokenLower, names);
  if (best.bestMatch.rating >= FUZZY_MATCH_THRESHOLD) {
    const idx = best.bestMatchIndex;
    return roster[idx] ?? null;
  }

  return null;
}

/**
 * Extract stat type from clause text (reuses existing keyword logic).
 */
export function getStatTypeFromText(text: string): StatType | null {
  const t = text.toLowerCase();

  if (t.includes('two pointer') || t.includes('2 pointer') || t.includes('two point')) {
    return t.includes('miss') ? '2pt-miss' : '2pt-make';
  }
  if (
    t.includes('three pointer') ||
    t.includes('3 pointer') ||
    t.includes('three point') ||
    t.includes('three')
  ) {
    return t.includes('miss') ? '3pt-miss' : '3pt-make';
  }
  if (t.includes('rebound') || t.includes('reb')) return 'rebound';
  if (t.includes('assist') || t.includes('ast')) return 'assist';
  if (t.includes('steal') || t.includes('stl')) return 'steal';
  if (t.includes('block') || t.includes('blk')) return 'block';
  if (t.includes('foul')) return 'foul';
  if (t.includes('turnover') || t.includes('to')) return 'turnover';

  return null;
}

/**
 * Split transcript into clauses. "assist by X" / "assisted by X" produce a second clause with implied stat 'assist'.
 * Also split on comma and " and " for multiple events.
 */
export function splitIntoClauses(transcript: string): ClauseWithImpliedStat[] {
  let t = transcript.toLowerCase().trim();
  const clauses: ClauseWithImpliedStat[] = [];

  // Split on " assist by " and " assisted by " so the part after is "X" (assist for X)
  const assistByRegex = /\s+assist(?:ed)?\s+by\s+/gi;
  const assistParts = t.split(assistByRegex);
  if (assistParts.length > 1) {
    // First part: e.g. "ferrah makes 2 point"
    clauses.push({ text: assistParts[0].trim(), impliedStatType: null });
    // Remaining parts: just the name (or "name and more"); each gets implied assist
    for (let i = 1; i < assistParts.length; i++) {
      clauses.push({ text: assistParts[i].trim(), impliedStatType: 'assist' });
    }
    return clauses.filter((c) => c.text.length > 0);
  }

  // No "assist by" — split on comma and " and " for multiple events
  const parts = t
    .split(/\s+and\s+|,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length > 0) {
    return parts.map((text) => ({ text, impliedStatType: null }));
  }

  return [{ text: t, impliedStatType: null }];
}

/**
 * Find the best candidate token for a player in a clause: prefer words that look like names (no "by", "the", "makes", etc.).
 */
function getPlayerCandidateTokens(clause: string): string[] {
  const stopWords = new Set([
    'by',
    'the',
    'a',
    'an',
    'makes',
    'make',
    'made',
    'miss',
    'missed',
    'point',
    'points',
    'pointer',
    'rebound',
    'rebounds',
    'assist',
    'assists',
    'steal',
    'steals',
    'block',
    'blocks',
    'foul',
    'fouls',
    'turnover',
    'turnovers',
    'number',
    'num',
  ]);
  const words = clause.split(/\s+/).filter((w) => w.length > 0);
  // Prefer longer words (more likely to be names) and skip stop words
  const candidates = words.filter((w) => !stopWords.has(w.toLowerCase()));
  if (candidates.length === 0) return words;
  // Try longest first, then each candidate
  return [...candidates].sort((a, b) => b.length - a.length);
}

/**
 * Parse a single clause into one (player, stat) pair if possible.
 */
export function parseClause(
  clause: ClauseWithImpliedStat,
  roster: Player[]
): ParsedEvent | null {
  const { text, impliedStatType } = clause;
  const statType = impliedStatType ?? getStatTypeFromText(text);
  if (!statType) return null;

  const candidates = getPlayerCandidateTokens(text);
  for (const token of candidates) {
    const player = findBestPlayerMatch(token, roster);
    if (player) {
      return { playerId: player.id, statType };
    }
  }
  // Try the whole clause as a single token (e.g. "bree")
  const player = findBestPlayerMatch(text, roster);
  if (player) return { playerId: player.id, statType };

  return null;
}

/**
 * Parse full transcript into a list of (playerId, statType) events.
 */
export function parseTranscript(
  transcript: string,
  roster: Player[]
): ParsedEvent[] {
  if (!transcript.trim() || roster.length === 0) return [];

  const clauses = splitIntoClauses(transcript);
  const events: ParsedEvent[] = [];
  for (const clause of clauses) {
    const parsed = parseClause(clause, roster);
    if (parsed) events.push(parsed);
  }
  return events;
}

const STAT_EVENT_LABELS: Record<StatType, string> = {
  '2pt-make': '2 point made',
  '2pt-miss': '2 point missed',
  '3pt-make': '3 point made',
  '3pt-miss': '3 point missed',
  rebound: 'rebound',
  assist: 'assist',
  steal: 'steal',
  block: 'block',
  foul: 'foul',
  turnover: 'turnover',
};

export function getStatLabel(statType: StatType): string {
  return STAT_EVENT_LABELS[statType];
}
