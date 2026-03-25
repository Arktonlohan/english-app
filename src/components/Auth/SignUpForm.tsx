import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Chrome, Check, X, AlertCircle } from 'lucide-react';
import { Button, Input } from '../UI';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ 
  onSwitchToLogin 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, loginWithGoogle } = useAuth();

  const validatePassword = (pass: string) => {
    return {
      length: pass.length >= 8,
      number: /\d/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
  };

  const passwordStrength = validatePassword(password);
  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword;
  const isFormValid = isPasswordValid && passwordsMatch && agreeToTerms && email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setError(null);
    setIsLoading(true);

    try {
      await signUp(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black font-display tracking-tight text-white">Join Falai</h2>
        <p className="text-soft-gray font-medium">Start your journey to fluency today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-soft-pink/10 border border-soft-pink/20 rounded-2xl text-soft-pink text-sm font-bold text-center"
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
            icon={<Mail size={18} className="text-primary" />}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            required
          />

          <div className="space-y-2">
            <Input 
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} className="text-primary" />}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              required
            />
            <div className="flex justify-between items-center px-1">
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-black uppercase tracking-widest text-soft-gray hover:text-primary transition-colors flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <Input 
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={18} className="text-primary" />}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            error={confirmPassword && !passwordsMatch ? "Passwords don't match" : undefined}
            required
          />

          {/* Password Strength Checklist */}
          {password && (
            <div className="grid grid-cols-1 gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                {passwordStrength.length ? <Check size={12} className="text-neon-cyan" /> : <X size={12} className="text-soft-gray" />}
                <span className={passwordStrength.length ? 'text-neon-cyan' : 'text-soft-gray'}>Min 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                {passwordStrength.number ? <Check size={12} className="text-neon-cyan" /> : <X size={12} className="text-soft-gray" />}
                <span className={passwordStrength.number ? 'text-neon-cyan' : 'text-soft-gray'}>At least one number</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                {passwordStrength.special ? <Check size={12} className="text-neon-cyan" /> : <X size={12} className="text-soft-gray" />}
                <span className={passwordStrength.special ? 'text-neon-cyan' : 'text-soft-gray'}>At least one special char</span>
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 px-2 cursor-pointer group">
            <div className="relative flex items-center mt-1">
              <input 
                type="checkbox" 
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-white/10 rounded-lg bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all" />
              <Check size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-xs font-bold text-soft-gray leading-relaxed">
              I agree to the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>.
            </span>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full py-4 rounded-2xl gradient-primary shadow-neon text-white font-bold" 
          isLoading={isLoading}
          disabled={!isFormValid}
        >
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
          <span className="bg-slate-900/50 backdrop-blur-sm px-4 text-soft-gray">Or continue with</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className={`w-full py-4 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 ${!isSupabaseConfigured ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <Chrome size={18} className="mr-2 text-neon-cyan" />
          Google
        </Button>
        
        {!isSupabaseConfigured && (
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-soft-pink/60">
            <AlertCircle size={12} />
            <span>Google Login not configured</span>
          </div>
        )}
      </div>

      <p className="text-center text-sm font-bold text-soft-gray">
        Already have an account?{' '}
        <button 
          onClick={onSwitchToLogin}
          className="text-primary hover:underline"
        >
          Log In
        </button>
      </p>
    </div>
  );
};
