import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {GoogleGenerativeAI} from "@google/generative-ai";

// Load environment variables from .env file. This utility loads environment variables from a .env file
// into process.env, allowing us to keep sensitive data like API keys out of our source code.
dotenv.config();

// --- Initializing the Google Gemini Pro model ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Initialize the Express app
const app = express();

// Define the port the server will run on
const PORT = process.env.PORT || 5001;

// Apply middleware. cors is a middleware package that enables our backend (running on one port) to
// accept requests from our frontend (which will run on a different port).
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// Initial testing route
app.get('/', (req, res) => {
    res.send('AI Code Documentation Generator API is running!');
});

// --- Defined API endpoint for generating documentation ---
app.post('/api/document', async (req, res) => {
    try {
            // Get the code from the request body
            const { code } = req.body;

            // Basic validation: Check if code exists
            if (!code) {
                return res.status(400).json({ error: 'Code is required in the request body.' });
            }

            // Constructing prompt for the API
            const prompt = `
              As an expert technical writer and senior software developer, please generate professional, clear, and concise documentation for the following code snippet.     
              The documentation should be in a standard format, such as JSDoc or Python Docstrings, depending on the language. Explain what the function does, its parameters (including their types and purpose), and what it returns.    
              Here is the code:
              \`\`\`
              ${code}
              \`\`\`
            `;

            console.log('Received code snippet:', code);

            // --- API call ---
            const result = await model.generateContent(prompt);
            console.log(result);
            const response = await result.response;
            const documentation = response.text();

            // --- Sending the AI-generated documentation back to the client ---
            res.status(200).json({ documentation });
        } catch (error) {
            console.error('Error generating documentation:', error);
            res.status(500).json({ error: 'Failed to generate documentation.' });
        }
    });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});