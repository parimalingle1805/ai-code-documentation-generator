import { contextArchitectFlow } from './agents/ContextArchitect.js';

/**
 * A standalone execution script to verify the Genkit Architect Agent Flow.
 */
async function testArchitectAgent() {
    console.log('=== Starting Context Architect Flow Test ===');
    
    const dummyCode = `
// Authenticates user and fetches profile
function loginUser(email, password) {
    const isAuthentic = hash(password) === db.getPassword(email);
    if (!isAuthentic) throw new Error("Unauthorized");
    return db.getProfile(email);
}
    `;
    
    console.log('Orchestrator Input (Raw Code):');
    console.log(dummyCode.trim());
    console.log('\nInvoking Genkit Flow...');

    try {
        // We invoke the flow like a normal async function, but Genkit wraps it with telemetry and strict output validation.
        const result = await contextArchitectFlow(dummyCode);

        console.log('\n=== Architect Payload Output ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('==================================');
        
        if (result.extractedContext.logicHash) {
            console.log('\n✅ Genkit Flow validation passed! ArchitectPayload structure verified.');
        }

    } catch (e) {
        console.error('❌ Context Architect failed to execute flow:', e);
    }
}

testArchitectAgent();
