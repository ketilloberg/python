// Importer express-modulen
const express = require('express');

// Opprett en express-applikasjon
const app = express();

// Definer porten serveren skal kjøre på
const PORT = process.env.PORT || 3000;

// En enkel rute for å teste serveren
app.get('/', (req, res) => {
    res.send('Hei, velkommen til serveren!');
});

// Start serveren og lytt på den spesifiserte porten
app.listen(PORT, () => {
    console.log(`Serveren kjører på http://localhost:${PORT}`);
});
