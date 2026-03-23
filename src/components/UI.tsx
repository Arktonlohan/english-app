import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group";
  
  const variants = {
    primary: "gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5",
    secondary: "bg-secondary text-foreground hover:bg-slate-200",
    ghost: "bg-transparent text-slate-500 hover:text-primary hover:bg-primary/5",
    outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-6 py-3 text-sm rounded-2xl",
    lg: "px-8 py-4 text-base rounded-2xl"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <span className="relative z-10 flex items-center gap-2">{children}</span>
          {variant === 'primary' && (
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          )}
        </>
      )}
    </motion.button>
  );
};

export const Card: React.FC<HTMLMotionProps<"div">> = ({ children, className = '', ...props }) => (
  <motion.div 
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`bg-white border border-slate-100 rounded-[2rem] shadow-premium ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'glass'; className?: string }> = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-slate-100 text-slate-500",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white"
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
  <div className="space-y-2 w-full">
    {label && <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>}
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
      )}
      <input 
        className={`
          w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 
          ${icon ? 'pl-12' : 'pl-6'} pr-6 text-sm font-bold 
          focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 
          transition-all placeholder:text-slate-300
          ${error ? 'border-rose-100 bg-rose-50/30 focus:border-rose-200 focus:ring-rose-50' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
    {error && <p className="text-[10px] font-bold text-rose-500 px-2 uppercase tracking-wider">{error}</p>}
  </div>
);
