import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { contextArchitectFlow } from './agents/ContextArchitect.js';
import { documentationAgentFlow } from './agents/DocumentationAgent.js';
import { verificationAgentFlow } from './agents/VerificationAgent.js';

// Load environment variables
dotenv.config();

// --- Define Strict Data Interfaces ---
interface DocumentRequestPayload {
    code: string;
}

interface DocumentResponsePayload {
    documentation?: string;
    isLogicIntact?: boolean;
    verificationMessage?: string;
    error?: string;
    waitTime?: number;
}



const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initial testing route (Explicitly typing req and res)
app.get('/', (req: Request, res: Response) => {
    res.send('AI Code Documentation Generator API is running!');
});

// --- API endpoint for generating documentation ---
// We pass our interfaces into the generic Request/Response types for strict validation
app.post(
    '/api/document',
    async (req: Request<{}, {}, DocumentRequestPayload>, res: Response<DocumentResponsePayload>): Promise<void> => {
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
            } else {
                console.warn('[WARNING] Pipeline:', finalResult.verificationMessage);
            }

            // 4. Send final payload and close connection
            res.write(`data: ${JSON.stringify({ step: 'complete', data: {
                documentation: finalResult.finalMarkdown,
                isLogicIntact: finalResult.isLogicIntact,
                verificationMessage: finalResult.verificationMessage
            }})}\n\n`);
            res.end();
        } catch (error: any) {
            console.error('Error generating documentation:', error);
            
            // --- Rate Limit (429) Parsing Logic ---
            const errorStr = String(error.message || error);
            let isRateLimit = errorStr.includes('429') || errorStr.toLowerCase().includes('quota');
            let waitTime = 60; // Default 60s cooldown

            if (isRateLimit) {
                try {
                    // Deep extract from GoogleGenerativeAIFetchError structure
                    if (error.errorDetails && Array.isArray(error.errorDetails)) {
                        for (const detail of error.errorDetails) {
                            if (detail.retryDelay) {
                                waitTime = parseInt(detail.retryDelay, 10);
                                break;
                            }
                        }
                    } else {
                        // Fallback stringify to catch it
                        const jsonStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                        const delayMatch = jsonStr.match(/"retryDelay":\s*"(\d+)s"/i);
                        if (delayMatch && delayMatch[1]) {
                            waitTime = parseInt(delayMatch[1], 10);
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse rate limit wait time", e);
                }
            }

            if (res.headersSent) {
                if (isRateLimit) {
                    res.write(`data: ${JSON.stringify({ step: 'error', type: 'rate_limit', waitTime, message: `Error: AI Quota Exceeded. Please refer to the cooldown timer.` })}\n\n`);
                } else {
                    res.write(`data: ${JSON.stringify({ step: 'error', type: 'general', message: 'Error: AI Provider failed. Please try again.' })}\n\n`);
                }
                res.end();
            } else {
                if (isRateLimit) {
                    res.status(429).json({ error: 'Quota exceeded', waitTime });
                } else {
                    res.status(500).json({ error: 'Failed to generate documentation.' });
                }
            }
        }
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});