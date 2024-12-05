const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Tillater cross-origin forespørsler
const fs = require('fs'); // For å lese filer
require('dotenv').config(); // Laster miljøvariabler

const app = express();
const PORT = process.env.PORT || 3000;
const promptFilePath = './prompt.txt'; // Pass på at denne pathen er riktig
let promptContent = '';

// Middleware
app.use(cors());
app.use(express.json());

// Les inn prompt ved oppstart
try {
    promptContent = fs.readFileSync(promptFilePath, 'utf8');
    console.log('Prompt lastet inn fra prompt.txt');
} catch (error) {
    console.error('Kunne ikke lese prompt.txt:', error.message);
    process.exit(1); // Stopper serveren hvis filen mangler
}
// OpenAI API-nøkkel (fra .env-filen)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Chatbot API-endepunkt
app.post('/ask', async (req, res) => {
    const userInput = req.body.input;
    if (userInput.trim().toLowerCase() === 'prompt') {
        console.log("Prompt skal sendes tilbake");  // Bekreft at "prompt" er gjenkjent
        return res.json({ answer: promptContent });
    }
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o',
            messages: [
                { 
                    role: 'system', 
                    content: `${promptContent}` 
                },
                { role: 'user', content: userInput }
            ],
            max_tokens: 250,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        res.json({ answer: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Feil med OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start serveren
app.listen(PORT, () => {
    console.log(`Serveren kjører på http://localhost:${PORT}`);
});