'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    csvContext: string;
}

export function AIChat({ isOpen, onClose, csvContext }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-focus input when drawer opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        const history = [...messages, userMsg];
        setMessages(history);
        setInput('');
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000); // 25-second timeout

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history.map(m => ({ role: m.role, content: m.content })),
                    csvContext,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout); // Clear timeout if fetch completes

            const contentType = res.headers.get('content-type') ?? '';

            if (!res.ok) {
                // Show actual error from server
                const errBody = await res.text();
                let errMsg = `API error ${res.status}`;
                try { errMsg = JSON.parse(errBody).error ?? errMsg; } catch { }
                throw new Error(errMsg);
            }

            // Handle JSON fallback response (full text, no streaming)
            if (contentType.includes('application/json')) {
                const json = await res.json();
                const text = json.text ?? json.error ?? 'No response';
                setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: text }]);
                return;
            }

            if (!res.body) throw new Error('No response body');

            // Add empty AI message that we'll stream into
            setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                // Vercel AI data stream: lines start with "0:" for text chunks
                for (const line of chunk.split('\n')) {
                    if (line.startsWith('0:')) {
                        try {
                            const token = JSON.parse(line.slice(2));
                            setMessages(prev =>
                                prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + token } : m)
                            );
                        } catch { /* skip malformed chunks */ }
                    } else if (!line.startsWith('0:') && !line.startsWith('e:') && !line.startsWith('d:') && line.trim()) {
                        // Plain text stream (toTextStreamResponse)
                        setMessages(prev =>
                            prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + line } : m)
                        );
                    }
                }
            }
        } catch {
            setMessages(prev => [...prev, {
                id: aiMsgId,
                role: 'assistant',
                content: '❌ Something went wrong connecting to Gemini. Check that GEMINI_API_KEY is set in your .env.local.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="chat-backdrop fade-in" onClick={onClose} />

            {/* Slide-out Drawer */}
            <div className="chat-drawer slide-in-right">
                <div className="chat-header">
                    <div className="chat-title">
                        <span>✨</span> AI Co-Pilot
                    </div>
                    <button className="chat-close-btn" onClick={onClose} type="button">×</button>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-message ai-msg">
                            <div className="msg-avatar">🤖</div>
                            <div className="msg-content">
                                {csvContext
                                    ? `I can see your batch payout data with ${csvContext.trim().split('\n').filter(Boolean).length} recipient(s). Ask me anything — I can check for duplicates, validate amounts, or summarize the total!`
                                    : `Hi! I'm your Web3 Co-Pilot. Paste some CSV data into the text area, then ask me to analyze it!`
                                }
                            </div>
                        </div>
                    )}

                    {messages.map(m => (
                        <div key={m.id} className={`chat-message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
                            <div className="msg-avatar">{m.role === 'user' ? '👤' : '🤖'}</div>
                            <div className="msg-content">{m.content}</div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="chat-message ai-msg">
                            <div className="msg-avatar">🤖</div>
                            <div className="msg-content" style={{ letterSpacing: '4px' }}>···</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={sendMessage}>
                    <input
                        ref={inputRef}
                        className="chat-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about these transactions..."
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="chat-submit-btn"
                        disabled={isLoading || !input.trim()}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </>
    );
}
