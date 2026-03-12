import { z } from 'zod';
import { genkit } from 'genkit';
import { DocumentationResponseSchema } from './DocumentationAgent.js';
import { parseAndHash, initializeParser } from '../utils/astParser.js';
// Initialize the Genkit instance
const ai = genkit({});
// The strictly typed output from our Verification Agent
export const VerifiedResponseSchema = z.object({
    finalMarkdown: z.string(),
    isLogicIntact: z.boolean(),
    verificationMessage: z.string(),
});
/**
 * The Grounding & Verification Gatekeeper.
 *
 * Takes the output from the Documentation Agent, parses any code blocks
 * back into an AST, generates a logic hash, and compares it against the original hash.
 */
export const verificationAgentFlow = ai.defineFlow({
    name: 'verificationAgentFlow',
    inputSchema: DocumentationResponseSchema,
    outputSchema: VerifiedResponseSchema,
}, async (docPayload) => {
    // Ensure Tree-sitter WASM is mounted
    await initializeParser();
    const { generatedMarkdown, logicHash: originalHash } = docPayload;
    // Extract code blocks from the generated markdown
    // Matches ```javascript ... ``` and ```ts ... ``` etc.
    const codeBlockRegex = /```(?:javascript|typescript|js|ts)\n([\s\S]*?)```/gi;
    let match;
    const extractedCodes = [];
    while ((match = codeBlockRegex.exec(generatedMarkdown)) !== null) {
        extractedCodes.push(match[1]);
    }
    let isLogicIntact = true;
    let verificationMessage = "SUCCESS: Logic verified. No code blocks detected in LLM output, or perfectly intact.";
    if (extractedCodes.length > 0) {
        // Re-hash the code blocks the AI yielded
        // By concatenating them, we verify the overarching sequence of syntax logic
        const combinedCode = extractedCodes.join('\n');
        const newContext = parseAndHash(combinedCode);
        if (newContext.logicHash !== originalHash) {
            isLogicIntact = false;
            verificationMessage = `WARNING: Code alteration detected (Hallucination). Initial hash vs Generated hash mismatch!`;
        }
        else {
            verificationMessage = "SUCCESS: Logic verified. Cryptographic hash of documentation code perfectly matches source.";
        }
    }
    return {
        finalMarkdown: generatedMarkdown,
        isLogicIntact,
        verificationMessage,
    };
});
