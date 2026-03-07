// src/components/shared/SplashScreen.tsx
import React, { useEffect } from 'react';
import LogoE4C from '../../assets/Logo E4C.png';

interface SplashScreenProps {
  onAnimationEnd: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationEnd }) => {
  useEffect(() => {
    // Duración total de la animación por ahora. Podemos ajustarla después de que todas las animaciones estén listas.
    const totalAnimationDuration = 2500; // 2.5 segundos, según la recomendación
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, totalAnimationDuration);
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #ffffff, #e0f2f7)', // Gradiente sutil
        animation: 'bgPulse 15s infinite ease-in-out', // Fondo dinámico
        backgroundSize: '200% 200%',
      }}
    >
      {/* Logotipo con animación de aparición gradual y escala, más sombra sutil */}
      <img
        src={LogoE4C}
        alt="Logo E4C"
        className="w-1/3 max-w-xs drop-shadow-lg"
        style={{ animation: 'fadeInScale 1s ease-out forwards' }}
      />

      {/* Subtítulo con animación de deslizamiento hacia arriba y aparición gradual */}
      <p
        className="mt-4 text-gray-600 text-lg font-light tracking-wide" // Tipografía refinada
        style={{ animation: 'slideInUp 1s ease-out forwards 0.5s', opacity: 0 }} // Animación retrasada
      >
        Cargando el acceso libre a la cultura.
      </p>

      {/* Indicador de Carga Temático (Barras hexagonales - simulado por ahora) */}
      <div className="mt-8 w-64 h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" // Color temático
          style={{ animation: 'loadProgress 1.5s ease-out forwards 1s', width: '100%' }} // Progreso animado
        ></div>
      </div>
    </div>
  );
};

export default SplashScreen;