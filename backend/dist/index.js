import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { contextArchitectFlow } from './agents/ContextArchitect.js';
import { documentationAgentFlow } from './agents/DocumentationAgent.js';
import { verificationAgentFlow } from './agents/VerificationAgent.js';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
// Initial testing route (Explicitly typing req and res)
app.get('/', (req, res) => {
    res.send('AI Code Documentation Generator API is running!');
});
// --- API endpoint for generating documentation ---
// We pass our interfaces into the generic Request/Response types for strict validation
app.post('/api/document', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: 'Code is required in the request body.' });
            return; // Must explicitly return to stop execution
        }
        console.log('Received code snippet:', code);
        // Establish SSE connection headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // 1. Architect: Parse AST and Hash Logic
        res.write('data: ' + JSON.stringify({ step: 1, message: 'Extracting Abstract Syntax Tree and Logic Hash...' }) + '\n\n');
        const architectPayload = await contextArchitectFlow(code);
        console.log('Orchestrator Logic Hash:', architectPayload.extractedContext.logicHash);
        // 2. Documenter: Generate Constrained Docs
        res.write('data: ' + JSON.stringify({ step: 2, message: 'Gemini 3 Flash Context Generation...' }) + '\n\n');
        const docPayload = await documentationAgentFlow(architectPayload);
        // 3. Gatekeeper: Hash verification on AST
        res.write('data: ' + JSON.stringify({ step: 3, message: 'Gatekeeper verifying cryptographic code integrity...' }) + '\n\n');
        const finalResult = await verificationAgentFlow(docPayload);
        if (finalResult.isLogicIntact) {
            console.log('[SUCCESS] Pipeline:', finalResult.verificationMessage);
        }
        else {
            console.warn('[WARNING] Pipeline:', finalResult.verificationMessage);
        }
        // 4. Send final payload and close connection
        res.write(`data: ${JSON.stringify({ step: 'complete', data: {
                documentation: finalResult.finalMarkdown,
                isLogicIntact: finalResult.isLogicIntact,
                verificationMessage: finalResult.verificationMessage
            } })}\n\n`);
        res.end();
    }
    catch (error) {
        console.error('Error generating documentation:', error);
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ step: 'error', message: 'Error: AI Provider is currently overloaded or failed. Please try again.' })}\n\n`);
            res.end();
        }
        else {
            res.status(500).json({ error: 'Failed to generate documentation.' });
        }
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
