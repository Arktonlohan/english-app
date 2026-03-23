import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../UI';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="space-y-8 text-center py-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={40} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black font-display tracking-tight text-slate-900">Check Your Email</h2>
          <p className="text-slate-400 font-medium">We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>.</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full py-4 rounded-2xl border-slate-100 text-slate-600"
          onClick={onBack}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black font-display tracking-tight text-slate-900">Reset Password</h2>
        <p className="text-slate-400 font-medium">Enter your email and we'll send you a link to reset your password.</p>
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

        <Input 
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          required
        />

        <Button 
          type="submit" 
          className="w-full py-4 rounded-2xl" 
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>

        <button 
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>
      </form>
    </div>
  );
};
