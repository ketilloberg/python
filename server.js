const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const redis = require('redis');
require('dotenv').config(); 
const rateLimit = require('express-rate-limit'); // Importer express-rate-limit
const app = express();
const PORT = process.env.PORT || 3000;
const promptFilePath = './prompt.txt';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let promptContent = '';

// Konfigurer Redis-klienten og deaktiver SSL-verifisering
const client = redis.createClient({
  url: process.env.REDIS_URL, // Dette URL-et er tilgjengelig fra Heroku
  socket: {
    tls: true,  // Bruk SSL/TLS-forbindelse
    rejectUnauthorized: false // Deaktiver SSL-verifisering for selv-signerte sertifikater
  }
});

client.connect();  // Koble til Redis

// Middleware for å håndtere CORS
const corsOptions = {
    origin: '*', // Tillater alle domener. Sett til spesifikke URL-er for økt sikkerhet
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Tillater spesifikke HTTP-metoder
    allowedHeaders: ['Content-Type', 'Authorization'], // Tillater spesifikke headers
    credentials: true, // Tillater cookies og autentisering
    preflightContinue: false, // Fortsetter preflight-sjekking uten å avslutte den
    optionsSuccessStatus: 204 // No content på successful OPTIONS preflight
};

// Bruk CORS middleware før ruter
app.use(cors(corsOptions));
// Konfigurer rate limiting (1 minutts vindu, maks 60 forespørsler per IP)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutt
    max: 10, // Maksimalt antall forespørsler per IP i tidsvinduet
    message: "For mange forespørsler fra denne IP-en. Vennligst vent et øyeblikk.",
    standardHeaders: true, // Returner informasjon i `RateLimit-*` headers
    legacyHeaders: false, // Deaktiver `X-RateLimit-*` headers (foreldet)
});

// Bruk rate limiter som middleware før ruter
app.use(limiter);
// Les inn prompt ved oppstart
try {
  promptContent = fs.readFileSync(promptFilePath, 'utf8');
  console.log('Prompt lastet inn fra prompt.txt');
} catch (error) {
  console.error('Kunne ikke lese prompt.txt:', error.message);
  process.exit(1);
}

// Middleware
app.use(express.json());

// Chatbot API-endepunkt
app.post('/ask', async (req, res) => {
  const userInput = req.body.input;

  // Sjekk om svaret er i Redis-cachen
  const cachedAnswer = await client.get(userInput);
  if (cachedAnswer) {
    console.log("Svar fra cache:");
    return res.json({ answer: cachedAnswer });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `${promptContent}` },
        { role: 'user', content: userInput }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    let formattedAnswer = response.data.choices[0].message.content.trim();

    // Formatér svaret med HTML for lister og lenker
    formattedAnswer = formattedAnswer.replace(/\n/g, "<br/>");
    formattedAnswer = formattedAnswer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
    formattedAnswer = formattedAnswer.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedAnswer = formattedAnswer.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, 
      '<a href="$2" target="_blank">$1</a>');

    // Cache svaret i Redis for fremtidige forespørsler (sett i 1 time)
    await client.set(userInput, formattedAnswer, {
      EX: 3600, // Expiration time in seconds (1 hour)
    });

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
