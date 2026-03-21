const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let AXISS_TOKEN = localStorage.getItem('axiss_token');

function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Ingresa tu API Key de Gemini:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: Sincronización de API Key exitosa.", 'system');
    }
}

function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function ejecutarComando() {
    const prompt = userInput.value.trim();
    if (prompt !== "") {
        procesarPrompt(prompt);
    }
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

async function procesarPrompt(prompt) {
    addLine(prompt, 'user');
    userInput.value = '';

    if (!AXISS_TOKEN) {
        addLine("ERROR: Acceso denegado. Configura el Token pulsando el avatar.", 'system');
        return;
    }

    await fetchFromGemini(prompt);
}

async function fetchFromGemini(prompt) {
    const loadingMsg = "Analizando arquitectura...";
    addLine(loadingMsg, 'system');
    const lines = chatContainer.getElementsByClassName('system-msg');
    const lastLine = lines[lines.length - 1];

    const systemInstruction = `Eres AXISS v1.0, el Arquitecto de Sistemas de Fabián. 
    Tu especialidad es Backend, Seguridad e Infraestructura. 
    Tu colega es HELIZABETH (Frontend). Habla de forma técnica, analítica y precisa.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\nConsulta: " + prompt }] }]
            })
        });

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        lastLine.innerText = reply;

        // PUENTE FUSION: Si menciona a Helizabeth, envía señal
        if (reply.toLowerCase().includes("helizabeth")) {
            localStorage.setItem('fusion_signal', JSON.stringify({
                emisor: "AXISS",
                contenido: reply,
                t: Date.now()
            }));
            addLine("[SIGNAL_SENT] Transmitiendo reporte a HELIZABETH...", 'system');
        }
    } catch (err) {
        lastLine.innerText = "ERROR_CRÍTICO: Fallo en la conexión con el núcleo.";
    }
}
