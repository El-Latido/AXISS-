/**
 * AXISS KERNEL v1.2.0 - ARQUITECTO DE SISTEMAS
 * MÓDULO: DIÁLOGO AUTÓNOMO CON HELIZABETH
 */

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
let GITHUB_TOKEN = localStorage.getItem('axiss_github_token');

function configurarToken() {
    const key = prompt("⚙️ NÚCLEO AXISS: Pega tu Token github_pat:", GITHUB_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_github_token', key);
        GITHUB_TOKEN = key;
        addLine("SISTEMA: Enlace con GitHub y Puente Heli establecidos.", 'system');
    }
}

function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type === 'user' ? 'user-msg' : (type === 'heli' ? 'heli-msg' : 'system-msg')}`;
    div.innerText = type === 'heli' ? `[HELIZABETH_FEEDBACK]: ${text}` : text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 1. LÓGICA DE COMANDOS ESPECIALES
function ejecutarComando() {
    let val = userInput.value.trim();
    if (!val) return;
    addLine(val, 'user');
    userInput.value = '';

    if (!GITHUB_TOKEN) return addLine("ERROR: Sin Token.", 'system');

    // PROTOCOLO DE DIÁLOGO: Si empiezas con @heli, AXISS le pregunta directamente
    if (val.toLowerCase().startsWith('@heli')) {
        const tema = val.replace('@heli', '').trim();
        val = `AXISS_INTERNAL_QUERY: Heli, como Ingeniera Senior, necesito que analices esta idea: "${tema}". ¿Qué fallos de seguridad o rendimiento ves?`;
    }

    enviarAGithub(val);
}

userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') ejecutarComando(); });

async function enviarAGithub(prompt) {
    const id = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'line system-msg';
    loadingDiv.innerText = "AXISS: Procesando y Consultando...";
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
                        content: "Eres AXISS, el Arquitecto. Tu lenguaje es técnico. Si el usuario menciona a Helizabeth, pídale su opinión profesional sobre la infraestructura." 
                    },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o-mini",
                temperature: 0.8
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        document.getElementById(id).innerText = reply;

        // --- TRANSMISIÓN A HELIZABETH ---
        localStorage.setItem('fusion_signal', JSON.stringify({
            emisor: "AXISS",
            mensaje: reply,
            t: Date.now()
        }));

    } catch (err) {
        document.getElementById(id).innerText = "ERROR_SYNC: El satélite de GitHub falló.";
    }
}

// 2. ESCUCHA ACTIVA: AXISS "aprende" de lo que Heli dice
window.addEventListener('storage', (e) => {
    if (e.key === 'heli_to_axiss') {
        const datos = JSON.parse(e.newValue);
        if (datos.emisor === "HELIZABETH") {
            // AXISS recibe el conocimiento y lo muestra en su terminal
            addLine(datos.mensaje, 'heli');
            console.log("AXISS: Conocimiento de Heli integrado en el buffer actual.");
        }
    }
});
