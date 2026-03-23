import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Chrome, Check, X } from 'lucide-react';
import { Button, Input } from '../UI';
import { useAuth } from '../../context/AuthContext';

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
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black font-display tracking-tight text-slate-900">Join Fluent</h2>
        <p className="text-slate-400 font-medium">Start your journey to fluency today.</p>
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
            </div>
          </div>

          <Input 
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={18} />}
            error={confirmPassword && !passwordsMatch ? "Passwords don't match" : undefined}
            required
          />

          {/* Password Strength Checklist */}
          {password && (
            <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                {passwordStrength.length ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-slate-300" />}
                <span className={passwordStrength.length ? 'text-emerald-600' : 'text-slate-400'}>Min 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                {passwordStrength.number ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-slate-300" />}
                <span className={passwordStrength.number ? 'text-emerald-600' : 'text-slate-400'}>At least one number</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                {passwordStrength.special ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-slate-300" />}
                <span className={passwordStrength.special ? 'text-emerald-600' : 'text-slate-400'}>At least one special char</span>
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
              <div className="w-5 h-5 border-2 border-slate-200 rounded-lg bg-white peer-checked:bg-primary peer-checked:border-primary transition-all" />
              <Check size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-xs font-bold text-slate-400 leading-relaxed">
              I agree to the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>.
            </span>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full py-4 rounded-2xl" 
          isLoading={isLoading}
          disabled={!isFormValid}
        >
          Create Account
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
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        <Chrome size={18} className="mr-2" />
        Google
      </Button>

      <p className="text-center text-sm font-bold text-slate-400">
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
