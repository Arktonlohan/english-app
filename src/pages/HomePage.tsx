import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button, Badge } from '../components/UI';
import { 
  Play, 
  Zap, 
  Target, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Layout, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Search,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { TabType, Speech } from '../types';
import { MOCK_SPEECHES } from '../data/speeches';
import { useDashboardData } from '../hooks/useDashboardData';

interface HomePageProps {
  onTabChange: (tab: TabType) => void;
  onSelectSpeech: (speech: Speech) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onTabChange, onSelectSpeech }) => {
  const { 
    recentSpeech, 
    recentProgress, 
    overallStats, 
    todayStats, 
    flashcardStats, 
    user,
    isLoading 
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-10 pb-24 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-[2rem] w-3/4" />
        <div className="h-64 bg-slate-100 rounded-[3rem]" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-32 bg-slate-100 rounded-[2rem]" />
          <div className="h-32 bg-slate-100 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  const hasProgress = recentSpeech !== null;
  const userName = user?.name?.split(' ')[0] || 'Alex';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-24"
    >
      {/* Hero Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-soft-gray uppercase tracking-widest">Current Streak</p>
            <p className="text-lg font-black text-white glow-text">{flashcardStats.streak} Days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-neon">
            <Sparkles className="text-white" size={20} />
          </div>
        </div>
      </header>

      <div className="space-y-1">
        <h1 className="text-3xl font-black font-display tracking-tight text-white">
          Welcome back, <span className="gradient-text">{userName}.</span>
        </h1>
        <p className="text-soft-gray font-bold text-sm uppercase tracking-widest">
          Ready for your daily practice?
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!hasProgress ? (
          /* Empty State / Welcome Card */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="p-10 glass-dark border-none text-white relative overflow-hidden rounded-[3rem] shadow-neon">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]" />
              
              <div className="relative z-10 space-y-8 max-w-md">
                <div className="space-y-4">
                  <Badge variant="glass" className="px-4 py-2 border-white/10">Get Started</Badge>
                  <h2 className="text-4xl font-black font-display leading-tight">
                    Your journey to <span className="gradient-text">fluency</span> starts here.
                  </h2>
                  <p className="text-soft-gray text-lg font-medium leading-relaxed">
                    Pick your first speech and start shadowing. We'll track your progress and help you master every word.
                  </p>
                </div>
                <Button 
                  variant="glass" 
                  size="lg" 
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl text-lg font-bold shadow-neon-cyan border-white/10"
                  onClick={() => onTabChange('videos')}
                >
                  Explore Videos <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Continue Learning Card */
          <motion.div
            key="continue-learning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-black font-display tracking-tight text-white">Continue Learning</h3>
              <Badge variant="primary" className="bg-primary/10 text-primary border border-primary/20">
                Last active: {new Date(recentProgress!.lastStudiedAt).toLocaleDateString()}
              </Badge>
            </div>
            
            <Card className="p-0 border-none shadow-neon overflow-hidden rounded-[3rem] glass-dark group">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 relative aspect-video md:aspect-auto">
                  <img 
                    src={recentSpeech!.thumbnail} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="glass" className="text-[8px] py-0.5 border-white/10">{recentSpeech!.difficulty}</Badge>
                      <Badge variant="glass" className="text-[8px] py-0.5 border-white/10">{recentSpeech!.category}</Badge>
                    </div>
                    <h4 className="text-white font-black text-xl line-clamp-1">{recentSpeech!.title}</h4>
                  </div>
                </div>
                
                <div className="md:w-3/5 p-8 space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Progress</p>
                        <p className="text-2xl font-black text-white glow-text">
                          {Math.round((recentProgress!.completedSentenceIds.length / (recentSpeech!.transcript?.segments?.length || 1)) * 100)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Saved Words</p>
                        <p className="text-2xl font-black text-white glow-text">{recentProgress!.savedWordsCount}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-soft-gray uppercase tracking-widest">
                        <span>Course Completion</span>
                        <span>{recentProgress!.completedSentenceIds.length} / {recentSpeech!.transcript?.segments?.length || 0} Sentences</span>
                      </div>
                      <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(recentProgress!.completedSentenceIds.length / (recentSpeech!.transcript?.segments?.length || 1)) * 100}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full rounded-full gradient-primary shadow-neon"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full rounded-2xl py-5 text-lg font-bold shadow-neon"
                    onClick={() => onSelectSpeech(recentSpeech!)}
                  >
                    <Play size={20} fill="currentColor" className="mr-2" /> Resume Learning
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Snapshot */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-black font-display tracking-tight text-white">Today's Snapshot</h3>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 size={14} /> Daily Goal: {Math.min(100, Math.round((todayStats.timeSpent / 1200) * 100))}%
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-6 space-y-3 border-none glass-dark shadow-neon">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white glow-text">{Math.floor(todayStats.timeSpent / 60)}m</p>
              <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Study Time</p>
            </div>
          </Card>
          
          <Card className="p-6 space-y-3 border-none glass-dark shadow-neon">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 shadow-sm">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white glow-text">{todayStats.segmentsCompleted}</p>
              <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Sentences</p>
            </div>
          </Card>
          
          <Card className="p-6 space-y-3 border-none glass-dark shadow-neon">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-soft-pink shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white glow-text">{todayStats.wordsSaved}</p>
              <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">New Words</p>
            </div>
          </Card>
          
          <Card className="p-6 space-y-3 border-none glass-dark shadow-neon">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 shadow-sm">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white glow-text">{flashcardStats.dueToday}</p>
              <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Cards Due</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <h3 className="text-xl font-black font-display tracking-tight text-white px-2">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => onTabChange('pronunciation')}
            className="flex items-center gap-4 p-6 glass-dark border border-white/5 rounded-[2rem] hover:border-primary/40 hover:shadow-neon transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-neon">
              <Mic size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black text-white group-hover:text-primary transition-colors">Pronunciation Drill</p>
              <p className="text-xs font-bold text-soft-gray">Master your accent with AI feedback</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => onTabChange('videos')}
            className="flex items-center gap-4 p-6 glass-dark border border-white/5 rounded-[2rem] hover:border-primary/40 hover:shadow-neon transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-neon">
              <Layout size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black text-white group-hover:text-primary transition-colors">Explore Videos</p>
              <p className="text-xs font-bold text-soft-gray">Find new content to shadow</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
          
          <button 
            onClick={() => onTabChange('flashcards')}
            className="flex items-center gap-4 p-6 glass-dark border border-white/5 rounded-[2rem] hover:border-accent/40 hover:shadow-neon-cyan transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan group-hover:scale-110 transition-transform shadow-neon-cyan">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black text-white group-hover:text-neon-cyan transition-colors">Review Vocabulary</p>
              <p className="text-xs font-bold text-soft-gray">{flashcardStats.dueToday} words waiting for you</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => onTabChange('progress')}
            className="flex items-center gap-4 p-6 glass-dark border border-white/5 rounded-[2rem] hover:border-electric-blue/40 hover:shadow-neon transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-electric-blue/10 flex items-center justify-center text-electric-blue group-hover:scale-110 transition-transform shadow-neon">
              <TrendingUp size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black text-white group-hover:text-electric-blue transition-colors">View Progress</p>
              <p className="text-xs font-bold text-soft-gray">Analyze your fluency growth</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-electric-blue group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </section>

      {/* Recommended for You */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-black font-display tracking-tight text-white">Recommended for You</h3>
          <button 
            onClick={() => onTabChange('videos')}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6">
          {MOCK_SPEECHES.filter(s => s.id !== recentSpeech?.id).slice(0, 4).map((speech, idx) => (
            <motion.div 
              key={speech.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[280px]"
            >
              <Card 
                className="p-4 space-y-4 cursor-pointer group border-white/5 glass-dark hover:border-primary/40 transition-all duration-500 hover:shadow-neon"
                onClick={() => onSelectSpeech(speech)}
              >
                <div className="relative aspect-video rounded-[1.5rem] overflow-hidden">
                  <img 
                    src={speech.thumbnail} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-500 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-neon">
                      <Play size={16} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-1 space-y-1">
                  <h4 className="font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{speech.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-soft-gray uppercase tracking-widest">{speech.speaker}</span>
                    <Badge variant="secondary" className="text-[8px] bg-white/5 border-white/10">{speech.difficulty}</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
