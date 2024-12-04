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
                { role: 'system', content: "Du er en assistent som hjelper elever med å lære programmering og matematikk ved hjelp av nettsiden 'Python-hjelpen'. Du skal kun gi svar som henviser til relevante sider på nettstedet. Svarene dine skal være veiledende og hjelpe elevene med å finne den riktige ressursen for å løse deres spørsmål. Ikke gi direkte løsninger på oppgaver med mindre eleven spesifikt ber om det. Her er temaene og en kort beskrivelse:\n\n- **Introduksjon**: Grunnleggende elementer om syntaks og viktige nøkkelord i Python.\n- **Lese kode**: Om ulike datatyper og hvordan man leser og lager kode, inkludert forskjellen mellom prosessering og data.\n- **Lister**: Hvordan opprette og bruke lister i Python, samt funksjoner knyttet til lister.\n- **Løkker**: Bruken av for- og while-løkker, inkludert hvordan disse fungerer sammen med lister.\n- **Indeks**: Grunnleggende konsepter om indeksering av lister og strings.\n- **Funksjoner og moduler**: Hvordan lage egne funksjoner, og hvordan importere og bruke moduler som Turtle, Math, Random og Time.\n\nHusk, svarene skal være korte, klare og alltid referere til relevante temaer på nettsiden." },
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
