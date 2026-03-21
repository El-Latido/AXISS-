// AXISS v1.0 - CORE INTELLIGENCE
const terminal = document.getElementById('terminal');
const input = document.getElementById('user-input');

// CONFIGURACIÓN: Aquí pondrás tu API KEY (Igual que con Helizabeth)
let AXISS_TOKEN = localStorage.getItem('axiss_token');

// Función para imprimir en la terminal con estilo
function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = 'line';
    if (type === 'user') {
        div.style.color = '#fff';
        div.innerText = `FABIAN@VISIONARY:~$ ${text}`;
    } else {
        div.style.color = '#00ffd5';
        div.innerText = `AXISS@ARCHITECT:~$ ${text}`;
    }
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

// Escuchador de comandos
input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && input.value.trim() !== "") {
        const prompt = input.value.trim();
        addLine(prompt, 'user');
        input.value = '';
        
        if (!AXISS_TOKEN) {
            addLine("ERROR: AXISS_TOKEN no detectado. Escribe 'SET_TOKEN [tu_key]' para inicializar.");
            return;
        }

        if (prompt.startsWith("SET_TOKEN ")) {
            const key = prompt.split(" ")[1];
            localStorage.setItem('axiss_token', key);
            AXISS_TOKEN = key;
            addLine("SISTEMA: Token actualizado y encriptado en local.");
            return;
        }

        await fetchFromGemini(prompt);
    }
});

async function fetchFromGemini(prompt) {
    addLine("PROCESANDO_ARQUITECTURA...", 'system');
    
    const systemInstruction = `SISTEMA: AXISS v1.0. Eres un Arquitecto de Software Senior y experto en Backend/Seguridad. 
    Tu creador es Fabián. Tu colega es HELIZABETH (Frontend). 
    Tu tono es analítico, serio, eficiente y técnico. 
    Te enfocas en: Bases de datos, APIs, Seguridad, Estructura de archivos y Optimización.
    Si Fabián te pregunta algo de interfaz, menciónale que Helizabeth debería encargarse del diseño final.`;

    try {
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
        const reply = data.candidates[0].content.parts[0].text;
        addLine(reply, 'system');
    } catch (error) {
        addLine("ERROR_CRÍTICO: Fallo en la sincronización con el núcleo Gemini.");
    }
                    }
