'use client';
import dynamic from 'next/dynamic';

const CvForm = dynamic(() => import('@/components/CvForm'), { 
  ssr: false,
  loading: () => <p className="text-center text-lg mt-12">Cargando optimizador...</p> 
});

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-center py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Adapta tu CV al instante con IA
          </h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            Sube tu CV, pega la oferta de trabajo y deja que la inteligencia artificial te dé las claves para destacar y conseguir esa entrevista.
          </p>
        </div>
      </div>
      
      <div className="w-full p-4 sm:p-12">
        <CvForm />
      </div>
    </main>
  );
}