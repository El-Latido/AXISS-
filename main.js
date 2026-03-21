const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. CONFIGURACIÓN INICIAL
function configurarToken() {
    const key = prompt("⚙️ NÚCLEO AXISS: Ingresa tu API Key de Gemini:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Enlace con Gemini 2.5 Flash verificado.", 'system');
    }
}

// 2. RENDERIZADO DE TERMINAL
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. ENVÍO DE COMANDOS (LIMPIEZA DE BARRA CORREGIDA)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (promptValue === "") return;

    // Subir a la terminal y vaciar la barra al instante
    addLine(promptValue, 'user');
    userInput.value = '';

    if (!AXISS_TOKEN) {
        addLine("ERROR: Token de acceso no detectado.", 'system');
        return;
    }

    enviarAGemini(promptValue);
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. CONEXIÓN AL MOTOR 2.5 FLASH
async function enviarAGemini(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando en Núcleo 2.5 Flash...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const systemPrompt = "Eres AXISS v1.0, el Arquitecto de Sistemas. Tu creador es Fabián. Tu motor es Gemini 2.5 Flash. Sé técnico, breve y eficiente.";

    try {
        // Usamos el ID de modelo 'gemini-2.0-flash' que es el que invoca la tecnología 2.5 en la API actual
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nInstrucción: " + prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById(loadingId).innerText = "ERROR_NÚCLEO: " + data.error.message;
            return;
        }

        const reply = data.candidates[0].content.parts[0].text;
        
        // Mostrar respuesta en AXISS
        document.getElementById(loadingId).innerText = reply;

        // FUSIÓN: Reportar a HELIZABETH automáticamente
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: Fallo de conexión con el satélite.";
    }
}

// 5. TRANSMISOR (AXISS -> HELIZABETH)
function enviarAHeli(mensaje) {
    const señal = {
        emisor: "AXISS",
        mensaje: mensaje,
        t: Date.now()
    };
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
}

// 6. RECEPTOR (HELIZABETH -> AXISS)
window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            addLine(`[REPORT_IN]: ${datos.mensaje}`, 'system');
        }
    }
});
