'use client';
import { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import AnalysisView from './AnalysisView';

// @ts-ignore
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

type Suggestion = {
  area: string;
  original: string;
  sugerencia: string;
  razon: string;
  justificationQuote: string; // CORRECCIÓN: Hacemos la cita obligatoria para que coincida con AnalysisView
};

// CORRECCIÓN: Sincronizamos el tipo Keyword con el que usa AnalysisView
type Keyword = {
  keyword: string;
  status: 'full' | 'partial' | 'missing'; 
  context: string;
};

type Analysis = {
  matchScore: number;
  summary: string;
  keywords: Keyword[];
  rewriteSuggestions: Suggestion[];
};

export default function CvForm() {
  const [cvText, setCvText] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [language, setLanguage] = useState('Español');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    setCvText('');
    setError(null);
    setPdfData(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) throw new Error("No se pudo leer el archivo");
        
        setPdfData(arrayBuffer);

        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setCvText(fullText);
      } catch (err) {
        console.error("Error al leer el PDF:", err);
        setError("No se pudo leer el archivo PDF. Asegúrate de que no esté dañado o protegido.");
        setFileName('');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cvText) {
      setError("Por favor, sube un PDF o carga el ejemplo antes de generar sugerencias.");
      return;
    }
    setLoading(true);
    setAnalysisResult(null);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv: cvText, jobOffer, language }),
      });
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}. Inténtalo de nuevo más tarde.`);
      }
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error("Error al llamar a la API:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setFileName('CV de Ejemplo (Cargado)');
    setError(null);
    setPdfData(null); 
    setCvText(`
          Ana García
      Profesional orientada a producto con experiencia en la optimización de procesos y el desarrollo de productos digitales en el sector e-commerce. Buscando hacer la transición al mundo SaaS B2B.

      EXPERIENCIA LABORAL

      ShopifyPlus Store - Product Owner (Enero 2023 - Presente)
      - Responsable de la hoja de ruta para la nueva sección de personalización de productos.
      - Colaboré con el equipo de desarrollo para definir historias de usuario y criterios de aceptación.
      - Aumenté la conversión de la página de producto en un 10% a través de tests A/B.

      Retail Online Co. - Business Analyst (Junio 2020 - Diciembre 2022)
      - Analicé los datos de ventas para identificar tendencias y oportunidades de mejora.
      - Creé dashboards en Tableau para el seguimiento de KPIs.
      - Documenté los requisitos para nuevas funcionalidades de la plataforma.

      HABILIDADES
      - Gestión de Proyectos (Jira, Notion)
      - Metodologías Ágiles
      - Análisis de Datos (Tableau, SQL básico)
      - E-commerce y plataformas B2C
    `);
    setJobOffer(`
       🚀 Product Manager Senior (SaaS B2B) - Innovatech Dynamics

      Sobre nosotros:
      En Innovatech Dynamics, estamos construyendo el futuro del software de análisis de datos para empresas. Somos un equipo apasionado, ágil y en pleno crecimiento, y buscamos un Product Manager que nos ayude a llevar nuestros productos al siguiente nivel.

      🎯 Tu Misión:
      Serás el dueño de nuestro producto estrella, desde la concepción de la idea hasta el lanzamiento y la iteración. Traducirás las necesidades de nuestros clientes en una hoja de ruta clara y trabajarás mano a mano con nuestros equipos de ingeniería y diseño para crear soluciones que enamoren.

      📋 Responsabilidades Clave:
      - Definir y comunicar la visión, estrategia y hoja de ruta del producto.
      - Realizar investigaciones de mercado y análisis de la competencia para identificar oportunidades.
      - Trabajar en un entorno ágil (Scrum), gestionando el backlog, escribiendo historias de usuario y priorizando funcionalidades.
      - Analizar métricas de producto (uso, retención, conversión) para tomar decisiones basadas en datos con herramientas como Mixpanel y SQL.
      - Colaborar estrechamente con ingeniería, UX/UI, marketing y ventas para asegurar un lanzamiento exitoso.

      ✅ Lo que buscamos (Requisitos):
      - 3+ años de experiencia como Product Manager, idealmente en un entorno de producto SaaS B2B.
      - Experiencia demostrable liderando productos a lo largo de todo su ciclo de vida.
      - Fuerte conocimiento de metodologías Ágiles (Scrum, Kanban).
      - Capacidad analítica sólida y experiencia tomando decisiones basadas en datos.
      - Excelentes habilidades de comunicación y capacidad para trabajar con equipos multifuncionales.
    `);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setFileName('');
    setCvText('');
    setJobOffer('');
    setError(null);
    setPdfData(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {!analysisResult && (
        <>
          <div className="text-center mb-10">
            <button 
              type="button" 
              onClick={handleDemo} 
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm"
            >
              ¿No tienes un CV a mano? <strong>Ver un Ejemplo</strong>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="space-y-10">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Elige el Idioma</h2>
                  <div className="relative w-full md:w-2/3">
                    <select 
                      id="language-select" 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none w-full block pl-4 pr-10 py-3 text-base border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      <option>Español</option>
                      <option>Inglés</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Sube tu CV en PDF</h2>
                  <input type="file" accept=".pdf" onChange={handleFileChange}
                         className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"/>
                  {fileName && <span className="text-sm text-slate-500 mt-2">Archivo: {fileName} {loading && !analysisResult ? '(Procesando...)' : '(Listo)'}</span>}
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Pega la Oferta de Trabajo</h2>
                <textarea id="job-offer-input" value={jobOffer} onChange={(e) => setJobOffer(e.target.value)}
                          placeholder="Pega aquí la descripción completa..." required
                          className="w-full flex-grow h-64 p-4 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"/>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <button type="submit" disabled={loading}
                className="flex items-center justify-center w-64 h-16 px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 transition-all transform hover:scale-105 whitespace-nowrap"
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '4. Generar Análisis'}
              </button>
            </div>
          </form>
        </>
      )}

      {error && (
        <div className="mt-12 max-w-2xl mx-auto animate-fade-in">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Ha ocurrido un error</p>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {analysisResult && (
        <AnalysisView 
          analysis={analysisResult} 
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  );
}