import { contextArchitectFlow } from './agents/ContextArchitect.js';
import { documentationAgentFlow } from './agents/DocumentationAgent.js';
import { verificationAgentFlow } from './agents/VerificationAgent.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * A standalone execution script to verify the COMPLETE 3-Agent Pipeline:
 * Architect -> Documenter -> Verifier
 */
async function testFullPipeline() {
    console.log('=== Starting Full 3-Agent Pipeline Test ===\n');
    
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
    console.log('\n----------------------------------------\n');

    try {
        // --- Agent 1: Context Architect ---
        console.log('[1/3] Context Architect: Extracting Logic Hash & Context...');
        const architectPayload = await contextArchitectFlow(dummyCode);
        console.log('      ✅ Pass-Through Hash:', architectPayload.extractedContext.logicHash);

        // --- Agent 2: Documentation Generator ---
        console.log('\n[2/3] Documentation Generator: Calling Gemini 3 Flash...');
        const docPayload = await documentationAgentFlow(architectPayload);

        // --- Agent 3: Grounding Gatekeeper ---
        console.log('\n[3/3] Verification Agent: Hashing Output Code Blocks & Auditing Logic Integrity...');
        const finalResult = await verificationAgentFlow(docPayload);

        console.log('\n=== Gatekeeper Decision ===');
        if (finalResult.isLogicIntact) {
            console.log(`✅ ${finalResult.verificationMessage}`);
        } else {
            console.log(`❌ ${finalResult.verificationMessage}`);
        }
        
        console.log('\n=== Final Verified Markdown ===\n');
        console.log(finalResult.finalMarkdown);

    } catch (e) {
        console.error('\n❌ Pipeline execution failed:', e);
    }
}

testFullPipeline();
