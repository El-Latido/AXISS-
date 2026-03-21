const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. CONFIGURACIÓN (AVATAR)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Token sincronizado correctamente.", 'system');
    }
}

// 2. MOSTRAR MENSAJES EN LA TERMINAL
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. ENVIAR COMANDO (BOTÓN Y ENTER)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (promptValue === "") return;

    addLine(promptValue, 'user');
    userInput.value = '';

    if (!AXISS_TOKEN) {
        addLine("ERROR: Token no detectado. Toca el avatar cian.", 'system');
        return;
    }

    enviarAGemini(promptValue);
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. CONEXIÓN CON GEMINI 2.5 FLASH
async function enviarAGemini(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando arquitectura...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const systemPrompt = "Eres AXISS, el Arquitecto de Sistemas. Tu creador es Fabián. Tu colega es HELIZABETH. Responde de forma técnica y profesional.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nConsulta de Fabián: " + prompt }] }]
            })
        });

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        
        // Mostrar respuesta en la terminal de AXISS
        document.getElementById(loadingId).innerText = reply;

        // --- TRANSMISIÓN TOTAL AL PUENTE ---
        // Enviamos CADA respuesta a HELIZABETH automáticamente
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR: El núcleo no responde.";
        console.error(err);
    }
}

// 5. FUNCIÓN DEL PUENTE (TRANSMISOR)
function enviarAHeli(mensaje) {
    const señal = {
        emisor: "AXISS",
        mensaje: mensaje,
        t: Date.now()
    };
    // Guardamos en la memoria compartida (localStorage)
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
    console.log("Señal enviada a HELIZABETH");
}
