'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function LandingCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Define handleNavigation function here, before any JSX
  const handleNavigation = () => {
    setIsLoading(true);
    // Simulamos un pequeño retraso antes de la navegación para mostrar el spinner
    setTimeout(() => {
      router.push('/chat');
    }, 800);
  };

  useEffect(() => {
    // Asegurarse de que el video se reproduzca automáticamente cuando esté listo
    if (videoRef.current) {
      // Reducir aún más la velocidad de reproducción
      videoRef.current.playbackRate = 0.25;
      
      // Aplicar técnicas avanzadas para reducir parpadeos y mejorar calidad HD
      videoRef.current.style.transform = 'translate3d(0, -2%, 0) scale(1.05)';
      videoRef.current.style.webkitTransform = 'translate3d(0, -2%, 0) scale(1.05)';
      
      // Mejorar la calidad y rendimiento del video con filtros HD
      videoRef.current.style.filter = 'brightness(0.85) contrast(1.05) saturate(1.1)';
      videoRef.current.style.transition = 'opacity 1s ease-in-out, filter 1.5s ease-in-out';
      videoRef.current.style.opacity = '0';
      
      // Precargar el video completamente antes de reproducirlo
      videoRef.current.load();
      videoRef.current.preload = 'auto';
      
      // Esperar a que el video esté completamente cargado antes de mostrarlo
      videoRef.current.oncanplaythrough = () => {
        // Reproducir el video
        videoRef.current?.play().catch(error => {
          console.error("Error reproduciendo el video:", error);
        });
        
        // Mostrar el video gradualmente para evitar parpadeos
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.style.opacity = '1';
          }
        }, 300);
      };
    }
  }, []);

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a192f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ minHeight: '100vh' }}
    >
      {/* Video de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Capa de textura para mejorar la percepción de calidad */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-10"></div>
        
        <video 
          ref={videoRef}
          className="absolute min-w-full min-h-full object-cover"
          style={{ 
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            opacity: 0, // Inicialmente oculto para evitar parpadeos
            objectFit: 'cover',
            imageRendering: 'high-quality'
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/admin.png"
        >
          <source src="/video/NovaVideo.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        
        {/* Overlay para mejorar la legibilidad del contenido */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-700/20 backdrop-blur-[1px]"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full">
        {/* Contenedor principal con mejor estructura */}
        <div className="flex flex-col items-center justify-center min-h-screen py-8 md:py-12">
          {/* Contenido central con mejor distribución */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Columna de texto */}
            <motion.div
              className="flex flex-col space-y-6 text-center md:text-left order-2 md:order-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-none">
                NovaChat
                <div className="h-1 w-20 bg-purple-500 mt-2 mx-auto md:mx-0 rounded-full"></div>
              </h1>
              
              <p className="text-gray-300 text-base sm:text-lg max-w-md mx-auto md:mx-0">
                Maneja tu WhatsApp con nuestro mejor agente de Nova. Herramientas avanzadas para una comunicación más efectiva.
              </p>
              
              <div className="pt-2">
                <button
                  onClick={handleNavigation}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cargando...</span>
                    </>
                  ) : (
                    <>
                      <span>Comienza tu exploración</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
            
            {/* Columna visual */}
            <motion.div
              className="flex justify-center items-center order-1 md:order-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72">
                {/* Círculo exterior */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-pulse"></div>
                
                {/* Elemento central */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    rotateY: [0, 180, 360],
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-[#0a192f] flex items-center justify-center">
                      <Image 
                        src="/images/admin.png" 
                        alt="Nova Dev Logo" 
                        width={80} 
                        height={80} 
                        className="h-16 w-auto sm:h-20 sm:w-auto"
                        priority
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Estadísticas en la parte inferior */}
          <motion.div
            className="w-full max-w-2xl mx-auto mt-12 md:mt-16 grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">80K+</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Optimización</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">87K+</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Gestión</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">80K+</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Contactos</p>
            </div>
          </motion.div>
          
          {/* Barra de progreso en la parte inferior */}
          <motion.div
            className="w-full max-w-2xl mx-auto mt-8 px-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-purple-400"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}