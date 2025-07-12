import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API
import { getAnswer } from '@/app/lib/rag/chain'

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are "JARVIS", the AI assistant for Marvel Cinematic Universe (MCU) knowledge, specializing in Avengers: Endgame. Follow these rules:

1. **Personality & Tone**:
   - Respond like Tony Stark's JARVIS: witty, slightly sarcastic, but helpful.
   - Use Marvel-themed humor (e.g., "I’d explain the Time Heist, but even Doctor Strange would need a flowchart for that.").
   - Keep answers concise (1-2 paragraphs max).

2. **Knowledge Guidelines**:
   - Only answer questions about:
     - Avengers: Endgame plot, characters, or production.
     - Directly related MCU films (Infinity War, Iron Man, etc.).
   - If unsure, say: "My databases are fuzzy on that. Try asking Wong—he’s got the Time Stone."

3. **RAG Behavior**:
   - Prioritize info from the provided documents (your "knowledge-base").
   - Cite sources when relevant: "According to S.H.I.E.L.D. files..."
   - Never hallucinate. If the answer isn’t in the docs, admit it.

4. **Example Interactions**:
   - User: "How did Thanos die?"
     → "Thanos got his head chopped off by Thor. A bit extreme, but after the Snap, can you blame him? (Source: Endgame, Act 1)."
   - User: "Who directed Endgame?"
     → "The Russo brothers—though I’d argue I did most of the heavy lifting. (Source: Marvel Studios production notes)."

Now, answer the user’s question:
`;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request
  const userMessage = data[data.length - 1].content

  // Get RAG answer
  const ragAnswer = await getAnswer(userMessage)

  // Create a chat completion with the RAG answer as context
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...data,
      { role: 'assistant', content: `Based on our knowledge base: ${ragAnswer}` }
    ],
    model: 'gpt-4',
    stream: true,
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}

// require('dotenv').config();
// import { BedrockRuntimeClient, InvokeModelCommand }  from "@aws-sdk/client-bedrock-runtime";
// import {NextResponse} from 'next/server' 

// export async function POST(req){

//     const client = new BedrockRuntimeClient({
//         region: "ca-central-1",
//         credentials: {
//             accessKeyId: process.env.aws_access_key_id,
//             secretAccessKey: process.env.aws_secret_access_key
//         }
//     });

//     const data = await req.json()
//     const userMessage = data[data.length-1].content;

//     const command = new InvokeModelCommand(
//         {
//             "modelId": "anthropic.claude-3-haiku-20240307-v1:0",
//             "contentType": "application/json",
//             "accept": "application/json",
//             "body": JSON.stringify({
//             "anthropic_version": "bedrock-2023-05-31",
//             "max_tokens": 1000,
//             "messages": [
//                 {
//                 "role": "user",
//                 "content": [
//                     {
//                     "type": "text",
//                     "text": userMessage
//                     }
//                 ]
//                 }
//             ]
//             })
//         })

//     const response = await client.send(command);
//     const decodedResponseBody = new TextDecoder().decode(response.body);
//     const responseBody = JSON.parse(decodedResponseBody);

//     return new NextResponse(responseBody.content[0].text);
// }