import React from 'react';
import { motion } from 'motion/react';
import { Card, Badge } from '../components/UI';
import { TrendingUp, Zap, Target, Sparkles, Clock, BarChart2, LogOut, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';

export const ProgressPage: React.FC = () => {
  const { logout } = useAuth();
  const { overallStats, isLoading } = useDashboardData();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="space-y-12 pb-24 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-[2rem] w-3/4" />
        <div className="h-96 bg-slate-100 rounded-[3rem]" />
      </div>
    );
  }

  const stats = overallStats;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-12 pb-24"
    >
      {/* Header */}
      <header className="flex justify-between items-start py-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-xs font-black uppercase tracking-widest border border-primary/10"
          >
            <TrendingUp size={14} />
            Your Fluency Journey
          </motion.div>
          <h1 className="text-5xl font-black font-display tracking-tight text-slate-900 leading-tight">
            Track Your <span className="text-primary">Growth.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-[320px] leading-relaxed font-medium">
            See how far you've come and what's next on your path to mastery.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
          title="Log Out"
        >
          <LogOut size={20} />
        </button>
      </header>
      
      <div className="grid grid-cols-1 gap-10">
        {/* Overall Score Circle */}
        <Card className="p-10 flex flex-col items-center text-center space-y-10 bg-gradient-to-b from-white to-slate-50 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem]">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                className="text-slate-100"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="16"
                strokeDasharray="703.72"
                initial={{ strokeDashoffset: 703.72 }}
                animate={{ strokeDashoffset: 703.72 * (1 - 0.85) }}
                transition={{ duration: 2.5, ease: "circOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
              <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-7xl font-black font-display tracking-tighter text-slate-900"
              >
                85
              </motion.span>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Fluency Score</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 w-full gap-6 pt-8 border-t border-slate-100">
            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900">{stats.totalWords}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Words Saved</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900">{stats.completedSentences}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sentences</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900">{Math.floor(stats.totalTime / 60)}m</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Practice Time</p>
            </div>
          </div>
        </Card>

        {/* Shadowing Mastery Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900">Shadowing Progress</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sentences Mastered</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-slate-900">{stats.completedSentences}</span>
                <span className="text-sm font-bold text-slate-400">Total</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full rounded-full bg-primary shadow-lg"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900">Difficult Sentences</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Needs Review</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-slate-900">{stats.difficultSentences}</span>
                <span className="text-sm font-bold text-slate-400">Sentences</span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                You have {stats.difficultSentences} sentences marked as difficult. Revisit them in the Shadowing Player to improve your fluency.
              </p>
            </div>
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <Card className="p-10 space-y-10 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem]">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Weekly Activity</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">March 16 - 22</p>
            </div>
            <Badge variant="primary" className="px-4 py-2 rounded-2xl text-xs font-black">
              <Clock size={14} className="mr-2" />
              4.2h Total
            </Badge>
          </div>
          
          <div className="flex justify-between items-end h-48 gap-4">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-50 rounded-3xl relative group h-full">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.1, type: "spring", damping: 15 }}
                  className="absolute bottom-0 left-0 right-0 gradient-primary rounded-3xl transition-all duration-500 shadow-xl shadow-primary/20 relative overflow-hidden" 
                >
                  <motion.div 
                    animate={{ y: ['100%', '-100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                  />
                </motion.div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-black text-primary bg-white px-3 py-1.5 rounded-xl shadow-2xl border border-slate-100 whitespace-nowrap">
                  {Math.round(h / 10)}h 20m
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 uppercase font-black tracking-[0.3em] px-2">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </Card>

        {/* Skill Breakdown */}
        <Card className="p-10 space-y-8 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem]">
          <h3 className="font-black text-xl text-slate-900">Skill Breakdown</h3>
          <div className="space-y-8">
            {[
              { label: 'Listening', value: 85, color: 'bg-primary' },
              { label: 'Speaking', value: 65, color: 'bg-accent' },
              { label: 'Reading', value: 92, color: 'bg-emerald-500' },
              { label: 'Writing', value: 45, color: 'bg-amber-500' },
            ].map((skill, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{skill.label}</span>
                  <span className="text-sm font-black text-slate-400">{skill.value}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ duration: 1.5, delay: 0.8 + i * 0.1, ease: "circOut" }}
                    className={`h-full rounded-full ${skill.color} shadow-lg`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
