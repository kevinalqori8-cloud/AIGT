import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Perbaikan CORS agar bridge pihak ketiga diizinkan menembak API ini
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        
        let userMessage = "";
        if (body.prompt) {
            userMessage = body.prompt;
        } else if (body.message) {
            userMessage = body.message;
        } else if (body.messages && Array.isArray(body.messages)) {
            userMessage = body.messages[body.messages.length - 1]?.content || "";
        }

        if (!userMessage) {
            return NextResponse.json(
                { error: 'Prompt kosong atau payload tidak valid' }, 
                { status: 400, headers: corsHeaders }
            );
        }

        const PAWAN_API_KEY = process.env.PAWAN_API_KEY;
        if (!PAWAN_API_KEY) {
            return NextResponse.json(
                { error: 'PAWAN_API_KEY belum disetting di Environment Variables Vercel' }, 
                { status: 500, headers: corsHeaders }
            );
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
            }, { headers: corsHeaders });
        }

        return NextResponse.json({
            error: "Gagal memproses ke Pawan AI",
            details: data
        }, { status: 500, headers: corsHeaders });

    } catch (err: any) {
        return NextResponse.json(
            { error: "Server Error: " + err.message }, 
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { status: "success", response: "API Growspeech Online!" }, 
        { headers: corsHeaders }
    );
}

