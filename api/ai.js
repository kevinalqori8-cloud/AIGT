export default async function handler(req, res) {
    // Header CORS agar bisa diakses dari game / luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { prompt } = req.body || {};
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const PAWAN_API_KEY = process.env.PAWAN_API_KEY;
    if (!PAWAN_API_KEY) {
        return res.status(500).json({ error: 'PAWAN_API_KEY is not configured on Vercel Environment Variables' });
    }

    try {
        const response = await fetch("https://api.pawan.krd/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${PAWAN_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-V4.1-Flash",
                messages: [
                    { role: "system", content: "You are a helpful Growtopia AI Assistant. Answer concisely in Indonesian." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const aiReply = data.choices[0].message.content;
            return res.status(200).json({ status: "success", response: aiReply });
        } else {
            return res.status(500).json({ error: "Invalid response from AI provider", details: data });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

