import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        let userMessage = "";
        if (body.messages && Array.isArray(body.messages)) {
            const lastMsg = body.messages[body.messages.length - 1];
            userMessage = lastMsg?.content || "";
        } else if (body.prompt) {
            userMessage = body.prompt;
        }

        if (!userMessage) {
            return NextResponse.json({ error: 'Message or prompt is required' }, { status: 400 });
        }

        const PAWAN_API_KEY = process.env.PAWAN_API_KEY;
        if (!PAWAN_API_KEY) {
            return NextResponse.json({ error: 'PAWAN_API_KEY is missing on Vercel' }, { status: 500 });
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
            const aiReply = data.choices[0].message.content;
            return NextResponse.json({
                status: "success",
                response: aiReply,
                content: aiReply
            });
        } else {
            return NextResponse.json({ error: "Invalid response from Pawan AI", details: data }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Supaya tidak 404 kalau dicek langsung di browser via GET
export async function GET() {
    return NextResponse.json({ status: "Growspeech API is online and running!" });
}

