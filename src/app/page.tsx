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

      <div className="w-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-center py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Adapta tu CV al instante con IA
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
            Sube tu CV, pega la oferta de trabajo y deja que la inteligencia artificial te dé las claves para destacar y conseguir esa entrevista.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Análisis Inteligente</span>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Sugerencias Personalizadas</span>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Resultados Inmediatos</span>
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