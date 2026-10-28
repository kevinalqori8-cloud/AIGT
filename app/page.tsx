'use client';
import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMsgs, { role: 'assistant', content: data.content }]);
      } else {
        setMessages([...newMsgs, { role: 'assistant', content: 'Error: Gagal mendapat respons AI.' }]);
      }
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: 'Error koneksi ke server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Growspeech Web Chatbot</h2>
      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll', padding: '15px', marginBottom: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
        {messages.length === 0 && <p style={{ color: '#888' }}>Kirim pesan untuk mulai chat dengan AI...</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '10px 0', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <span style={{ background: m.role === 'user' ? '#0070f3' : '#e0e0e0', color: m.role === 'user' ? '#fff' : '#000', padding: '8px 12px', borderRadius: '8px', display: 'inline-block', maxWidth: '80%' }}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: '#666', fontStyle: 'italic' }}>AI sedang mengetik...</p>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Kirim</button>
      </form>
    </main>
  );
}

