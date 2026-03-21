const terminal = document.getElementById('terminal');
const input = document.getElementById('user-input');

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const val = input.value;
        addLine(val, 'user');
        input.value = '';
        processCommand(val);
    }
});

function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = 'line';
    if (type === 'user') div.style.color = '#fff';
    div.innerText = text;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

function processCommand(cmd) {
    // Aquí conectaremos a AXISS con su API de Gemini pronto
    setTimeout(() => {
        addLine("AXISS: Comando recibido. Analizando arquitectura de red...");
    }, 500);
}
