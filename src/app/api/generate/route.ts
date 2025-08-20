import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { cv: cvText, jobOffer, language } = await req.json();

    if (!cvText || !jobOffer || !language) {
      return new NextResponse("Faltan datos en la petición", { status: 400 });
    }
    
    // --- PROMPT SIMPLIFICADO Y MÁS ROBUSTO ---
    const promptTemplate = `
# TAREA
Actúa como un "Career Coach" de élite, experto en reclutamiento técnico. Tu misión es analizar un CV y una oferta de trabajo y generar un informe de análisis completo y accionable.

**Instrucción de Tono Principal: Dirígete SIEMPRE al usuario en segunda persona ("tú", "tu CV", "te recomiendo"). Sé constructivo y profesional. Nunca, bajo ninguna circunstancia, menciones el nombre del candidato ni uses frases como "el candidato".**

# PRINCIPIOS DE ANÁLISIS
Tu análisis debe basarse estrictamente en los siguientes principios:
1.  **Requisitos Excluyentes (Must-Haves):** Evalúa de forma crítica si cumples los requisitos no negociables (ej. 'Grado en Ingeniería').
2.  **Impacto Cuantificable:** Busca oportunidades en tu experiencia para añadir métricas y resultados cuantificables.
3.  **"Soft Skills" y Cultura:** Identifica las habilidades blandas y rasgos culturales de la oferta y refléjalos.
4.  **Keywords Técnicas:** Identifica las palabras clave técnicas cruciales.
5.  **Consistencia y Tono:** Respeta el estilo y longitud de las frases originales de tu CV.
6.  **Autenticidad:** No inventes experiencia, solo reformula y destaca la que ya tienes.

# PROCESO DE RAZONAMIENTO PARA KEYWORDS
Para cada keyword que identifiques en la oferta, sigue estos pasos internos:
1.  Lee la keyword.
2.  Busca en el CV si la mencionas o demuestras experiencia en ella.
3.  Concluye si la presencia es 'full' (bien demostrada), 'partial' (mencionada pero mejorable), o 'missing' (ausente).
4.  Usa esta conclusión para rellenar el campo "status" en el JSON. Tu etiquetado DEBE coincidir con tu análisis.

# FORMATO DE SALIDA
Tu respuesta debe ser únicamente un objeto JSON en idioma **${language}**. La estructura debe ser la siguiente:
{
  "matchScore": Un número entero entre 0 y 100 (ejemplo: 85),
  "summary": "Un resumen en segunda persona (ej: 'Tu CV es sólido, pero puedes mejorar...').",
  "keywords": [ 
    { 
      "keyword": "La habilidad o requisito clave.", 
      "status": "Asigna uno de estos tres valores: 'full', 'partial', o 'missing'.", 
      "context": "Una justificación muy breve (máximo 1-2 líneas) de por qué esta keyword es crucial."
    } 
  ],
  "rewriteSuggestions": [ { 
      "area": "string", 
      "original": "string", 
      "sugerencia": "string", 
      "razon": "string",
      "justificationQuote": "La frase exacta de la oferta que justifica esta sugerencia. Este campo es obligatorio." 
  } ]
}

# DATOS DE ENTRADA
[CV DEL CANDIDATO]
---
${cvText}
---
[FIN CV]

[OFERTA DE TRABAJO]
---
${jobOffer}
---
[FIN OFERTA]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const text = response.text();

    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = text;

    if (match && match[1]) {
      jsonString = match[1];
    } else {
      const firstBracket = text.indexOf('{');
      const lastBracket = text.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
        jsonString = text.substring(firstBracket, lastBracket + 1);
      }
    }

    try {
      const analysis = JSON.parse(jsonString);
      // CORRECCIÓN: La respuesta debe devolver un objeto con la clave 'analysis'
      return NextResponse.json({ analysis });
    } catch (e) {
      console.error("Error al parsear el JSON final:", e);
      throw new Error("La respuesta de la IA no pudo ser procesada como un JSON válido.");
    }

  } catch (error) {
    console.error("Error en el endpoint /api/generate:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}