import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Bisa menggunakan Edge Runtime agar super cepat di Vercel

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Mendukung format Web Chatbot (messages array) maupun Lua GrowLauncher (prompt string)
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
            return NextResponse.json({ error: 'PAWAN_API_KEY is not configured on Vercel' }, { status: 500 });
        }

        // Tembak langsung ke API Pawan (DeepSeek)
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
                max_tokens: 250
            })
        });

        const data = await pawanRes.json();

        if (data.choices && data.choices[0]) {
            const aiReply = data.choices[0].message.content;
            
            // Mengembalikan respons ganda (kompatibel dengan UI Web Chatbot & Script Lua)
            return NextResponse.json({
                status: "success",
                response: aiReply,  // Format untuk Lua GrowLauncher
                content: aiReply,   // Format alternatif
                choices: data.choices
            });
        } else {
            return NextResponse.json({ error: "Invalid response from Pawan AI", details: data }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
