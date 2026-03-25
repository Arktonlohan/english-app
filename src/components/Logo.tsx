import React from 'react';
import { AnimatedLogo } from './AnimatedLogo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  return <AnimatedLogo size={size} className={className} showText={showText} />;
};

