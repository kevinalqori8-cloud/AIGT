// lib/retrieve.ts
//
// Minimal keyword-overlap retrieval. No embeddings, no external services —
// works fine in Vercel Edge runtime with zero added latency/cost. Good
// enough while the KB is small (tens to low hundreds of entries). If it
// grows large or recall quality matters more, swap this for Upstash
// Vector (also Edge-compatible) without changing the call site below.

import { KNOWLEDGE_BASE, KnowledgeEntry } from "./knowledge";

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9.\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
}

function score(queryTokens: string[], entry: KnowledgeEntry): number {
    const haystack = tokenize(
        entry.topic + " " + entry.tags.join(" ") + " " + entry.content
    );
    let hits = 0;
    for (const t of queryTokens) {
        if (haystack.includes(t)) hits++;
    }
    return hits;
}

/**
 * Return the top-k most relevant KB entries for a user message.
 * Returns [] if nothing scores above the minimum threshold, so irrelevant
 * chat ("halo", "makasih") doesn't drag unrelated context into the prompt.
 */
export function retrieveRelevant(
    userMessage: string,
    topK: number = 3,
    minScore: number = 1
): KnowledgeEntry[] {
    const queryTokens = tokenize(userMessage);
    if (queryTokens.length === 0) return [];

    return KNOWLEDGE_BASE
        .map((entry) => ({ entry, s: score(queryTokens, entry) }))
        .filter((x) => x.s >= minScore)
        .sort((a, b) => b.s - a.s)
        .slice(0, topK)
        .map((x) => x.entry);
}

/**
 * Format retrieved entries as a compact context block to inject into the
 * system prompt. Confidence level is kept visible so the model doesn't
 * present "inferred" facts as if they were confirmed.
 */
export function formatContext(entries: KnowledgeEntry[]): string {
    if (entries.length === 0) return "";
    const lines = entries.map(
        (e) => `- [${e.confidence}] ${e.topic}: ${e.content}`
    );
    return `\n\n### Relevant knowledge (from verified KB, cite confidence level if relevant):\n${lines.join(
        "\n"
    )}`;
}

