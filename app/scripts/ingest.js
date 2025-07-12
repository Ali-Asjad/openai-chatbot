import { processPDF } from "../lib/rag/utils.js";
import { addDocumentsToVectorStore } from "../lib/rag/vectorStore.js";

import fs from "fs";
import path from "path";

async function ingestDocuments() {
    const docsDir = path.join(process.cwd(), "public", "pdf");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
        console.log("Created PDF directory at:", docsDir);
    }

    const pdfFiles = fs.readdirSync(docsDir).filter(file => file.endsWith(".pdf"));

    if (pdfFiles.length === 0) {
        console.log("No PDF files found in", docsDir);
        console.log("Please add PDF files to the directory and run this script again.");
        return;
    }

    for (const pdfFile of pdfFiles) {
        const pdfPath = path.join(docsDir, pdfFile);
        console.log(`Processing ${pdfFile}...`);
        try {
            const chunks = await processPDF(pdfPath);
            await addDocumentsToVectorStore(chunks);
            console.log(`✅ Added ${chunks.length} chunks to vector store`);
        } catch (error) {
            console.error(`❌ Error processing ${pdfFile}:`, error);
        }
    }
}

ingestDocuments()
    .then(() => console.log('Ingestion complete'))
    .catch(console.error);