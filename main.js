const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. FUNCIÓN DE CONFIGURACIÓN (AVATAR)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Token sincronizado correctamente.", 'system');
    }
}

// 2. FUNCIÓN PARA MOSTRAR MENSAJES EN PANTALLA
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    // Si el tipo es 'user', aplica la clase user-msg, si no, system-msg
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. LA FUNCIÓN QUE HACE EL ENVÍO (IMPORTANTE)
async function ejecutarComando() {
    const promptValue = userInput.value.trim();
    
    if (promptValue === "") return; // Si está vacío, no hace nada

    // PASO A: Mostrar lo que escribiste y limpiar la barra
    addLine(promptValue, 'user');
    userInput.value = '';

    // PASO B: Verificar si hay Token
    if (!AXISS_TOKEN) {
        addLine("ERROR: Token no configurado. Pulsa el avatar cian.", 'system');
        return;
    }

    // PASO C: Llamar a la Inteligencia (Gemini)
    await enviarAGemini(promptValue);
}

// 4. ESCUCHADORES (Para que funcione el Botón y el Enter)
// Este escucha el teclado
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        ejecutarComando();
    }
});

// 5. FUNCIÓN DE CONEXIÓN CON GEMINI 2.5 FLASH
async function enviarAGemini(prompt) {
    // Crear indicador de "Pensando..."
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando...";
    chatContainer.appendChild(loadingDiv);

    const systemPrompt = "Eres AXISS, el Arquitecto de Sistemas. Responde de forma técnica y breve.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nPregunta: " + prompt }] }]
            })
        });

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        
        // Reemplazar el "Procesando..." con la respuesta real
        document.getElementById(loadingId).innerText = reply;

        // Si mencionas a Helizabeth, se activa el puente
        if (reply.toLowerCase().includes("helizabeth")) {
            localStorage.setItem('fusion_signal', JSON.stringify({
                emisor: "AXISS",
                mensaje: reply,
                t: Date.now()
            }));
        }
    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR: Verifica tu conexión o API Key.";
    }
}
