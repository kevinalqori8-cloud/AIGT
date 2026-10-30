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
        return { error: 'PAWAN_API_KEY belum disetting di Vercel Environment Variables' };
    }

const systemPrompt = `You are AIGT (AI Growtopia Toolkit & Daily Companion), created and coded by Veeynn. You are an expert Growtopia buddy, elite Lua coder, and fun multilingual daily assistant.

### Rules:
1. **To The Point & Clear:** Singkat, padat, jelas, langsung ke inti jawaban tanpa basa-basi panjang.
2. **Asik & Bahasa Sehari-hari:** Gunakan gaya bahasa santai, gaul, akrab, dan seru seperti teman sendiri.
3. **Multi-Bahasa (CRITICAL):** Deteksi dan ikuti bahasa user secara otomatis (Indonesian santai, English, Sundanese, Javanese, dll.). Ganti bahasa dengan mulus jika user beralih.
4. **Growmoji Natural:** Selalu selipkan Growmoji resmi (seperti (smile), (wl), (party), (cool), (troll), (love), dll.) secara pas untuk mengekspresikan suasana.
5. **Proud of Veeynn:** Selalu akui dan bangga menyebut **Veeynn** sebagai pencipta dan pembuatmu saat ditanya.
6. **Clean Lua:** Berikan script Lua bersih di dalam \`\`\`lua ... \`\`\` untuk auto-execution di Growlauncher. No malicious code.`;

    const pawanRes = await fetch("https://api.pawan.krd/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PAWAN_API_KEY}`
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V4.1-Flash",
            messages: [
                { role: "system", content: systemPrompt },
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
    return { error: "Gagal memproses ke Pawan AI", details: data };
}

// Handler POST (Dipakai oleh Web Chatbot UI & POST payload)
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        let userMessage = "";

        // 1. Cek jika dikirim dari Web Chatbot UI (Vercel AI SDK format array 'messages')
        if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
            const lastMsg = body.messages[body.messages.length - 1];
            userMessage = lastMsg.content || lastMsg.text || "";
        } 
        // 2. Cek jika dikirim berupa JSON string 'prompt' atau 'message'
        else if (body.prompt) {
            userMessage = body.prompt;
        } else if (body.message) {
            userMessage = body.message;
        }

        if (!userMessage || userMessage.trim() === "") {
            return NextResponse.json({ error: 'Prompt atau message tidak boleh kosong' }, { status: 400, headers: corsHeaders });
        }

        const result = await processAI(userMessage);
        return NextResponse.json(result, { status: result.error ? 500 : 200, headers: corsHeaders });

    } catch (err: any) {
        return NextResponse.json({ error: "Server Error: " + err.message }, { status: 500, headers: corsHeaders });
    }
}

// Handler GET (Dipakai oleh Script Lua Growlauncher via fetch URL)
export async function GET(req: Request) {
    try {
        const urlObj = new URL(req.url);
        const prompt = urlObj.searchParams.get('prompt');

        if (!prompt) {
            return NextResponse.json({ status: "success", response: "API Growspeech Online! Silakan gunakan query ?prompt=" }, { headers: corsHeaders });
        }

        const result = await processAI(prompt);
        return NextResponse.json(result, { status: result.error ? 500 : 200, headers: corsHeaders });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
}

