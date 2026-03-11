import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

// --- Define Strict Data Interfaces ---
interface DocumentRequestPayload {
    code: string;
}

interface DocumentResponsePayload {
    documentation?: string;
    error?: string;
}

// --- Initializing the Google Gemini model ---
// 'as string' asserts to TypeScript that we guarantee this environment variable exists
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

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

            const prompt = `
              As an expert technical writer and senior software developer, please generate professional, clear, and concise documentation for the following code snippet.     
              The documentation should be in a standard format, such as JSDoc or Python Docstrings, depending on the language. Explain what the function does, its parameters (including their types and purpose), and what it returns.    
              Here is the code:
              \`\`\`
              ${code}
              \`\`\`
            `;

            console.log('Received code snippet:', code);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const documentation = response.text();

            res.status(200).json({ documentation });
        } catch (error) {
            console.error('Error generating documentation:', error);
            res.status(500).json({ error: 'Failed to generate documentation.' });
        }
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});