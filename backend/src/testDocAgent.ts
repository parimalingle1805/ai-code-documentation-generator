import { contextArchitectFlow } from './agents/ContextArchitect.js';
import { documentationAgentFlow } from './agents/DocumentationAgent.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * A standalone execution script to verify the full Genkit Agent Pipeline:
 * ArchitectPayload -> DocumentationAgent -> Markdown
 */
async function testDocumentationPipeline() {
    console.log('=== Starting Documentation Pipeline Test ===\n');
    
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ ERROR: GEMINI_API_KEY is not set in the environment.');
        process.exit(1);
    }

    const dummyCode = `
// Authenticates user and fetches profile
function loginUser(email, password) {
    const isAuthentic = hash(password) === db.getPassword(email);
    if (!isAuthentic) throw new Error("Unauthorized");
    return db.getProfile(email);
}

function hash(str) {
    return 'hashed_' + str;
}
    `;
    
    console.log('Orchestrator Input (Raw Code):');
    console.log(dummyCode.trim());
    console.log('\n[1/2] Invoking Context Architect Flow...');

    try {
        // Step 1: Execute the Orchestrator
        const architectPayload = await contextArchitectFlow(dummyCode);
        console.log('✅ ArchitectPayload received. Logic Hash:', architectPayload.extractedContext.logicHash);

        console.log('\n[2/2] Invoking Documentation Generator Flow (Calling Gemini Flash)...');
        
        // Step 2: Pass output to the LLM agent
        const docResult = await documentationAgentFlow(architectPayload);

        console.log('\n=== Generated Documentation (Gemini 3 Flash) ===\n');
        console.log(docResult.generatedMarkdown);
        console.log('\n================================================\n');
        
        console.log('✅ Genkit Pipeline complete! Passthrough logic hash:', docResult.logicHash);
        
        if (docResult.logicHash === architectPayload.extractedContext.logicHash) {
            console.log('🔒 Verification Passthrough: SUCCESS');
        } else {
             console.log('❌ Verification Passthrough: FAILED (Hash Mismatch)');
        }

    } catch (e) {
        console.error('\n❌ Documentation Pipeline failed during execution:', e);
    }
}

testDocumentationPipeline();
