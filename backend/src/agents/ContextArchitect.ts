import { z } from 'zod';
import { genkit } from 'genkit';
import { parseAndHash, initializeParser } from '../utils/astParser.js';

// Initialize the Genkit instance. 
// We are not configuring a model yet because this agent is pure syntax logic.
const ai = genkit({});

// The strictly typed output from our Orchestrator
export const ArchitectPayloadSchema = z.object({
    originalCode: z.string(),
    extractedContext: z.object({
        functions: z.array(z.string()),
        logicHash: z.string(),
    }),
});

export type ArchitectPayload = z.infer<typeof ArchitectPayloadSchema>;

/**
 * The Context Architect Agent.
 * 
 * This Orchestrator takes raw code, triggers the syntax parser to generate 
 * the logic fingerprint and function names, and returns a verified Context payload.
 */
export const contextArchitectFlow = ai.defineFlow(
    {
        name: 'contextArchitectFlow',
        inputSchema: z.string() as any,
        outputSchema: ArchitectPayloadSchema as any,
    },
    async (codeString: string): Promise<ArchitectPayload> => {
        // Ensure Tree-sitter WASM is mounted
        await initializeParser();
        
        // Build the Integrity Fingerprint
        const astContext = parseAndHash(codeString);

        return {
            originalCode: codeString,
            extractedContext: {
                functions: astContext.functions,
                logicHash: astContext.logicHash,
            }
        };
    }
);
