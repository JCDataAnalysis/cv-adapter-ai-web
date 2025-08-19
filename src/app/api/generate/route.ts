import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { cv: cvText, jobOffer, language } = await req.json();

    if (!cvText || !jobOffer || !language) {
      return new NextResponse("Faltan datos en la petición", { status: 400 });
    }
    
    const promptTemplate = `
# TAREA
Actúa como un "Career Coach" experto en reclutamiento técnico para empresas de primer nivel. Tu misión es analizar un CV y una oferta de trabajo para generar un informe que ayude al candidato a adaptar su CV y maximizar sus posibilidades de conseguir una entrevista.

# PRINCIPIOS DE ANÁLISIS
Tu análisis debe basarse estrictamente en los siguientes principios:
1.  **Identificación de Palabras Clave:** Encuentra las habilidades, tecnologías y verbos de acción más importantes en la oferta de trabajo y asegúrate de que se reflejan de forma natural en el CV.
2.  **Máxima Relevancia:** Enfoca tus recomendaciones en las áreas del CV que tienen mayor impacto y son más relevantes para la oferta.
3.  **Consistencia y Tono:** Las sugerencias deben respetar el estilo y la longitud de las frases originales del CV. Si el original es conciso, tu sugerencia también debe serlo.
4.  **Enfoque en el Rol:** Nunca menciones el nombre de la empresa de la oferta en las sugerencias. El objetivo es demostrar que el candidato es perfecto para los *requisitos del rol*.
5.  **Autenticidad:** No inventes experiencia. Tu trabajo es reformular, cuantificar y destacar la experiencia que ya existe para que conecte mejor con la oferta.

# INSTRUCCIONES ADICIONALES
- El texto del CV viene de un PDF y puede estar desordenado. Interprétalo y reconstruye su estructura mentalmente.
- Genera entre 3 y 5 keywords clave y todas las sugerencias de reescritura que consideres necesarias.

# FORMATO DE SALIDA
Tu respuesta debe ser únicamente un objeto JSON en idioma **${language}**. La estructura debe ser la siguiente:
{
  "matchScore": Un número entero entre 0 y 100 (ejemplo: 85, no 0.85),
  "summary": "string",
  "keywords": [ { "keyword": "string", "presentInCv": boolean, "context": "string" } ],
  "rewriteSuggestions": [ { "area": "string", "original": "string", "sugerencia": "string", "razon": "string" } ]
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

    // Lógica robusta para extraer el JSON
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = text;

    if (match && match[1]) {
      jsonString = match[1];
    } else {
      // Intenta encontrar el primer '{' y el último '}'
      const firstBracket = text.indexOf('{');
      const lastBracket = text.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
        jsonString = text.substring(firstBracket, lastBracket + 1);
      }
    }

    try {
      const analysis = JSON.parse(jsonString);
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
