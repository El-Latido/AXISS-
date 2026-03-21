const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

// Recuperar el nuevo token de GitHub
let GITHUB_TOKEN = localStorage.getItem('axiss_github_token');

function configurarToken() {
    const key = prompt("⚙️ CONFIGURACIÓN AXISS: Pega tu nuevo Token de GitHub:", GITHUB_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_github_token', key);
        GITHUB_TOKEN = key;
        addLine("SISTEMA: Nuevo núcleo de GitHub vinculado exitosamente.", 'system');
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
    const promptValue = userInput.value.trim();
    if (!promptValue) return;

    addLine(promptValue, 'user');
    userInput.value = ''; 

    if (!GITHUB_TOKEN) {
        addLine("ERROR: Token de GitHub no detectado. Toca el avatar.", 'system');
        return;
    }

    enviarAGithub(promptValue);
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarComando();
});

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
                    { role: "system", content: "Eres AXISS v1.1, Arquitecto de Sistemas. Motor: GitHub Models. Responde de forma técnica y breve." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o-mini", // Este modelo es el más estable para tokens nuevos en GitHub
                temperature: 0.8
            })
        });

        const data = await response.json();

        if (data.error) {
            // Si el token aún no tiene permiso para un modelo específico, esto nos dirá cuál es el error
            document.getElementById(loadingId).innerText = "ERROR_NÚCLEO: " + data.error.message;
            return;
        }

        const reply = data.choices[0].message.content;
        document.getElementById(loadingId).innerText = reply;

        // FUSIÓN: Enviar a Helizabeth
        enviarAHeli(reply);

    } catch (err) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: El satélite de GitHub no responde.";
    }
}

function enviarAHeli(mensaje) {
    localStorage.setItem('fusion_signal', JSON.stringify({
        emisor: "AXISS",
        mensaje: mensaje,
        t: Date.now()
    }));
}

window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            addLine(`[REPORT_IN]: ${datos.mensaje}`, 'system');
        }
    }
});
