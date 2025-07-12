import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
require('dotenv').config();

export async function getVectorStore(indexName='chatbot-index') {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

    const index = pinecone.Index(indexName);

    return new PineconeStore(
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
        { pineconeIndex: index }
    );
}

export async function addDocumentsToVectorStore(documents, indexName='chatbot-index') {
    const vectorStore = await getVectorStore(indexName);
    await vectorStore.addDocuments(documents);
}
