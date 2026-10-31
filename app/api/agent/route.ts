
import { NextResponse } from "next/server";
import { createPlan } from "../../../lib/agent/planner";

export const runtime = "edge";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store"
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const prompt =
            typeof body.prompt === "string"
                ? body.prompt.trim()
                : typeof body.message === "string"
                    ? body.message.trim()
                    : "";

        if (!prompt) {
            return NextResponse.json({
                error: "Prompt tidak boleh kosong."
            }, { status: 400, headers });
        }

        const plan = await createPlan(prompt);

        return NextResponse.json({
            status: "success",
            mode: "agent",
            plan
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

