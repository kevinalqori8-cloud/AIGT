
import { NextResponse } from "next/server";
import { getSkillManifest, getSkillById } from "../../../../lib/skills/github";

export const runtime = "edge";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store"
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers
    });
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (id) {
            const result = await getSkillById(id);

            return NextResponse.json({
                status: "success",
                skill: result.metadata,
                source: result.source,
                repository: result.repository,
                ref: result.ref,
                execution: "manual-validation-required"
            }, { headers });
        }

        const manifest = await getSkillManifest();

        const skills = manifest.skills
            .filter((skill: any) => skill.enabled === true)
            .map((skill: any) => ({
                id: skill.id,
                name: skill.name,
                description: skill.description,
                category: skill.category,
                version: skill.version,
                permission: skill.permission,
                parameters: skill.parameters
            }));

        return NextResponse.json({
            status: "success",
            project: manifest.project,
            version: manifest.version,
            count: skills.length,
            skills
        }, { headers });

    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json({
            status: "error",
            error: message
        }, { status: 500, headers });
    }
}

