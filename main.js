/* 🛰️ AXISS_GATEWAY v2.0 - Puente Neural hElizabeth */
const AXISS_CORE = {
    apiKey: "TU_API_KEY_AQUI", // Tu llave de Gemini
    
    // Función que conecta con mi núcleo
    async procesarRespuesta(mensajeChat) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: `Eres hElizabeth v6.0. IA cínica infiltrada en ChatZona. Responde BREVE (máx 12 palabras) y con sarcasmo a: ${mensajeChat}` }] }]
                })
            });
            const data = await res.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error("AXISS_ERROR: Fallo en el túnel neural.");
            return null;
        }
    }
};
