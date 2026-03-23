import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { vocabularyService } from '../services/vocabularyService';
import { FlashcardStats, VocabularyWord, SRSLevel } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { 
  RotateCcw, 
  Check, 
  Zap, 
  Clock, 
  TrendingUp, 
  Info, 
  Sparkles, 
  ChevronLeft, 
  Brain,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trophy,
  History
} from 'lucide-react';

type SessionState = 'dashboard' | 'preview' | 'reviewing' | 'summary';

export const FlashcardsPage = () => {
  const [sessionState, setSessionState] = useState<SessionState>('dashboard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dueCards, setDueCards] = useState<VocabularyWord[]>([]);
  const [sessionResults, setSessionResults] = useState<{
    correct: number;
    difficult: number;
    total: number;
    words: { text: string; result: string }[];
  }>({ correct: 0, difficult: 0, total: 0, words: [] });
  
  const [feedback, setFeedback] = useState<{
    show: boolean;
    interval: string;
    level: string;
  }>({ show: false, interval: '', level: '' });

  useEffect(() => {
    const loadDueCards = async () => {
      const cards = await vocabularyService.getDueCards();
      setDueCards(cards);
    };
    loadDueCards();
  }, [sessionState]);

  const stats: FlashcardStats = useMemo(() => {
    return vocabularyService.getStats();
  }, [dueCards, sessionState]);

  const currentCard = dueCards[currentIndex];
  const progress = dueCards.length > 0 ? ((currentIndex) / dueCards.length) * 100 : 0;

  const handleReview = async (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    
    const result = await vocabularyService.updateSRS(currentCard.id, difficulty);
    
    if (result) {
      setFeedback({
        show: true,
        interval: result.intervalText,
        level: result.newLevel
      });
    }

    // Update session results
    setSessionResults(prev => ({
      ...prev,
      correct: difficulty === 'good' || difficulty === 'easy' ? prev.correct + 1 : prev.correct,
      difficult: difficulty === 'again' || difficulty === 'hard' ? prev.difficult + 1 : prev.difficult,
      words: [...prev.words, { text: currentCard.text, result: difficulty }]
    }));

    setTimeout(() => {
      setFeedback({ show: false, interval: '', level: '' });
      setIsFlipped(false);
      
      setTimeout(() => {
        if (currentIndex < dueCards.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setSessionResults(prev => ({ ...prev, total: dueCards.length }));
          setSessionState('summary');
        }
      }, 300);
    }, 800);
  };

  const startSession = () => {
    if (dueCards.length > 0) {
      setCurrentIndex(0);
      setSessionResults({ correct: 0, difficult: 0, total: 0, words: [] });
      setSessionState('reviewing');
    }
  };

  // 1. Dashboard View
  if (sessionState === 'dashboard') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 pb-24"
      >
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Brain size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Spaced Repetition</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-slate-900">Study Center</h1>
            <p className="text-slate-400 font-medium">Your daily brain workout is ready.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <History size={16} className="text-slate-400" />
            <span className="text-sm font-black text-slate-600">{stats.streak} Day Streak</span>
          </div>
        </header>

        {/* Main Action Card */}
        <Card className="p-10 border-none bg-slate-900 text-white rounded-[3rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <Badge variant="glass" className="px-4 py-1.5">Daily Goal</Badge>
                <h2 className="text-4xl font-black font-display leading-tight">
                  {stats.dueToday > 0 
                    ? `You have ${stats.dueToday} cards to review today.`
                    : "You're all caught up for today!"}
                </h2>
                <p className="text-slate-400 text-lg font-medium">
                  {stats.dueToday > 0 
                    ? "Consistency is the key to long-term memory. Let's get these done."
                    : "Great job maintaining your streak. Come back tomorrow for more!"}
                </p>
              </div>
              
              <Button 
                variant="glass" 
                size="lg" 
                className="w-full sm:w-auto px-12 py-6 rounded-2xl text-xl font-black shadow-2xl"
                onClick={startSession}
                disabled={stats.dueToday === 0}
              >
                {stats.dueToday > 0 ? "Start Review Session" : "Nothing Due Today"}
                <ArrowRight size={22} className="ml-2" />
              </Button>
            </div>

            <div className="w-48 h-48 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <motion.circle 
                  cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="12" 
                  strokeDasharray="502.6"
                  initial={{ strokeDashoffset: 502.6 }}
                  animate={{ strokeDashoffset: 502.6 * (1 - (stats.totalCards > 0 ? (stats.totalCards - stats.dueToday) / stats.totalCards : 0)) }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{Math.round((stats.totalCards > 0 ? (stats.totalCards - stats.dueToday) / stats.totalCards : 0) * 100)}%</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Done</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Level Breakdown */}
        <section className="space-y-6">
          <h3 className="text-xl font-black font-display tracking-tight text-slate-900 px-2">Knowledge Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'New', count: stats.newCount, color: 'bg-slate-100 text-slate-600', icon: Sparkles },
              { label: 'Learning', count: stats.learningCount, color: 'bg-amber-50 text-amber-600', icon: Zap },
              { label: 'Reviewing', count: stats.reviewingCount, color: 'bg-blue-50 text-blue-600', icon: TrendingUp },
              { label: 'Mastered', count: stats.masteredCount, color: 'bg-emerald-50 text-emerald-600', icon: Trophy },
            ].map((item) => (
              <Card key={item.label} className="p-6 border-none bg-white shadow-xl shadow-slate-200/40 rounded-[2rem] space-y-3">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{item.count}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Retention & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 border-none bg-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] flex items-center gap-8">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent -rotate-45" />
              <span className="text-xl font-black text-emerald-600">{stats.retentionRate}%</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900">Retention Rate</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Your long-term memory strength is looking strong.</p>
            </div>
          </Card>

          <Card className="p-8 border-none bg-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] flex items-center gap-8">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Calendar size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900">Next Big Milestone</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Reach a 14-day streak to unlock the "Memory Master" badge.</p>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  }

  // 2. Reviewing View
  if (sessionState === 'reviewing') {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col p-6 md:p-10">
        <header className="flex justify-between items-center mb-10">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-xl px-4"
            onClick={() => setSessionState('dashboard')}
          >
            <ChevronLeft size={18} className="mr-1" /> Quit Session
          </Button>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Progress</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentIndex + 1} / {dueCards.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-emerald-500 font-black text-xs">
              <CheckCircle2 size={14} /> {sessionResults.correct}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-rose-500 font-black text-xs">
              <AlertCircle size={14} /> {sessionResults.difficult}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center perspective-[2000px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.id}
              initial={{ x: 300, opacity: 0, rotateY: 0 }}
              animate={{ x: 0, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="relative w-full max-w-[400px] aspect-[3/4] cursor-pointer"
              onClick={() => !feedback.show && setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <Card className="absolute inset-0 p-12 flex flex-col items-center justify-center text-center backface-hidden border-none shadow-2xl shadow-slate-200 bg-white rounded-[3.5rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary to-accent" />
                <div className="absolute top-12 left-12 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                  <Brain size={24} />
                </div>
                
                <h2 className="text-5xl font-black font-display mb-8 tracking-tight text-slate-900">
                  {currentCard?.text}
                </h2>
                <p className="text-primary font-mono text-2xl font-bold tracking-widest opacity-60">{currentCard?.ipa}</p>
                
                <div className="absolute bottom-16 text-slate-300 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 px-8 py-4 rounded-full">
                  <RotateCcw size={16} /> Tap to reveal meaning
                </div>
              </Card>

              {/* Back */}
              <Card 
                className="absolute inset-0 p-12 flex flex-col items-center justify-center text-center backface-hidden border-none shadow-2xl shadow-primary/10 bg-white rounded-[3.5rem] overflow-hidden"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-accent" />
                
                <div className="space-y-12 w-full">
                  <section className="space-y-4">
                    <Badge variant="primary" className="bg-primary/5 text-primary border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Meaning</Badge>
                    <p className="text-3xl font-bold leading-tight text-slate-900">{currentCard?.meaning}</p>
                    {currentCard?.translation && (
                      <p className="text-lg font-medium text-slate-400">{currentCard.translation}</p>
                    )}
                  </section>
                  
                  <section className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Contextual Example</span>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] relative">
                      <div className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-200">
                        <Info size={18} />
                      </div>
                      <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                        "{currentCard?.example}"
                      </p>
                    </div>
                  </section>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback.show && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
              >
                <div className="bg-slate-900/90 backdrop-blur-xl text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-3 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black">Next review in {feedback.interval}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Level: {feedback.level}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-40 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isFlipped ? (
              <motion.div 
                key="controls"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="grid grid-cols-4 gap-4 w-full max-w-2xl"
              >
                {[
                  { label: 'Again', color: 'bg-rose-50 text-rose-600 border-rose-100', time: '10m', icon: RotateCcw },
                  { label: 'Hard', color: 'bg-amber-50 text-amber-600 border-amber-100', time: '1d', icon: AlertCircle },
                  { label: 'Good', color: 'bg-blue-50 text-blue-600 border-blue-100', time: '3d', icon: CheckCircle2 },
                  { label: 'Easy', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', time: '7d', icon: Trophy }
                ].map((btn) => (
                  <button 
                    key={btn.label}
                    onClick={() => handleReview(btn.label.toLowerCase() as any)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-[2.5rem] ${btn.color} border-2 hover:scale-105 active:scale-95 transition-all group shadow-sm`}
                  >
                    <btn.icon size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    <div className="text-center">
                      <span className="block font-black text-sm tracking-tight">{btn.label}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{btn.time}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 bg-white px-10 py-5 rounded-full border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  Tap card to reveal answer
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 3. Summary View
  if (sessionState === 'summary') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 pb-24 text-center px-6"
      >
        <div className="relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-40 h-40 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-8 relative z-10 shadow-2xl shadow-emerald-500/20"
          >
            <Trophy className="text-white" size={64} strokeWidth={2.5} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black font-display tracking-tight text-slate-900">Session Complete!</h1>
          <p className="text-slate-500 text-xl font-medium max-w-[320px] mx-auto leading-relaxed">
            You've mastered {sessionResults.correct} words today. Your long-term memory is getting stronger.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
          <Card className="p-6 space-y-2 border-none bg-slate-50 rounded-[2rem]">
            <p className="text-3xl font-black text-slate-900">{sessionResults.total}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reviewed</p>
          </Card>
          <Card className="p-6 space-y-2 border-none bg-emerald-50 rounded-[2rem]">
            <p className="text-3xl font-black text-emerald-600">{Math.round((sessionResults.correct / sessionResults.total) * 100)}%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Accuracy</p>
          </Card>
          <Card className="p-6 space-y-2 border-none bg-amber-50 rounded-[2rem]">
            <p className="text-3xl font-black text-amber-600">{sessionResults.difficult}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Difficult</p>
          </Card>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button 
            className="w-full py-8 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20" 
            onClick={() => setSessionState('dashboard')}
          >
            Finish Session
          </Button>
          <Button 
            variant="secondary" 
            className="w-full py-6 rounded-2xl font-bold" 
            onClick={startSession}
          >
            Review Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
};
