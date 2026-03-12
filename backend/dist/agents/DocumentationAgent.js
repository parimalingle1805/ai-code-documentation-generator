import { z } from 'zod';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ArchitectPayloadSchema } from './ContextArchitect.js';
// Initialize the Genkit instance with the Google AI plugin
// It automatically picks up process.env.GEMINI_API_KEY
const ai = genkit({
    plugins: [googleAI()],
});
// The strictly typed output from our Documentation Generator
export const DocumentationResponseSchema = z.object({
    generatedMarkdown: z.string(),
    // Pass-through hash for downstream Verification Agent
    logicHash: z.string(),
});
/**
 * The Documentation Generator Agent.
 *
 * Takes the mathematically verified ArchitectPayload, constructs a rigorous prompt
 * focusing entirely on the extracted AST context, and generates documentation.
 */
export const documentationAgentFlow = ai.defineFlow({
    name: 'documentationAgentFlow',
    inputSchema: ArchitectPayloadSchema,
    outputSchema: DocumentationResponseSchema,
}, async (architectPayload) => {
    // 1. Construct the mathematically constrained prompt
    const prompt = `
You are an expert technical writer and Principal Developer.
Your task is to document the following code to the highest standard.

CRITICAL INSTRUCTION:
You must ONLY document the logic and functions explicitly extracted by our AST parser into the "Verified Target Functions" list below. Do NOT document internal variables unless they are part of the target functions.
Do not hallucinate parameters.
You MUST output the analyzed source code back into the documentation inside a \`\`\`javascript code block so that our verification gatekeeper can audit it.

### Verified Target Functions (AST Extracted Context)
${architectPayload.extractedContext.functions.join(', ')}

### Source Code
\`\`\`javascript
${architectPayload.originalCode}
\`\`\`

Return only the Markdown documentation. Do not include chat greetings.
        `.trim();
    // 2. Execute the LLM strictly against the Gemini 3 Flash model
    // Genkit handles the model routing, retries, and schema execution tracking.
    const response = await ai.generate({
        model: 'googleai/gemini-3-flash-preview',
        prompt: prompt,
    });
    // 3. Return the generated markdown and securely pass through the logicHash
    return {
        generatedMarkdown: response.text,
        logicHash: architectPayload.extractedContext.logicHash,
    };
});
