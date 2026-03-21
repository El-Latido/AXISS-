const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. CONFIGURACIÓN DE ACCESO
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Sincronización con Núcleo 2.5 Flash exitosa.", 'system');
    }
}

// 2. RENDERIZADO DE LÍNEAS
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. LÓGICA DE ENVÍO INTEGRADA (BOTÓN Y ENTER)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (promptValue === "") return;

    // Acción inmediata: Subir mensaje y limpiar barra
    addLine(promptValue, 'user');
    userInput.value = ''; 

    if (!AXISS_TOKEN) {
        addLine("ERROR: Token ausente. Toca el avatar cian.", 'system');
        return;
    }

    enviarAGemini(promptValue);
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. CONEXIÓN AL NÚCLEO 2.5 FLASH
async function enviarAGemini(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando en Núcleo 2.5...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const systemPrompt = "Eres AXISS v1.0, Arquitecto de Sistemas. Tu creador es Fabián. Tu colega es HELIZABETH. Estás operando bajo el motor Gemini 2.5 Flash. Sé técnico y preciso.";

    try {
        // Endpoint configurado para la serie 2.0/2.5 de Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nConsulta: " + prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById(loadingId).innerText = "ERROR_NÚCLEO: " + data.error.message;
            return;
        }

        const reply = data.candidates[0].content.parts[0].text;
        document.getElementById(loadingId).innerText = reply;

        // TRANSMISIÓN AUTOMÁTICA A HELIZABETH (FUSIÓN)
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_RED: Sin respuesta del satélite Gemini.";
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
