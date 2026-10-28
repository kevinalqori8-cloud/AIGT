import { NextResponse } from 'next/server';

export const runtime = 'edge';

async function handleAIRequest(userMessage: string) {
    const PAWAN_API_KEY = process.env.PAWAN_API_KEY;
    if (!PAWAN_API_KEY) {
        return { error: 'PAWAN_API_KEY belum dikonfigurasi di Vercel' };
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
                { role: "user", content: userMessage }
            ],
            max_tokens: 300
        })
    });

    const data = await pawanRes.json();
    if (data.choices && data.choices[0]) {
        return { status: "success", response: data.choices[0].message.content };
    }
    return { error: "Gagal mendapat balasan dari Pawan AI", details: data };
}

// Menangani POST dari Web UI Chatbot
export async function POST(req: Request) {
    try {
        const body = await req.json();
        let userMessage = "";
        if (body.messages && Array.isArray(body.messages)) {
            userMessage = body.messages[body.messages.length - 1]?.content || "";
        } else if (body.prompt) {
            userMessage = body.prompt;
        }

        if (!userMessage) {
            return NextResponse.json({ error: 'Prompt atau message diperlukan' }, { status: 400 });
        }

        const result = await handleAIRequest(userMessage);
        return NextResponse.json(result, { status: result.error ? 500 : 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Menangani GET khusus untuk Growlauncher Script (via fetch)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt');

    if (!prompt) {
        return NextResponse.json({ status: "API Growspeech Aktif! Gunakan query ?prompt=pesan_anda" });
    }

    const result = await handleAIRequest(prompt);
    return NextResponse.json(result, { status: result.error ? 500 : 200 });
}

