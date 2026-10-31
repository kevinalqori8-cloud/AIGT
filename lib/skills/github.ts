
const OWNER = process.env.SKILLS_GITHUB_OWNER;
const REPO = process.env.SKILLS_GITHUB_REPO;
const REF = process.env.SKILLS_GITHUB_REF;
const TOKEN = process.env.SKILLS_GITHUB_TOKEN;

export async function getGitHubFile(path: string): Promise<string> {
    if (!OWNER || !REPO || !REF) {
        throw new Error("Konfigurasi GitHub Skills belum lengkap.");
    }

    if (
        !/^[a-zA-Z0-9._/-]+$/.test(path) ||
        path.startsWith("/") ||
        path.split("/").some(part => part === "..")
    ) {
        throw new Error("Path skill tidak valid.");
    }

    const url =
        `https://raw.githubusercontent.com/` +
        `${OWNER}/${REPO}/${REF}/${path}`;

    const headers: Record<string, string> = {};

    if (TOKEN) {
        headers.Authorization = `Bearer ${TOKEN}`;
    }

    const response = await fetch(url, {
        headers,
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`GitHub fetch gagal: ${response.status}`);
    }

    return await response.text();
}

export async function getSkillManifest() {
    const raw = await getGitHubFile("skills/manifest.json");

    let manifest: any;

    try {
        manifest = JSON.parse(raw);
    } catch {
        throw new Error("Manifest GitHub bukan JSON valid.");
    }

    if (
        manifest.schema_version !== 1 ||
        !Array.isArray(manifest.skills)
    ) {
        throw new Error("Struktur manifest tidak valid.");
    }

    return manifest;
}

export async function getSkillById(id: string) {
    if (!/^[a-z0-9_-]+$/.test(id)) {
        throw new Error("Skill ID tidak valid.");
    }

    const manifest = await getSkillManifest();

    const skill = manifest.skills.find(
        (item: any) =>
            item.id === id &&
            item.enabled === true
    );

    if (!skill) {
        throw new Error("Skill tidak ditemukan atau dinonaktifkan.");
    }

    if (
        typeof skill.file !== "string" ||
        !skill.file.startsWith("skills/") ||
        !/^[a-zA-Z0-9._/-]+$/.test(skill.file) ||
        skill.file.split("/").some((part: string) => part === "..")
    ) {
        throw new Error("Lokasi file skill tidak valid.");
    }

    const source = await getGitHubFile(skill.file);

    if (!source.trim()) {
        throw new Error("Source skill kosong.");
    }

    return {
        metadata: skill,
        source,
        repository: `${OWNER}/${REPO}`,
        ref: REF
    };
}

