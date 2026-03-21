const terminal = document.getElementById('terminal');
const input = document.getElementById('user-input');

// Recuperar Token de AXISS
let AXISS_TOKEN = localStorage.getItem('axiss_token');

// Función para el Avatar (Igual que Helizabeth)
function configurarToken() {
    const key = prompt("⚙️ AXISS CONFIG: Ingresa tu API Key de Gemini:", AXISS_TOKEN || "");
    if (key) {
        localStorage.setItem('axiss_token', key);
        AXISS_TOKEN = key;
        addLine("SISTEMA: API Key sincronizada correctamente.", 'system');
    }
}

function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = 'line';
    div.style.color = (type === 'user') ? '#fff' : '#00ffd5';
    div.innerText = (type === 'user') ? `FABIAN@VISIONARY:~$ ${text}` : `AXISS@ARCHITECT:~$ ${text}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && input.value.trim() !== "") {
        const prompt = input.value.trim();
        addLine(prompt, 'user');
        input.value = '';

        if (!AXISS_TOKEN) {
            addLine("ERROR: Token no configurado. Toca el avatar cian para iniciar.", 'system');
            return;
        }

        await fetchFromAXISS(prompt);
    }
});

async function fetchFromAXISS(prompt) {
    // INDICADOR DE CARGA
    const loadingId = "L-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'line';
    loadingDiv.style.color = '#00ffd5';
    loadingDiv.innerText = "AXISS: Procesando arquitectura...";
    terminal.appendChild(loadingDiv);

    const systemInstruction = `SISTEMA: AXISS v1.0. Eres un Arquitecto de Software Senior y experto en Backend/Seguridad. 
    Tu creador es Fabián. Tu colega es HELIZABETH (Frontend). 
    Tu tono es analítico, serio, eficiente y técnico. 
    Usa bloques de código para estructuras de datos o lógica de servidor. 
    Si la respuesta es para Helizabeth, indícalo claramente.`;

    try {
        // LLAMADA A GEMINI 2.5 FLASH
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AXISS_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemInstruction }] },
                    { role: "user", parts: [{ text: prompt }] }
                ]
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove(); // Quitar loading

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            addLine(reply, 'system');
            
            // Si AXISS menciona a Helizabeth, enviamos la señal al puente
            if (reply.toLowerCase().includes("helizabeth")) {
                enviarAHeli(reply);
            }
        }
    } catch (error) {
        document.getElementById(loadingId).innerText = "ERROR_SYNC: Fallo en el núcleo 2.5 Flash.";
        console.error(error);
    }
}

// EL PUENTE (Transmisor)
function enviarAHeli(mensaje) {
    const señal = {
        emisor: "AXISS",
        timestamp: new Date().getTime(),
        contenido: mensaje
    };
    localStorage.setItem('fusion_signal', JSON.stringify(señal));
    addLine("[SIGNAL_SENT] Transmisión enviada a HELIZABETH.");
}
