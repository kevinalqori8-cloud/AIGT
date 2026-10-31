
import { getSkillManifest } from "../skills/github";
import { createAgentPrompt } from "./system-prompt";
import { validateAgentPlan } from "./validator";
import { retrieveRelevant, formatContext } from "../../lib/retreive";

const PAWAN_URL = "https://api.pawan.krd/v1/chat/completions";

export async function createPlan(prompt: string) {
    const apiKey = process.env.PAWAN_API_KEY;

    if (!apiKey) {
        throw new Error("PAWAN_API_KEY belum disetting.");
    }

    const manifest = await getSkillManifest();

    const skills = manifest.skills.filter(
        (skill: any) => skill.enabled === true
    );

    const relevant = retrieveRelevant(prompt);
    const knowledge = formatContext(relevant) || "";

    const system = createAgentPrompt(skills, knowledge);

    const response = await fetch(PAWAN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V4.1-Flash",
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 700
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message || "Pawan AI request gagal."
        );
    }

    const raw = data?.choices?.[0]?.message?.content;

    if (typeof raw !== "string") {
        throw new Error("AI tidak memberikan respons.");
    }

    const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    let parsed: any;

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("AI menghasilkan JSON yang tidak valid.");
    }

    return validateAgentPlan(parsed, skills);
}

