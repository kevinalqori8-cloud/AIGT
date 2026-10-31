
export function validateSkillArguments(
    skill: any,
    args: Record<string, unknown>
): { valid: boolean; error?: string } {
    if (!skill || !skill.parameters) {
        return { valid: false, error: "Metadata skill tidak tersedia." };
    }

    if (!args || typeof args !== "object" || Array.isArray(args)) {
        return { valid: false, error: "Parameter harus berupa object." };
    }

    for (const [key, rule] of Object.entries<any>(skill.parameters)) {
        const value = args[key];

        if (rule.required && value === undefined) {
            return {
                valid: false,
                error: `Parameter ${key} wajib diisi.`
            };
        }

        if (value === undefined) continue;

        if (rule.type === "string" && typeof value !== "string") {
            return { valid: false, error: `${key} harus berupa string.` };
        }

        if (rule.type === "number" &&
            (typeof value !== "number" || !Number.isFinite(value))) {
            return { valid: false, error: `${key} harus berupa angka valid.` };
        }

        if (
            rule.maxLength &&
            typeof value === "string" &&
            value.length > rule.maxLength
        ) {
            return { valid: false, error: `${key} terlalu panjang.` };
        }
    }

    for (const key of Object.keys(args)) {
        if (!(key in skill.parameters)) {
            return {
                valid: false,
                error: `Parameter tidak dikenal: ${key}`
            };
        }
    }

    return { valid: true };
}

