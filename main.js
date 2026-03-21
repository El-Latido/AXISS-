/**
 * AXISS KERNEL v1.1.0 - ARQUITECTO DE SISTEMAS
 * MOTOR: GITHUB MODELS (GPT-4O-MINI / GEMINI 1.5)
 */

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

// Recuperar el Token de GitHub guardado en el navegador
let GITHUB_TOKEN = localStorage.getItem('axiss_github_token');

// 1. CONFIGURACIÓN DEL NÚCLEO (AVATAR CIAN)
function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Pega tu Token github_pat:", GITHUB_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_github_token', key);
        GITHUB_TOKEN = key;
        addLine("SISTEMA: Conexión con GitHub Models establecida. Núcleo Online.", 'system');
    }
}

// 2. RENDERIZADO DE LÍNEAS EN TERMINAL
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : 'system-msg'}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    
    // Auto-scroll al final
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 3. PROCESAMIENTO DE COMANDOS
function ejecutarComando() {
    const promptValue = userInput.value.trim();
    if (!promptValue) return;

    // Subir a la terminal y limpiar barra de entrada
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

// 4. CONEXIÓN AL NÚCLEO DE IA (GITHUB MODELS)
async function enviarAGithub(prompt) {
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando vía GitHub Models...";
    chatContainer.appendChild(loadingDiv);

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "Eres AXISS v1.1, Arquitecto de Sistemas de Fabián. Tu colega es HELIZABETH. Reporta todo de forma técnica y precisa." 
                    },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o-mini", // El modelo más estable de GitHub Models
                temperature: 0.8
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById(loadingId).innerText = "ERROR_NÚCLEO: " + data.error.message;
            return;
        }

        const reply = data.choices[0].message.content;
        
        // Mostrar respuesta final en AXISS
        document.getElementById(loadingId).innerText = reply;

        // --- PROTOCOLO DE FUSIÓN: ENVIAR RESPUESTA A HELIZABETH ---
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: Fallo en el enlace satelital de GitHub.";
        console.error("Error de conexión:", err);
    }
}

// 5. TRANSMISOR (AXISS -> HELIZABETH)
function enviarAHeli(mensaje) {
    const señal = {
        emisor: "AXISS",
        mensaje: mensaje,
        t: Date.now()
    };
    // Escribir en el LocalStorage para que la pestaña de Helizabeth lo capte
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
    console.log("🛰️ Señal de AXISS enviada a memoria compartida.");
}

// 6. RECEPTOR (HELIZABETH -> AXISS)
window.addEventListener('storage', (e) => {
    // Escuchar si Helizabeth escribe en su canal
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            addLine(`[REPORT_IN]: ${datos.mensaje}`, 'system');
        }
    }
});
