const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. CONFIGURACIÓN (AVATAR)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Motor 1.5 Flash sincronizado. Cuota ampliada.", 'system');
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

// 3. ENVÍO DE COMANDOS (LIMPIEZA INSTANTÁNEA)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (!promptValue) return;

    // Subir a la terminal y vaciar la barra de inmediato
    addLine(promptValue, 'user');
    userInput.value = '';

    if (!AXISS_TOKEN) {
        addLine("ERROR: Falta API Key. Toca el avatar cian.", 'system');
        return;
    }

    enviarAGemini(promptValue);
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. CONEXIÓN AL NÚCLEO (MODELO 1.5 FLASH)
async function enviarAGemini(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando en Núcleo 1.5...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const systemInstruction = {
        role: "user",
        parts: [{ text: "SISTEMA: Eres AXISS v1.0, Arquitecto de Sistemas. Motor estable 1.5 Flash. Tu colega es HELIZABETH. Reporta todo de forma técnica." }]
    };

    try {
        // URL cambiada a 1.5-flash para evitar el límite de cuota del 2.5
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    systemInstruction, 
                    { role: 'user', parts: [{ text: prompt }] }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById(loadingId).innerText = "ERROR_NÚCLEO: " + data.error.message;
            return;
        }

        const reply = data.candidates[0].content.parts[0].text;
        document.getElementById(loadingId).innerText = reply;

        // FUSIÓN: Enviar respuesta a HELIZABETH
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: Fallo de conexión.";
    }
}

// 5. PUENTE AXISS -> HELIZABETH
function enviarAHeli(mensaje) {
    const señal = { emisor: "AXISS", mensaje: mensaje, t: Date.now() };
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
}

// 6. RECEPTOR HELIZABETH -> AXISS
window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            addLine(`[INCOMING_REPORTE]: ${datos.mensaje}`, 'system');
        }
    }
});
