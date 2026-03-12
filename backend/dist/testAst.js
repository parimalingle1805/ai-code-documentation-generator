import { initializeParser, parseAndHash } from './utils/astParser.js';
async function runTest() {
    try {
        console.log('Initializing Tree-Sitter WASM parser...');
        await initializeParser();
        console.log('Parser initialized successfully.\n');
        const dummyCode1 = `
function calculateTotal(price, taxRate) {
    const tax = price * taxRate;
    return price + tax;
}
        `;
        const dummyCode2 = `
// Function to compute total cost
function   calculateTotal ( price , taxRate ) {
  const tax = price * taxRate;
  return price + tax;
}
        `;
        console.log('--- Test Code 1 (Clean formatting) ---');
        console.log(dummyCode1.trim());
        const result1 = parseAndHash(dummyCode1);
        console.log('\nExtracted Context:', result1.functions);
        console.log('Logic-Integrity Hash:', result1.logicHash);
        console.log('\n--- Test Code 2 (Messy formatting & Comments) ---');
        console.log(dummyCode2.trim());
        const result2 = parseAndHash(dummyCode2);
        console.log('\nExtracted Context:', result2.functions);
        console.log('Logic-Integrity Hash:', result2.logicHash);
        console.log('\n=============================================');
        if (result1.logicHash === result2.logicHash) {
            console.log('✅ SUCCESS: Hashes match perfectly despite formatting differences!');
        }
        else {
            console.log('❌ FAILURE: Hashes do not match!');
        }
        console.log('=============================================\n');
    }
    catch (e) {
        console.error('Failed to run AST test:', e);
    }
}
runTest();
