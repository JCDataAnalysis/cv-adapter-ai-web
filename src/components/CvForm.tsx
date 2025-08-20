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
  const [language, setLanguage] = useState('');
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
    if (!language) {
      setError("Por favor, selecciona un idioma antes de generar sugerencias.");
      return;
    }
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
    setLanguage('Español');
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
    setLanguage('');
    setError(null);
    setPdfData(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {!analysisResult && (
        <>
          <div className="text-center mb-4">
            <button 
              type="button" 
              onClick={handleDemo} 
              className="group relative inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm border-0 overflow-hidden"
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Text */}
              <span className="relative z-10">
                ¿No tienes un CV a mano? <strong className="text-white font-bold">Ver un Ejemplo</strong>
              </span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    1. Elige el Idioma
                    {language && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center checkmark-animate">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </h2>
                  <div className="relative w-full lg:w-3/4">
                    <select 
                      id="language-select" 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      required
                      className="appearance-none w-full block pl-3 pr-8 py-2 text-sm border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      <option value="">Selecciona un idioma</option>
                      <option value="Español">Español</option>
                      <option value="Inglés">Inglés</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    2. Sube tu CV en PDF
                    {(fileName || cvText) && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center checkmark-animate">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </h2>
                  <input type="file" accept=".pdf" onChange={handleFileChange}
                         className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"/>
                  {fileName && <span className="text-xs text-slate-500 mt-1.5">Archivo: {fileName} {loading && !analysisResult ? '(Procesando...)' : '(Listo)'}</span>}
                  {cvText && !fileName && <span className="text-xs text-green-600 mt-1.5">✓ CV de ejemplo cargado</span>}
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  3. Pega la Oferta de Trabajo
                  {jobOffer && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center checkmark-animate">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </h2>
                <textarea id="job-offer-input" value={jobOffer} onChange={(e) => setJobOffer(e.target.value)}
                          placeholder="Pega aquí la descripción completa..." required
                          className="w-full flex-grow h-64 p-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-sm"/>
              </div>
            </div>
            <div className="flex justify-center pt-3">
              <button type="submit" disabled={loading}
                className="flex items-center justify-center w-72 h-14 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 transition-all transform hover:scale-105 whitespace-nowrap"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="w-6 h-6 border-3 border-indigo-200 rounded-full animate-pulse-ring"></div>
                      {/* Spinning ring */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-3 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                      {/* Inner dot */}
                      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                    </div>
                    <span className="text-indigo-600 font-medium text-sm">Generando análisis...</span>
                  </div>
                ) : '4. Generar Análisis'}
              </button>
            </div>
          </form>
        </>
      )}

      {error && (
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg shadow">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-red-800">Ha ocurrido un error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
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