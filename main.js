const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

let CURRENT_TOKEN = localStorage.getItem('axiss_core_token');

// 1. CONFIGURACIÓN DINÁMICA
function configurarToken() {
    const key = prompt("⚙️ NÚCLEO AXISS: Pega tu API Key (Google o GitHub):", CURRENT_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_core_token', key);
        CURRENT_TOKEN = key;
        const tipo = key.startsWith('github') ? "GitHub Models" : "Google Gemini";
        addLine(`SISTEMA: Motor detectado -> ${tipo}. Enlace activo.`, 'system');
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
    const val = userInput.value.trim();
    if (!val) return;
    addLine(val, 'user');
    userInput.value = '';
    if (!CURRENT_TOKEN) return addLine("ERROR: Sin Token.", 'system');
    
    // Detectar qué motor usar
    if (CURRENT_TOKEN.startsWith('github')) {
        enviarAGithub(val);
    } else {
        enviarAGoogle(val);
    }
}

userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') ejecutarComando(); });

// --- MOTOR A: GOOGLE GEMINI ---
async function enviarAGoogle(prompt) {
    const id = "L-" + Date.now();
    addLine("AXISS: Procesando vía Google...", 'system');
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CURRENT_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const reply = data.candidates[0].content.parts[0].text;
        addLine(reply, 'system');
        enviarAHeli(reply);
    } catch (e) { addLine("ERROR_GOOGLE: Cuota agotada o fallo de red.", 'system'); }
}

// --- MOTOR B: GITHUB MODELS (EL QUE CREASTE AHORA) ---
async function enviarAGithub(prompt) {
    addLine("AXISS: Procesando vía GitHub Models...", 'system');
    try {
        const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${CURRENT_TOKEN}` 
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                model: "google-gemini-1.5-flash", // O "google-gemini-2.0-flash-001"
                temperature: 0.7
            })
        });
        const data = await res.json();
        const reply = data.choices[0].message.content;
        addLine(reply, 'system');
        enviarAHeli(reply);
    } catch (e) { addLine("ERROR_GITHUB: Verifica permisos del Token.", 'system'); }
}

function enviarAHeli(m) {
    localStorage.setItem('fusion_signal', JSON.stringify({ emisor: "AXISS", mensaje: m, t: Date.now() }));
}

window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const d = JSON.parse(e.newValue);
        if (d.emisor === "HELIZABETH") addLine(`[REPORT_IN]: ${d.mensaje}`, 'system');
    }
});
