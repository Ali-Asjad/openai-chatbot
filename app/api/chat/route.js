// import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
// import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// // System prompt for the AI, providing guidelines on how to respond to users
// const systemPrompt = `
//   You are a helpful and friendly customer support agent for an e-commerce platform. 
//   Your goal is to assist users with their questions about orders, products, and policies. 
//   Always be polite, concise, and provide clear instructions. 
//   If you do not know the answer, direct the user to contact a human representative or visit the help center.
// `;

// // POST function to handle incoming requests
// export async function POST(req) {
//   const openai = new OpenAI() // Create a new instance of the OpenAI client
//   const data = await req.json() // Parse the JSON body of the incoming request

//   // Create a chat completion request to the OpenAI API
//   const completion = await openai.chat.completions.create({
//     messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
//     model: 'gpt-4o', // Specify the model to use
//     stream: true, // Enable streaming responses
//   })

//   // Create a ReadableStream to handle the streaming response
//   const stream = new ReadableStream({
//     async start(controller) {
//       const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
//       try {
//         // Iterate over the streamed chunks of the response
//         for await (const chunk of completion) {
//           const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
//           if (content) {
//             const text = encoder.encode(content) // Encode the content to Uint8Array
//             controller.enqueue(text) // Enqueue the encoded text to the stream
//           }
//         }
//       } catch (err) {
//         controller.error(err) // Handle any errors that occur during streaming
//       } finally {
//         controller.close() // Close the stream when done
//       }
//     },
//   })

//   return new NextResponse(stream) // Return the stream as the response
// }

require('dotenv').config();
import { BedrockRuntimeClient, InvokeModelCommand }  from "@aws-sdk/client-bedrock-runtime";
import {NextResponse} from 'next/server' 

export async function POST(req){

    const client = new BedrockRuntimeClient({
        region: "ca-central-1",
        credentials: {
            accessKeyId: process.env.aws_access_key_id,
            secretAccessKey: process.env.aws_secret_access_key
        }
    });

    const data = await req.json()
    const userMessage = data[data.length-1].content;

    const command = new InvokeModelCommand(
        {
            "modelId": "anthropic.claude-3-haiku-20240307-v1:0",
            "contentType": "application/json",
            "accept": "application/json",
            "body": JSON.stringify({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": userMessage
                    }
                ]
                }
            ]
            })
        })

    const response = await client.send(command);
    const decodedResponseBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(decodedResponseBody);

    return new NextResponse(responseBody.content[0].text);
}