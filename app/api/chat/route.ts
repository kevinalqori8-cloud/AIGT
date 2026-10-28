import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Menangani berbagai macam format payload dari Web maupun Script Lua GrowLauncher
        let userMessage = "";
        if (body.messages && Array.isArray(body.messages)) {
            const lastMsg = body.messages[body.messages.length - 1];
            userMessage = lastMsg?.content || "";
        } else if (body.prompt) {
            userMessage = body.prompt;
        } else if (body.message) {
            userMessage = body.message; // Cadangan jika script Lua mengirim key 'message'
        } else if (typeof body === 'string') {
            userMessage = body;
        }

        if (!userMessage) {
            return NextResponse.json({ error: 'Payload tidak valid. Kirim "prompt", "message", atau "messages".' }, { status: 400 });
        }

        const PAWAN_API_KEY = process.env.PAWAN_API_KEY;
        if (!PAWAN_API_KEY) {
            return NextResponse.json({ error: 'PAWAN_API_KEY belum disetting di Vercel Environment Variables' }, { status: 500 });
        }

        // Tembak ke API Pawan (DeepSeek)
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

        // Jika Pawan mengembalikan sukses
        if (data.choices && data.choices[0]) {
            const aiReply = data.choices[0].message.content;
            return NextResponse.json({
                status: "success",
                response: aiReply,
                content: aiReply
            });
        } else {
            // Mengembalikan detail error asli dari Pawan jika gagal
            return NextResponse.json({ 
                error: "Gagal dari server Pawan AI", 
                details: data 
            }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "API Growspeech siap digunakan!" });
}

