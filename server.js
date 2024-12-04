const express = require('express');
const axios = require('axios');
const cors = require('cors');  // Importer CORS-pakken
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  // Bruk CORS for å tillate cross-origin requests
app.use(express.json());

// OpenAI API-nøkkel (fra .env-filen)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => {
    res.send("Hei, velkommen til serveren!");
});

app.post('/ask', async (req, res) => {
    const userInput = req.body.input;
    console.log("Mottatt input:", userInput);

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',  // Sørg for at du bruker riktig modell
            messages: [
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

        console.log("API-svar:", response.data);  // Logg API-svaret

        res.json({ answer: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, () => {
    console.log(`Serveren kjører på http://localhost:${PORT}`);
});
