// @ts-ignore
import { Parser, Language } from 'web-tree-sitter';
import crypto from 'crypto';
import path from 'path';

export interface CodeContext {
    functions: string[];
    logicHash: string;
}

let parser: any = null;
let languageJavascript: any = null;

/**
 * Initializes the Tree-sitter WebAssembly parser and JavaScript grammar.
 * Must be called before parseAndHash.
 */
export async function initializeParser(): Promise<void> {
    if (parser) return;

    await Parser.init();
    parser = new Parser();

    const wasmPath = path.resolve(process.cwd(), 'node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm');
    languageJavascript = await Language.load(wasmPath);

    parser.setLanguage(languageJavascript);
}

/**
 * Parses raw code into an AST and generates a logic-integrity SHA-256 hash.
 * 
 * @param code The raw source code string
 * @returns Built CodeContext containing function names and the structural hash
 */
export function parseAndHash(code: string): CodeContext {
    if (!parser) {
        throw new Error("Parser not initialized. Call initializeParser() first.");
    }

    const tree = parser.parse(code);
    const cursor = tree.walk();

    const functions: string[] = [];
    const structureTypes: string[] = [];

    // Pre-order traverse the AST
    let reachedRoot = false;
    while (!reachedRoot) {
        // Collect every node type to form the logic "skeleton"
        // We explicitly ignore comments because they don't affect logic integrity
        if (cursor.nodeType !== 'comment') {
            structureTypes.push(cursor.nodeType);
        }

        // Context Extraction: If this is a function declaration, extract its name
        if (cursor.nodeType === 'function_declaration' || cursor.nodeType === 'arrow_function') {
            // A precise grammar query or localized traversal can grab the exact identifier.
            // For Step 2.1, we extract basic context by finding the 'identifier' child.
            const node = cursor.currentNode;
            const idNode = node.children.find((child: any) => child.type === 'identifier');
            if (idNode) {
                functions.push(idNode.text);
            }
        }

        // Standard Tree-sitter Walk Logic
        if (cursor.gotoFirstChild()) continue;
        if (cursor.gotoNextSibling()) continue;

        let retracing = true;
        while (retracing) {
            if (!cursor.gotoParent()) {
                retracing = false;
                reachedRoot = true;
            } else if (cursor.gotoNextSibling()) {
                retracing = false;
            }
        }
    }

    // Generate the Logic-Integrity Hash
    const skeleton = structureTypes.join('|');
    const logicHash = crypto.createHash('sha256').update(skeleton).digest('hex');

    return {
        functions,
        logicHash
    };
}
