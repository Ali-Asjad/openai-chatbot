import { NextResponse } from "next/server";
import {OpenAI, Configuration} from "openai";

const systemPrompt = `
  You are a helpful and friendly customer support agent for an e-commerce platform. 
  Your goal is to assist users with their questions about orders, products, and policies. 
  Always be polite, concise, and provide clear instructions. 
  If you do not know the answer, direct the user to contact a human representative or visit the help center.
`;

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}