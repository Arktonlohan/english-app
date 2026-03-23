import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';
import { LoginForm } from '../components/Auth/LoginForm';
import { SignUpForm } from '../components/Auth/SignUpForm';
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm';

interface AuthPageProps {}

type AuthView = 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC<AuthPageProps> = () => {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-gradient-to-br from-primary to-accent rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2], 
            rotate: [360, 270, 180, 90, 0],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-gradient-to-br from-accent to-primary rounded-full blur-[120px]"
        />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
        </div>

        {/* Auth Card */}
        <motion.div 
          layout
          className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-8 md:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm 
                  onSwitchToSignUp={() => setView('signup')}
                  onSwitchToForgotPassword={() => setView('forgot-password')}
                />
              </motion.div>
            )}

            {view === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignUpForm 
                  onSwitchToLogin={() => setView('login')}
                />
              </motion.div>
            )}

            {view === 'forgot-password' && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ForgotPasswordForm 
                  onBack={() => setView('login')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto">
            By continuing, you agree to our <button className="text-slate-600 hover:text-primary transition-colors">Terms of Service</button> and <button className="text-slate-600 hover:text-primary transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};
