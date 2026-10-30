// lib/knowledge.ts
//
// Verified knowledge entries for AIGT. Each entry has a confidence level so
// the AI (and you) can tell "directly observed fact" apart from "inferred /
// unconfirmed". Never put raw secrets (tokens, session ids, credentials)
// in here — see appstate_parser.py's redaction rules before adding anything
// derived from a real save/state file.

export type KnowledgeEntry = {
    id: string;
    topic: string;
    tags: string[];
    confidence: "verified" | "inferred" | "unknown";
    content: string;
};

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
    {
        id: "appstate-schema-001",
        topic: "Growtopia client app-state file format",
        tags: ["save.dat", "appstate", "client", "settings", "file-format"],
        confidence: "verified",
        content:
            "The Growtopia client's local app-state file (sometimes named save.dat " +
            "under AppData/Local/Growtopia) is a plaintext, length-prefixed key/value " +
            "blob — NOT the encrypted player-save format. Layout: u32 magic, u32 version, " +
            "then repeated (u32 length + ASCII string) entries. It stores UI/console " +
            "state (Console.Visible, Console.Width, etc.), audio levels (music_vol, " +
            "sfx_vol, start_vol), chat/social prefs, FTUE/onboarding flags, and some " +
            "account/region/legal flags (LoginAccountType, GDPR, AppleConsent).",
    },
    {
        id: "appstate-schema-002",
        topic: "Growtopia client app-state: sensitive fields",
        tags: ["save.dat", "appstate", "security", "token", "session"],
        confidence: "verified",
        content:
            "The app-state file also contains a 'Token' field and a 'rid' field, which " +
            "are session/auth-related. These must never be read aloud, logged, stored " +
            "in plaintext in a knowledge base, or transmitted anywhere. Any tool that " +
            "parses this file type should redact these fields before further processing.",
    },
    {
        id: "appstate-schema-003",
        topic: "Growtopia client app-state: field typing caveat",
        tags: ["save.dat", "appstate", "file-format"],
        confidence: "inferred",
        content:
            "Numeric values adjacent to string keys in the app-state file are raw " +
            "4-byte little-endian values; exact type tagging per field (bool vs int32 " +
            "vs float32) was inferred from plausible ranges (e.g. Console.Width as a " +
            "pixel float) but not confirmed against official source. Treat per-field " +
            "types as unconfirmed until cross-checked.",
    },
];

/**
 * Add a new entry at runtime (e.g. after verifying something new).
 * Keep this in-memory for now; swap for a real datastore (KV, DB) once
 * the KB needs to persist across deployments or grow beyond a few hundred
 * entries.
 */
export function addKnowledge(entry: KnowledgeEntry) {
    KNOWLEDGE_BASE.push(entry);
}

