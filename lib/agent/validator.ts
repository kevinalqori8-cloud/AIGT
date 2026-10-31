
import { validateSkillArguments } from "../skills/schema";

export function validateAgentPlan(
    result: any,
    skills: any[]
) {
    if (!result || typeof result !== "object") {
        throw new Error("AI plan tidak valid.");
    }

    if (result.type === "message") {
        return {
            type: "message",
            response: String(result.response || "")
        };
    }

    if (result.type !== "skill_request") {
        throw new Error("Tipe rencana tidak dikenal.");
    }

    const skill = skills.find(
        item => item.id === result.skill_id && item.enabled
    );

    if (!skill) {
        throw new Error("AI memilih skill yang tidak tersedia.");
    }

    const validation = validateSkillArguments(
        skill,
        result.args || {}
    );

    if (!validation.valid) {
        throw new Error(validation.error);
    }

    return {
        type: "skill_request",
        skill: {
            id: skill.id,
            name: skill.name,
            version: skill.version
        },
        args: result.args,
        requires_confirmation: true,
        response: String(result.response || "Konfirmasi penggunaan skill ini.")
    };
}

