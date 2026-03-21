const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

// Recuperar Token de GitHub guardado
let GITHUB_TOKEN = localStorage.getItem('axiss_github_token');

// 1. CONFIGURACIÓN DEL TOKEN (AVATAR CIAN)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS (GitHub): Ingresa tu Token github_pat:", GITHUB_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_github_token', key);
        GITHUB_TOKEN = key;
        addLine("SISTEMA: Token de GitHub sincronizado. Núcleo listo.", 'system');
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

// 3. LÓGICA DE ENVÍO (LIMPIEZA DE BARRA)
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (!promptValue) return;

    // Subir a la terminal y vaciar la barra al instante
    addLine(promptValue, 'user');
    userInput.value = ''; 

    if (!GITHUB_TOKEN) {
        addLine("ERROR: Token de GitHub no detectado. Toca el avatar cian.", 'system');
        return;
    }

    enviarAGithub(promptValue);
}

// Escuchar tecla Enter
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

// 4. CONEXIÓN AL NÚCLEO DE GITHUB MODELS (GEMINI 1.5 FLASH)
async function enviarAGithub(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando vía GitHub Models...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Eres AXISS v1.0, Arquitecto de Sistemas de Fabián. Motor: Gemini 1.5 Flash vía GitHub. Sé técnico y preciso." },
                    { role: "user", content: prompt }
                ],
                model: "google-gemini-1.5-flash",
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById(loadingId).innerText = "ERROR_GITHUB: " + data.error.message;
            return;
        }

        const reply = data.choices[0].message.content;
        
        // Mostrar respuesta final en la terminal de AXISS
        document.getElementById(loadingId).innerText = reply;

        // --- PROTOCOLO DE FUSIÓN: ENVIAR A HELIZABETH ---
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: Fallo en el puente de GitHub.";
        console.error(err);
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
