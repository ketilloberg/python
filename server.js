const express = require('express');
const axios = require('axios');
const cors = require('cors');  // For å tillate cross-origin forespørsler
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// OpenAI API-nøkkel (fra .env-filen)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Data for temaene
const temaer = [
    {
        id: 'intro',
        navn: 'Introduksjon',
        beskrivelse: 'Innføring i grunnleggende elementer knyttet til syntaks og viktige nøkkelord og funksjoner.',
        link: 'https://ketilloberg.github.io/python/master/temaer/intro.html'
    },
    {
        id: 'lister',
        navn: 'Lister',
        beskrivelse: 'Om å opprette og bruke lister i Python, og relevante funksjoner knyttet til lister.',
        link: 'https://ketilloberg.github.io/python/master/temaer/lister.html'
    },
    {
        id: 'indeks',
        navn: 'Indeks',
        beskrivelse: 'Om bruk av indekser i lister og strenger.',
        link: 'https://ketilloberg.github.io/python/master/temaer/indeks.html'
    },
    {
        id: 'funkogmod',
        navn: 'Funksjoner og moduler',
        beskrivelse: 'Om å lage egne funksjoner og bruke moduler som Turtle, Math, Random og Time.',
        link: 'https://ketilloberg.github.io/python/master/temaer/funkogmod.html'
    }
];

// API-endepunkt for å hente temalisten
app.get('/api/temaer', (req, res) => {
    res.json({ temaer });
});

// Chatbot-logikken og annet innhold
app.post('/ask', async (req, res) => {
    const userInput = req.body.input;
    console.log("Mottatt input:", userInput);

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: `Du er en assistent som hjelper elever med å lære programmering og matematikk ved hjelp av nettsiden "Python-hjelpen". Du skal bruke dataene fra API-et som inneholder følgende temaer:\n\n${temaer.map(t => `- **${t.navn}**: ${t.beskrivelse} (${t.link})`).join('\n')}\n\nSvarene dine skal være veiledende og hjelpe elevene med å finne riktig ressurs.` },
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
