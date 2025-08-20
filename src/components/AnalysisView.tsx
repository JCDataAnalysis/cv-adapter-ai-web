'use client';
import { useState } from 'react';

// Definimos los tipos para el objeto de análisis
type Keyword = {
  keyword: string;
  status: 'full' | 'partial' | 'missing'; 
  context: string;
};

type Suggestion = {
  area: string;
  original: string;
  sugerencia: string;
  razon: string;
  justificationQuote: string;
};

type Analysis = {
  matchScore: number;
  summary: string;
  keywords: Keyword[];
  rewriteSuggestions: Suggestion[];
};

export default function AnalysisView({ analysis, onNewAnalysis }: { analysis: Analysis, onNewAnalysis: () => void }) {
  
  const [activePopup, setActivePopup] = useState<number | null>(null);

  // Función para obtener el color del semáforo según el status
  const getStatusColor = (status: 'full' | 'partial' | 'missing') => {
    switch (status) {
      case 'full':
        return 'bg-emerald-500'; // Verde
      case 'partial':
        return 'bg-amber-500'; // Naranja
      case 'missing':
        return 'bg-red-500'; // Rojo
      default:
        return 'bg-slate-300'; // Gris por defecto
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-800">Resultados del Análisis</h2>
            <p className="text-slate-600 mt-2">Usa estas sugerencias para perfeccionar tu CV.</p>
        </div>
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-6.36M20 15a9 9 0 01-14.13 6.36" />
          </svg>
          Nuevo Análisis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-xl font-semibold mb-4">Análisis General</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-indigo-600">{analysis.matchScore}%</div>
              <p className="text-sm text-slate-600">{analysis.summary}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-xl font-semibold mb-4">Keywords Clave</h3>
            <div className="space-y-3">
              {analysis.keywords.map((kw, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full ${getStatusColor(kw.status)}`}></span>
                  <div>
                    <p className="font-semibold">{kw.keyword}</p>
                    <p className="text-xs text-slate-500">{kw.context}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-full">
            <h3 className="text-xl font-semibold mb-4">Sugerencias de Reescritura</h3>
            <div className="space-y-4">
              {analysis.rewriteSuggestions.map((suggestion, index) => (
                 // Quitamos 'overflow-hidden' para que el pop-up no se corte
                 <div key={index} className="bg-white shadow-md rounded-lg border border-slate-200">
                    <div className="p-4">
                        <div className="border-l-4 border-indigo-500 pl-3">
                            <h3 className="text-base font-bold text-slate-800">{suggestion.area}</h3>
                        </div>
                        <div className="mt-3 mb-3">
                            <p className="font-semibold text-slate-600 mb-1 text-xs">Original:</p>
                            <p className="text-slate-500 line-through bg-slate-50 p-2 rounded-md text-xs">{suggestion.original}</p>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-emerald-700 text-xs">Sugerencia Mejorada:</p>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(suggestion.sugerencia)}
                                    className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full hover:bg-emerald-200 transition-colors font-semibold"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copiar
                                </button>
                            </div>
                            <p className="text-slate-800 bg-emerald-50 p-2 rounded-md text-sm">{suggestion.sugerencia}</p>
                        </div>
                        <div className="bg-slate-100 p-2 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-slate-800 text-xs">¿Por qué este cambio?</p>
                                {/* Contenedor relativo para el pop-up */}
                                <div className="relative">
                                    <button onClick={() => setActivePopup(activePopup === index ? null : index)} className="text-slate-400 hover:text-indigo-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                    </button>
                                    {/* El Pop-up */}
                                    {activePopup === index && (
                                        <div className="absolute z-10 bottom-full right-0 mb-2 w-64 bg-white p-3 rounded-lg shadow-xl border border-slate-200">
                                            <p className="text-xs font-semibold text-slate-600">Texto de la oferta que justifica este cambio:</p>
                                            <p className="mt-1 text-xs text-slate-500 italic">"{suggestion.justificationQuote}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-slate-600 text-xs mt-1">{suggestion.razon}</p>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}