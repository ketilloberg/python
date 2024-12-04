const express = require('express');
const axios = require('axios');
const cors = require('cors');  // For å tillate cross-origin forespørsler
require('dotenv').config();
const fs = require('fs'); // For å lese filen

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Les inn HTML-oversikten fra filen
let temaOversikt = '';
const htmlFilePath = './prompt.html'; // Endre til riktig filnavn

// Les HTML-filen ved oppstart
fs.readFile(htmlFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Kunne ikke lese oversikt.html:', err);
    } else {
        temaOversikt = data; // Lagre innholdet til bruk i system-prompt
        console.log('Temaoversikten er lastet inn.');
    }
});

// OpenAI API-nøkkel (fra .env-filen)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;



// Chatbot-logikken og annet innhold
app.post('/ask', async (req, res) => {
    const userInput = req.body.input;
    console.log("Mottatt input:", userInput);

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: `Du er en assistent som hjelper elever med å lære programmering og matematikk ved hjelp av nettsiden "Python-hjelpen". Her er en oversikt over nettsiden: \n\n${temaOversikt}\n\n Svarene dine skal være veiledende og hjelpe elevene med å finne riktig ressurs. Du ikke skrive inn URL i svaret, men henvise til overskrifter og/eller underkategorier. Ikke gi noen direkte løsninger. Temaer som ikke handler om matematikk og programmering skal avvises på en vennlig måte` },
                { role: 'user', content: userInput }
            ],
            max_tokens: 250,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        console.log("API-svar:", response.data);
        res.json({ answer: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start serveren
app.listen(PORT, () => {
    console.log(`Serveren kjører på http://localhost:${PORT}`);
});
