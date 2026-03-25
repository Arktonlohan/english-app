import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  size = 'md', 
  className = '',
  showText = true 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sizes = {
    sm: { container: 40, icon: 32, text: 'text-xl', subtext: 'text-[8px]', gap: 'gap-3' },
    md: { container: 60, icon: 48, text: 'text-3xl', subtext: 'text-[10px]', gap: 'gap-4' },
    lg: { container: 100, icon: 80, text: 'text-5xl', subtext: 'text-[14px]', gap: 'gap-6' },
    xl: { container: 160, icon: 128, text: 'text-7xl', subtext: 'text-[18px]', gap: 'gap-8' }
  };

  const currentSize = sizes[size];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-row items-center justify-center ${currentSize.gap} ${className}`}>
      <motion.div 
        className="relative flex items-center justify-center shrink-0"
        animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: currentSize.container, height: currentSize.container }}
      >
        {/* Premium Ambient Glow */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
          animate={isSpeaking ? { opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] } : { opacity: 0.2, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <svg 
          width={currentSize.icon} 
          height={currentSize.icon} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            {/* Main Gradient */}
            <linearGradient id="circle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" /> {/* Purple */}
              <stop offset="100%" stopColor="#3B82F6" /> {/* Blue */}
            </linearGradient>

            {/* Inner Shadow Filter */}
            <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feOffset dx="0" dy="2" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadow" />
              <feFlood floodColor="black" floodOpacity="0.2" />
              <feComposite in2="shadow" operator="in" />
              <feComposite in2="SourceGraphic" operator="over" />
            </filter>
          </defs>

          {/* Circle Shape - Clean & Premium */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="url(#circle-grad)" 
            filter="url(#inner-shadow)"
          />

          {/* Audio Waveform - Centered & Minimal */}
          <g transform="translate(32, 35)">
            {[0, 9, 18, 27, 36].map((x, i) => (
              <motion.rect
                key={i}
                x={x}
                y={10}
                width="4.5"
                height="10"
                rx="2.25"
                fill="white"
                animate={isSpeaking ? { 
                  height: [10, 24, 10],
                  y: [10, 3, 10],
                  opacity: [0.8, 1, 0.8]
                } : { height: 10, y: 10, opacity: 0.9 }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        </svg>
      </motion.div>

      {showText && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-col items-start"
        >
          <h1 className={`${currentSize.text} font-bold tracking-tight text-white leading-none`}>
            Falai.
          </h1>
          <p className={`${currentSize.subtext} font-medium text-white/40 uppercase tracking-[0.4em] mt-1`}>
            Speak Like a Native
          </p>
        </motion.div>
      )}
    </div>
  );
};




