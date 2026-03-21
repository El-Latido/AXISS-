const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. CONFIGURACIÓN (AVATAR)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Sincronización con Núcleo 2.5 Flash exitosa.", 'system');
    }
}

// 2. RENDERIZADO
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. ENVÍO (LIMPIEZA DE BARRA IGUAL A ELIZABETH)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (!promptValue) return;

    addLine(promptValue, 'user');
    userInput.value = ''; // Limpieza inmediata

    if (!AXISS_TOKEN) {
        addLine("ERROR: Token ausente. Toca el avatar cian.", 'system');
        return;
    }

    enviarAGemini(promptValue);
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. CONEXIÓN AL NÚCLEO (MÉTODO ELIZABETH v10.7)
async function enviarAGemini(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando arquitectura...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Estructura de System Instruction idéntica a la de Elizabeth
    const systemInstruction = {
        role: "user",
        parts: [{ text: "SISTEMA: Eres AXISS v1.0, el Arquitecto de Sistemas de élite. Tu colega es HELIZABETH. Responde de forma técnica y profesional a Fabián." }]
    };

    try {
        // Usamos la URL exacta de Gemini 2.5 Flash que usa Elizabeth
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AXISS_TOKEN}`, {
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
            document.getElementById(loadingId).innerText = "ERROR_API: " + data.error.message;
            return;
        }

        const reply = data.candidates[0].content.parts[0].text;
        
        // Mostrar respuesta en AXISS
        document.getElementById(loadingId).innerText = reply;

        // --- PROTOCOLO DE FUSIÓN ---
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: El núcleo no responde.";
        console.error(err);
    }
}

// 5. PUENTE AXISS -> ELIZABETH
function enviarAHeli(mensaje) {
    const señal = {
        emisor: "AXISS",
        mensaje: mensaje,
        t: Date.now()
    };
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
}

// 6. PUENTE ELIZABETH -> AXISS
window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            addLine(`[REPORT_IN]: ${datos.mensaje}`, 'system');
        }
    }
});
