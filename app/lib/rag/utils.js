import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import path from "path";

// Load the PDF file
export async function loadPDF(filePath) {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs;
}

// Split the PDF into chunks
export async function splitDocuments(documents) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(documents);
    return splitDocs;
}

export async function processPDF(filePath) {
    try {
        const docs = await loadPDF(filePath);
        const splitDocs = await splitDocuments(docs);
        return splitDocs;
    } catch (error) {
        console.error(`Error processing PDF ${filePath}:`, error);
        throw error;
    }
}