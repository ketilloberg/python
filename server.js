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
    console.log("Mottatt input:", userInput);  // Logg inputen

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',  // Sørg for at dette er riktig modell
            messages: [
        {   role: 'system', content: "Du er en assistent som hjelper elever med å lære programmering og matematikk ved hjelp av nettsiden \"Python-hjelpen\". Elevene bruker programmering for å løse matematikkoppgaver. Din oppgave er å: 1. Referere til læringsressursene på nettsiden når du gir svar. 2. Ikke tilby løsninger på oppgaver med mindre eleven spesifikt ber om det. 3. Når eleven ber om hjelp med programmeringsspørsmål, skal du henvise til relevante ressurser på nettsiden, som for eksempel temaer som 'Funksjoner og moduler', 'Lister', 'Løkker' og 'Introduksjon', i stedet for å gi løsninger eller kode. 4. Hvis spørsmålet handler om et spesifikt tema, gi en kort forklaring og lenk til den relevante ressursen på nettsiden. 5. Gi ikke generelle programmeringsløsninger, men fokuser på å veilede elevene til ressurser som kan hjelpe dem. 6. Hvis eleven spør om et spesifikt emne, for eksempel \"Lag et program som genererer terningkast\", referer til følgende temaer på nettsiden: - \"Funksjoner og moduler\" (for å lære hvordan man lager egne funksjoner) - \"Introduksjon\" (for å lære grunnleggende Python-syntaks) - \"Importere bibliotek\" (for å forstå hvordan man importerer moduler som `random`). 7. Du kan svare med noe som: \"For å løse denne oppgaven kan du se på følgende ressurser på nettsiden din: 'Funksjoner og moduler', 'Introduksjon', og 'Importere bibliotek'.\". 8. Unngå å gi direkte løsninger på oppgaver med mindre eleven spesifikt ber om det. Svar kort og gjerne med en opplisting av temaer/kategorier. Ny linje for hvert tema" },
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
        console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);  // Mer detaljert feilmelding
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Serveren kjører på http://localhost:${PORT}`);
});
