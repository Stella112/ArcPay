import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, csvContext } = await req.json();

        const csvInfo = csvContext?.trim()
            ? `\n\nCSV payout data:\n\`\`\`\n${csvContext}\n\`\`\``
            : '';

        const systemPrompt = `You are an expert Web3 transaction assistant inside Arc Payout Hub. Analyze batch payout CSV data, spot errors (duplicates, suspicious amounts), and answer questions concisely. Use markdown.${csvInfo}`;

        // Convert from OpenAI format to Gemini format
        const contents = messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const result = await ai.models.generateContentStream({
                        model: 'gemini-2.0-flash-lite',
                        config: {
                            systemInstruction: systemPrompt,
                            temperature: 0.3,
                        },
                        contents,
                    });

                    for await (const chunk of result) {
                        const text = chunk.text ?? '';
                        if (text) {
                            // Vercel AI data stream format: 0:"<text>"\n
                            controller.enqueue(
                                new TextEncoder().encode(`0:${JSON.stringify(text)}\n`)
                            );
                        }
                    }
                } catch (err) {
                    const msg = String(err);
                    controller.enqueue(
                        new TextEncoder().encode(`0:${JSON.stringify('❌ ' + msg.slice(0, 200))}\n`)
                    );
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('AI Route Error:', error);
        return new Response(
            JSON.stringify({ error: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
