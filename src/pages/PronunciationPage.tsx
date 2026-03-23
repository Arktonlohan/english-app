import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  History, 
  Trophy, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Volume2,
  X,
  Sparkles,
  ArrowRight,
  Info,
  Activity,
  ChevronLeft,
  PlayCircle
} from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { pronunciationService } from '../services/pronunciationService';
import { PronunciationAttempt, PronunciationPracticeItem, PronunciationScore } from '../types';

type ViewState = 'list' | 'practice' | 'analyzing' | 'result';

interface PronunciationPageProps {
  initialItem?: any;
  onClearInitialItem?: () => void;
}

export const PronunciationPage: React.FC<PronunciationPageProps> = ({ initialItem, onClearInitialItem }) => {
  const [view, setView] = useState<ViewState>('list');
  const [items, setItems] = useState<PronunciationPracticeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PronunciationPracticeItem | null>(null);

  useEffect(() => {
    if (initialItem) {
      setSelectedItem({
        id: initialItem.id || Math.random().toString(),
        text: initialItem.text,
        ipa: initialItem.ipa || '',
        type: 'word',
        category: 'From Vocabulary'
      });
      setView('practice');
      onClearInitialItem?.();
    }
  }, [initialItem, onClearInitialItem]);
  const [attempts, setAttempts] = useState<PronunciationAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<PronunciationAttempt | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stats, setStats] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setItems(pronunciationService.getPracticeItems());
      const attemptsData = await pronunciationService.getAttempts();
      const statsData = await pronunciationService.getStats();
      setAttempts(attemptsData);
      setStats(statsData);
    };

    fetchData();

    const handleUpdate = async () => {
      const attemptsData = await pronunciationService.getAttempts();
      const statsData = await pronunciationService.getStats();
      setAttempts(attemptsData);
      setStats(statsData);
    };

    window.addEventListener('fluent_pronunciation_update', handleUpdate);
    return () => window.removeEventListener('fluent_pronunciation_update', handleUpdate);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const analyze = async () => {
    if (!audioBlob || !selectedItem) return;
    
    setView('analyzing');
    try {
      const result = await pronunciationService.analyzePronunciation(selectedItem.text, audioBlob);
      setCurrentAttempt(result);
      setView('result');
    } catch (err) {
      console.error('Analysis failed', err);
      setView('practice');
    }
  };

  const resetPractice = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setCurrentAttempt(null);
    setView('practice');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderList = () => (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-display tracking-tight text-slate-900">Speak</h1>
        <p className="text-slate-500 font-medium">Perfect your pronunciation with AI-powered feedback.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 bg-primary/5 border-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Trophy size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Avg Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.averageScore}</span>
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
          </Card>
          <Card className="p-6 bg-accent/5 border-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent/60">Attempts</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.totalAttempts}</span>
              <span className="text-xs font-bold text-slate-400">Total</span>
            </div>
          </Card>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Practice</h3>
          <Card 
            onClick={() => {
              setSelectedItem(items[4]);
              setView('practice');
            }}
            className="p-6 bg-gradient-to-br from-primary to-accent text-white border-none shadow-xl shadow-primary/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="glass" className="bg-white/20 border-none">Daily Phrase</Badge>
              <Sparkles size={20} className="opacity-60" />
            </div>
            <h4 className="text-2xl font-black leading-tight mb-4 group-hover:scale-[1.02] transition-transform">{items[4].text}</h4>
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
              <span>Tap to start drill</span>
              <ArrowRight size={14} />
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Practice Items</h2>
          <Badge variant="secondary">{items.length} Available</Badge>
        </div>
        
        <div className="space-y-4">
          {items.map((item) => (
            <Card 
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setView('practice');
              }}
              className="p-5 cursor-pointer group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{item.text}</span>
                    {item.ipa && <span className="text-xs font-mono text-slate-400">{item.ipa}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="glass" className="bg-slate-50 text-slate-400 border-none lowercase">{item.type}</Badge>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent History</h2>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </div>
          
          <div className="space-y-4">
            {attempts.slice(0, 3).map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  attempt.score.overall >= 90 ? 'bg-emerald-100 text-emerald-600' :
                  attempt.score.overall >= 80 ? 'bg-blue-100 text-blue-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {attempt.score.overall}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{attempt.text}</p>
                  <p className="text-[10px] font-medium text-slate-400">{new Date(attempt.timestamp).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => {
                  setCurrentAttempt(attempt);
                  setSelectedItem(items.find(i => i.text === attempt.text) || null);
                  setView('result');
                }}>
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPractice = () => (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => setView('list')}>
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Practice</h2>
      </div>

      <Card className="p-10 text-center space-y-8 border-none shadow-2xl shadow-primary/5">
        <div className="space-y-4">
          <Badge variant="primary" className="px-4 py-1">{selectedItem?.category}</Badge>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">{selectedItem?.text}</h1>
          {selectedItem?.ipa && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-mono text-primary font-bold tracking-widest">{selectedItem.ipa}</span>
              <button className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Volume2 size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.2 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-rose-500 rounded-full"
                />
              )}
            </AnimatePresence>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative z-10 ${
                isRecording ? 'bg-rose-500 text-white shadow-xl shadow-rose-200' : 'bg-primary text-white shadow-xl shadow-primary/30'
              }`}
            >
              {isRecording ? <Square size={32} /> : <Mic size={32} />}
            </button>
          </div>
          
          <div className="space-y-1">
            <p className={`text-sm font-black uppercase tracking-[0.2em] ${isRecording ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
              {isRecording ? 'Recording...' : 'Tap to Record'}
            </p>
            {isRecording && <p className="text-2xl font-mono font-black text-slate-900">{formatTime(recordingTime)}</p>}
          </div>
        </div>
      </Card>

      {audioBlob && !isRecording && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <button className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <Play size={20} fill="currentColor" />
            </button>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-primary" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">0:02</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="py-6 rounded-[1.5rem]" onClick={() => setAudioBlob(null)}>
              <RotateCcw size={18} className="mr-2" /> Retake
            </Button>
            <Button className="py-6 rounded-[1.5rem]" onClick={analyze}>
              <Sparkles size={18} className="mr-2" /> Analyze
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderAnalyzing = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-primary/10 border-t-primary rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <Sparkles size={40} />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">Analyzing Pronunciation</h2>
        <p className="text-slate-500 font-medium">Our AI is processing your speech patterns...</p>
      </div>
      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    </div>
  );

  const renderResult = () => {
    if (!currentAttempt) return null;
    const { score, feedback, phonemes } = currentAttempt;

    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={resetPractice}>
            <ChevronLeft size={24} />
          </Button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Results</h2>
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => setView('list')}>
            <X size={24} />
          </Button>
        </div>

        <Card className="p-10 text-center space-y-6 border-none bg-gradient-to-br from-primary to-accent text-white shadow-2xl shadow-primary/20">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Overall Score</p>
            <h1 className="text-7xl font-black tracking-tighter">{score.overall}</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            {score.overall >= 90 ? (
              <Badge variant="glass" className="bg-white/20 border-none px-4 py-1">Excellent</Badge>
            ) : score.overall >= 80 ? (
              <Badge variant="glass" className="bg-white/20 border-none px-4 py-1">Great</Badge>
            ) : (
              <Badge variant="glass" className="bg-white/20 border-none px-4 py-1">Good</Badge>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</span>
              <span className="text-lg font-black text-slate-900">{score.accuracy}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score.accuracy}%` }}
                className="h-full bg-emerald-500" 
              />
            </div>
          </div>
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fluency</span>
              <span className="text-lg font-black text-slate-900">{score.fluency}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score.fluency}%` }}
                className="h-full bg-blue-500" 
              />
            </div>
          </div>
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stress</span>
              <span className="text-lg font-black text-slate-900">{score.stress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score.stress}%` }}
                className="h-full bg-amber-500" 
              />
            </div>
          </div>
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intonation</span>
              <span className="text-lg font-black text-slate-900">{score.intonation}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score.intonation}%` }}
                className="h-full bg-purple-500" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Feedback</h3>
          <div className="space-y-4">
            {feedback.map((text, i) => (
              <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Info size={16} />
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {phonemes && phonemes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Sound Analysis</h3>
            <div className="space-y-4">
              {phonemes.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono text-xl font-black ${
                        p.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        /{p.phoneme}/
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{p.isCorrect ? 'Perfect Sound' : 'Needs Work'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phoneme Score: {p.score}%</p>
                      </div>
                    </div>
                    {p.isCorrect ? <CheckCircle2 className="text-emerald-500" size={24} /> : <AlertCircle className="text-rose-500" size={24} />}
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">{p.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button className="w-full py-6 rounded-[1.5rem]" onClick={resetPractice}>
            Practice Again
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'list' && renderList()}
          {view === 'practice' && renderPractice()}
          {view === 'analyzing' && renderAnalyzing()}
          {view === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
