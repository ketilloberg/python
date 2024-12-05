// Når siden er lastet inn
window.addEventListener('load', function () {
    // Fjern preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
        document.body.classList.add('loaded');
    }

    // Håndter hash i URL-en
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 300); // Juster forsinkelsen om nødvendig
        }
    } else {
        // Scroll til toppen hvis ingen hash er til stede
        window.scrollTo(0, 0);
    }
});

// Når DOM-innholdet er klart
document.addEventListener('DOMContentLoaded', function () {
    // Hent tekstfeltet for brukerinput
    const userInputField = document.getElementById("user-input");
    if (userInputField) {
        // Lytt etter Enter-tasten
        userInputField.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Forhindre standard oppførsel
                sendMessage(); // Kall sendMessage-funksjonen
            }
        });
    }
});

// Funksjonen som sender meldinger
async function sendMessage() {
    const inputElement = document.getElementById("user-input");
    const message = inputElement.value;
    console.log("sendMessage kalt, brukerinput:", message); // Logg for å sjekke om funksjonen blir kalt
    if (message.trim() === "") return; // Ikke send tomme meldinger

    // Vis brukerens melding
    appendMessage("Du: " + message);

    // Tøm inputfeltet
    inputElement.value = "";

    try {
        // Send forespørsel til serveren
        const response = await fetch('https://limitless-waters-02888-6f360deefa8e.herokuapp.com/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: message })
        });
        

        // Hent svaret fra serveren
        const data = await response.json();

        // Vis AI-svaret
        appendMessage("Python-assistent: " + data.answer);
    } catch (error) {
        console.error("Error:", error);
        appendMessage("AI: Det oppsto en feil, prøv igjen senere.");
    }
}


// Funksjon for å legge til meldinger i chatten
function appendMessage(message) {
    const messagesElement = document.getElementById("messages");
    const newMessage = document.createElement("div");

    // Hvis meldingen er en liste, formater den med ul/li
    if (message.includes("\n")) {
        const listItems = message.split('\n').map(item => {
            if (item.startsWith("-")) {
                return `<li>${item.replace('-', '').trim()}</li>`;
            } else {
                return `<p>${item.trim()}</p>`;
            }
        }).join('');
        
        newMessage.innerHTML = `<ul>${listItems}</ul>`;
    } else {
        // Hvis ikke, vis meldingen som vanlig tekst
        newMessage.textContent = message;
    }

    // Legg til den nye meldingen i chatten
    messagesElement.appendChild(newMessage);
    messagesElement.scrollTop = messagesElement.scrollHeight; // Scroll til siste melding
}
