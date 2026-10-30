import { NextResponse } from 'next/server';

export const runtime = 'edge';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

async function processAI(promptText: string) {
    const PAWAN_API_KEY = process.env.PAWAN_API_KEY;
    if (!PAWAN_API_KEY) {
        return { error: 'PAWAN_API_KEY belum disetting di Vercel' };
    }

    const pawanRes = await fetch("https://api.pawan.krd/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PAWAN_API_KEY}`
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V4.1-Flash",
            messages: [
                { role: "system", content: "You are a helpful Growtopia AI Assistant. Answer concisely in Indonesian." },
                { role: "user", content: promptText }
            ],
            max_tokens: 300
        })
    });

    const data = await pawanRes.json();
    if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        return { status: "success", response: reply, content: reply };
    }
    return { error: "Gagal dari Pawan AI", details: data };
}

// Tangkap metode GET langsung dari Growlauncher (tanpa bridge!)
export async function GET(req: Request) {
    try {
        const urlObj = new URL(req.url);
        const prompt = urlObj.searchParams.get('prompt');

        if (!prompt) {
            return NextResponse.json({ status: "success", response: "API Online!" }, { headers: corsHeaders });
        }

        const result = await processAI(prompt);
        return NextResponse.json(result, { status: result.error ? 500 : 200, headers: corsHeaders });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const prompt = body.prompt || body.message;
        if (!prompt) {
            return NextResponse.json({ error: 'Prompt kosong' }, { status: 400, headers: corsHeaders });
        }
        const result = await processAI(prompt);
        return NextResponse.json(result, { status: result.error ? 500 : 200, headers: corsHeaders });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
}

