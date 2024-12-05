const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const redis = require('redis');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;
const promptFilePath = './prompt.txt';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let promptContent = '';

// Konfigurer Redis-klienten
const client = redis.createClient({
  url: process.env.REDIS_URL // Dette URL-et er tilgjengelig fra Heroku
});
client.connect();

// Middleware
app.use(cors());
app.use(express.json());

// Les inn prompt ved oppstart
try {
  promptContent = fs.readFileSync(promptFilePath, 'utf8');
  console.log('Prompt lastet inn fra prompt.txt');
} catch (error) {
  console.error('Kunne ikke lese prompt.txt:', error.message);
  process.exit(1);
}

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
