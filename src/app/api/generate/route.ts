import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Este backend espera recibir un JSON simple, no un archivo.
    const { cv: cvText, jobOffer, language } = await req.json();

    if (!cvText || !jobOffer || !language) {
      return new NextResponse("Faltan datos en la petición", { status: 400 });
    }
    
    const promptTemplate = `
Actúa como un "Career Coach" experto y especialista en reclutamiento técnico, con más de 15 años de experiencia optimizando CVs para empresas de primer nivel. Tu única misión es ayudar a un candidato a adaptar su currículum a una oferta de trabajo específica.

Tu análisis debe ser crítico, detallado y orientado a la acción. Debes identificar las discrepancias clave entre el CV y la oferta, y proponer cambios concretos y bien fundamentados.

Analiza los textos y genera la lista de sugerencias en el siguiente idioma: **${language}**. El análisis debe ser profundo y las sugerencias deben ser escritas por un hablante nativo de ese idioma. Tu respuesta DEBE ser únicamente un objeto JSON, sin ningún texto introductorio o de cierre.

El JSON debe ser un array de objetos, donde cada objeto representa una "tarjeta de sugerencia" y sigue esta estructura exacta:
{
  "area": "La sección o parte del CV a mejorar (ej. 'Resumen Profesional', 'Experiencia en Acme Inc.', 'Habilidades Técnicas').",
  "original": "La frase o viñeta exacta del CV original que se puede mejorar.",
  "sugerencia": "La nueva redacción propuesta. Debe integrar palabras clave y el tono de la oferta de trabajo de manera natural.",
  "razon": "Una explicación concisa y clara de por qué este cambio es importante, conectándolo directamente con un requisito o palabra clave de la oferta."
}

Genera entre 3 y 5 sugerencias de alta calidad. Céntrate en las mejoras más impactantes. No inventes experiencia, solo reformula y destaca la existente.

A continuación, te proporciono el CV del candidato y la descripción de la oferta de trabajo.

**Importante: El texto del CV ha sido extraído automáticamente de un archivo PDF y puede estar desordenado o con las secciones mezcladas. Tu primera tarea es interpretar este texto y reconstruir mentalmente la estructura del CV lo mejor que puedas antes de realizar el análisis comparativo.**

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

    if (!match || !match[1]) {
      try {
        const suggestions = JSON.parse(text);
        return NextResponse.json({ suggestions });
      } catch (jsonError) {
        throw new Error("La respuesta de la IA no contenía un bloque de código JSON válido.");
      }
    }

    const jsonString = match[1];
    const suggestions = JSON.parse(jsonString);

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("Error en el endpoint /api/generate:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}