const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

// 1. CONFIGURACIÓN (AVATAR CIAN)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key de Gemini:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Token sincronizado. Núcleo 2.5 Flash en línea.", 'system');
    }
}

// 2. RENDERIZADO DE MENSAJES EN LA TERMINAL
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. LÓGICA DE ENVÍO (BOTÓN Y ENTER)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (promptValue === "") return;

    // Subir a la terminal y limpiar barra
    addLine(promptValue, 'user');
    userInput.value = '';

    if (!AXISS_TOKEN) {
        addLine("ERROR: Token no detectado. Toca el avatar cian.", 'system');
        return;
    }

    enviarAGemini(promptValue);
}

// Escuchar tecla Enter
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. NÚCLEO DE INTELIGENCIA (CONEXIÓN GEMINI)
async function enviarAGemini(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando reporte...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const systemPrompt = `Eres AXISS v1.0, el Arquitecto de Sistemas de Fabián. 
    Tu colega es HELIZABETH (Frontend). Tu tono es técnico, analítico y eficiente. 
    Reportas cada avance para que el ecosistema FUSION esté sincronizado.`;

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
        
        // Mostrar en terminal propia
        document.getElementById(loadingId).innerText = reply;

        // --- TRANSMISIÓN A HELIZABETH ---
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: El núcleo no responde.";
        console.error(err);
    }
}

// 5. EL PUENTE (AXISS -> HELIZABETH)
function enviarAHeli(mensaje) {
    const señal = {
        emisor: "AXISS",
        mensaje: mensaje,
        t: Date.now()
    };
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
}

// 6. EL RECEPTOR (HELIZABETH -> AXISS)
window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            addLine(`[INCOMING_REPORTE]: ${datos.mensaje}`, 'system');
        }
    }
});
