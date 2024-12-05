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
            max_tokens: 500,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

    // Her formaterer vi svaret for å bruke <ul>, <ol> og <li> for lister
    let formattedAnswer = response.data.choices[0].message.content.trim();

    // Erstatt linjeskift med <br/>
    formattedAnswer = formattedAnswer.replace(/\n/g, "<br/>");

    // Erstatt markdown med HTML (f.eks. **bold** blir <strong>bold</strong>)
    formattedAnswer = formattedAnswer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **bold** -> <strong>bold</strong>
    formattedAnswer = formattedAnswer.replace(/\*(.*?)\*/g, '<em>$1</em>'); // *italic* -> <em>italic</em>

    // For å formatere punktlister og numrerte lister, bruk regex for å fange de
    // For nummererte lister (1. item)
    formattedAnswer = formattedAnswer.replace(/^\s*(\d+\.)\s+/gm, '<ol><li>$1 '); 
    formattedAnswer = formattedAnswer.replace(/\n/g, '</li><li>').replace(/<\/li><li>$/, '</li></ol>'); // Avsluttes med </ol>

    // For punktlister (starte med - eller *)
    formattedAnswer = formattedAnswer.replace(/^\s*[-\*]\s+/gm, '<ul><li>');
    formattedAnswer = formattedAnswer.replace(/\n/g, '</li><li>').replace(/<\/li><li>$/, '</li></ul>'); // Avsluttes med </ul>

    // Gjør lenkene klikkbare (regex for å finne URLer og gjøre dem til HTML-lenker)
    // Gjør lenkene klikkbare (regex for å finne URLer og gjøre dem til HTML-lenker)
    formattedAnswer = formattedAnswer.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, 
    '<a href="$2" target="_blank">$1</a>');  // Lag klikkbare lenker fra markdown

        // Returner det HTML-formatert svaret
        res.json({ answer: formattedAnswer });
    } catch (error) {
        console.error('Feil med OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start serveren
app.listen(PORT, () => {
    console.log(`Serveren kjører på http://localhost:${PORT}`);
});