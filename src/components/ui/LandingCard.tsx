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
          poster="/video/poster-frame.jpg"
        >
          <source src="/video/NovaVideo.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        
        {/* Overlay para mejorar la legibilidad del contenido con gradiente mejorado */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-purple-800/25 to-purple-700/20 backdrop-blur-[1px]"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        {/* Logo pequeño en la esquina */}
        <motion.div
          className="absolute top-8 left-8 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
         
        </motion.div>
        
        {/* Elemento central luminoso */}
        <div className="relative flex flex-col md:flex-row items-center justify-between py-20">
          {/* Texto principal */}
          <motion.div
            className="md:w-1/2 mb-12 md:mb-0 z-10 transform -translate-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-tight relative">
              NovaChat
              <span className="absolute -bottom-1 left-0 w-1/4 h-1 bg-purple-500 rounded-full"></span>
            </h1>
            <p className="text-gray-300 max-w-md mb-8 text-sm md:text-base">
              Maneja tu WhatsApp con nuestro mejor agente de Nova. Herramientas avanzadas para una comunicación más efectiva.
            </p>
            
            {/* Botones de acción */}
            <div className="flex space-x-4">
              <button
                onClick={handleNavigation}
                disabled={isLoading}
                className="bg-purple-600 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-purple-500/50 hover:bg-purple-500 transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center text-sm relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500/40 to-purple-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></span>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="relative z-10">Cargando...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Comienza tu exploración</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white transform -translate-x-1/2 group-hover:w-3/4 transition-all duration-300 ease-in-out"></span>
              </button>
            </div>
          </motion.div>
          
          {/* Elemento visual central */}
          <motion.div
            className="md:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="relative w-[300px] h-[300px] mx-auto transform -translate-y-8">
              {/* Círculo luminoso */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-400/30"></div>
              
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
                <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[#0a192f] flex items-center justify-center">
                    <Image 
                      src="/images/logonova.webp" 
                      alt="Nova Dev Logo" 
                      width={80} 
                      height={80} 
                      className="h-16 w-auto"
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
          className="absolute bottom-12 left-0 right-0 flex justify-center space-x-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">80K+</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Optimización</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">87K+</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Gestión</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">80K+</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Contactos</p>
          </div>
        </motion.div>
        
        {/* Barra de progreso en la parte inferior */}
        <motion.div
          className="absolute bottom-4 left-0 right-0 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-purple-400"></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}