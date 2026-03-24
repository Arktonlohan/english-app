import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'primary' | 'white' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true,
  variant = 'primary'
}) => {
  const sizes = {
    sm: { icon: 18, text: 'text-lg', container: 32 },
    md: { icon: 24, text: 'text-2xl', container: 44 },
    lg: { icon: 32, text: 'text-4xl', container: 64 },
    xl: { icon: 40, text: 'text-5xl', container: 80 }
  };

  const colors = {
    primary: {
      icon: 'from-primary to-accent',
      text: 'text-white',
      subtext: 'text-soft-gray'
    },
    white: {
      icon: 'from-white to-white/80',
      text: 'text-white',
      subtext: 'text-white/60'
    },
    dark: {
      icon: 'from-primary to-accent',
      text: 'text-white',
      subtext: 'text-soft-gray'
    }
  };

  const currentSize = sizes[size];
  const currentColor = colors[variant];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative flex items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${currentColor.icon} shadow-neon`}
        style={{ width: currentSize.container, height: currentSize.container }}
      >
        <svg 
          width={currentSize.icon} 
          height={currentSize.icon} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.rect 
            x="3" y="10" width="3" height="4" rx="1.5" fill="currentColor" 
            className="text-white"
            animate={{ height: [4, 8, 4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.rect 
            x="8" y="6" width="3" height="12" rx="1.5" fill="currentColor" 
            className="text-white"
            animate={{ height: [12, 18, 12], y: [6, 3, 6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.rect 
            x="13" y="4" width="3" height="16" rx="1.5" fill="currentColor" 
            className="text-white"
            animate={{ height: [16, 10, 16], y: [4, 7, 4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.rect 
            x="18" y="8" width="3" height="8" rx="1.5" fill="currentColor" 
            className="text-white"
            animate={{ height: [8, 14, 8], y: [8, 5, 8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </svg>
      </motion.div>
      
      {showText && (
        <div className="flex flex-col -space-y-1">
          <h1 className={`${currentSize.text} font-black font-display tracking-tighter ${currentColor.text} glow-text`}>
            Falai<span className="text-neon-cyan">.</span>
          </h1>
          <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${currentColor.subtext}`}>
            Speak Like a Native
          </span>
        </div>
      )}
    </div>
  );
};
