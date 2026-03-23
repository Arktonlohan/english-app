import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import { Button, Input } from '../UI';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToSignUp, 
  onSwitchToForgotPassword 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black font-display tracking-tight text-slate-900">Welcome Back</h2>
        <p className="text-slate-400 font-medium">Continue your journey to fluency.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <Input 
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <div className="space-y-2">
            <Input 
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />
            <div className="flex justify-between items-center px-1">
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button 
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-4 rounded-2xl" 
          isLoading={isLoading}
        >
          Log In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
          <span className="bg-white px-4 text-slate-300">Or continue with</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full py-4 rounded-2xl border-slate-100 text-slate-600"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Chrome size={18} className="mr-2" />
        Google
      </Button>

      <p className="text-center text-sm font-bold text-slate-400">
        Don't have an account?{' '}
        <button 
          onClick={onSwitchToSignUp}
          className="text-primary hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};
