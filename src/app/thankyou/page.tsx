"use client";
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import ClinicHome from '../components/ClinicHome';

const ThankYouPage = () => {
  useEffect(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <ClinicHome>
      <div className="w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)]  md:h-[calc(100vh-100px)] lg:h-[calc(100vh-139px)] flex flex-col items-center justify-center px-3 sm:px-4 lg:px-4 py-1 sm:py-4 lg:py-4 overflow-hidden" style={{
        background: 'linear-gradient(to bottom, white 70%, #67e8f9 100%)'
      }}>
        <div className="bg-white rounded-lg border shadow-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl w-full text-center animate-fade-in px-3 sm:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-2 sm:mb-4 mt-1 sm:mt-3">
            Thank You for Registering!
          </h1>

          <div className="mb-2 sm:mb-6 animate-scale-up">
            <img src="/85e294ef76fe7d3df00bfe9ed9d8335ff4b1bdde.png" alt='logo' className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 mx-auto drop-shadow-lg" />
          </div>

          <div className="text-center mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              <span className="text-blue-800">Welcome</span> to the Future of Lab Management
            </h2>
            <div className="border w-24 sm:w-32 mx-auto mt-1 sm:mt-2"></div>
          </div>

          <p className="text-black leading-relaxed mb-2 sm:mb-6 text-sm sm:text-base">
            Our team will connect with you shortly to complete your onboarding process.
          </p>

          <div className='border border-gray-300 mb-1 sm:mb-2'> </div>

          <p className="text-black mb-3 sm:mb-8 text-sm sm:text-base">
            Get a glimpse of your smarter lab journey
          </p>

          <button
            className="primary text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-300 mb-1 sm:mb-3 text-sm sm:text-base"
            onClick={() => window.location.href = '/'}
          >
            Let's Go
          </button>
        </div>
      </div>

    </ClinicHome>
  );
};

export default ThankYouPage;