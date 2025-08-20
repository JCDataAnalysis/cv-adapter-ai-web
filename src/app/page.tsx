'use client';
import dynamic from 'next/dynamic';

const CvForm = dynamic(() => import('@/components/CvForm'), { 
  ssr: false,
  loading: () => <p className="text-center text-lg mt-12">Cargando optimizador...</p> 
});

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header with CVAdapter branding */}
      <header className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 lg:ml-0">
            <img src="/logo.svg" alt="CVAdapter Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-slate-800">CVAdapter</h1>
          </div>
        </div>
      </header>

      <div className="w-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-center py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            Adapta tu CV al instante con IA
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto mb-6">
            Sube tu CV, pega la oferta de trabajo y deja que la inteligencia artificial te dé las claves para destacar y conseguir esa entrevista.
          </p>
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/></svg>
              </div>
              <span className="text-xs font-medium text-white">Análisis Inteligente</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span className="text-xs font-medium text-white">Sugerencias Personalizadas</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span className="text-xs font-medium text-white">Resultados Inmediatos</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full p-4 sm:p-12">
        <CvForm />
      </div>
    </main>
  );
}