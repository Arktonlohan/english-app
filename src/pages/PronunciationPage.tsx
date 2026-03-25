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
import { speechService } from '../services/speechService';
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
  const [attempts, setAttempts] = useState<PronunciationAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<PronunciationAttempt | null>(null);
  
  // Recording states
  const [recordingState, setRecordingState] = useState<'idle' | 'requesting' | 'recording' | 'stopped' | 'recorded' | 'error'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (initialItem) {
      setSelectedItem({
        id: initialItem.id || Math.random().toString(),
        text: initialItem.text,
        ipa: initialItem.ipa || '',
        type: 'word',
        category: 'From Study'
      });
      setView('practice');
      onClearInitialItem?.();
    }
  }, [initialItem, onClearInitialItem]);

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

    window.addEventListener('falai_pronunciation_update', handleUpdate);
    return () => {
      window.removeEventListener('falai_pronunciation_update', handleUpdate);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    setRecordingState('requesting');
    
    try {
      // 1. Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BrowserNotSupported');
      }

      // 2. Request permission
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('PermissionDenied');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('NoDeviceFound');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw new Error('DeviceInUse');
        } else {
          throw err;
        }
      }
      
      // 3. Setup audio analysis for visual feedback
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 4. Start recording
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
        setRecordingState('recorded');
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      let errorMessage = 'Microphone access denied or unavailable.';
      
      if (err.message === 'BrowserNotSupported') {
        errorMessage = 'Your browser does not support audio recording. Please try a modern browser like Chrome or Safari.';
      } else if (err.message === 'PermissionDenied') {
        errorMessage = 'Microphone access blocked. Please enable it in your browser settings to practice pronunciation.';
      } else if (err.message === 'NoDeviceFound') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (err.message === 'DeviceInUse') {
        errorMessage = 'Microphone is already in use by another application or tab.';
      } else {
        errorMessage = `Recording failed: ${err.message || 'Unknown error'}`;
      }
      
      setMicError(errorMessage);
      setRecordingState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      
      setVolume(0);
    }
  };

  const analyze = async () => {
    if (!audioBlob || !selectedItem) return;
    
    setView('analyzing');
    try {
      const result = await pronunciationService.analyzePronunciation(selectedItem.text, audioBlob, recordingTime);
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
    setRecordingState('idle');
    setView('practice');
  };

  const playTargetAudio = async () => {
    if (!selectedItem) return;
    try {
      await speechService.speak(selectedItem.text);
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderList = () => (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-display tracking-tight text-slate-900">Pronunciation</h1>
        <p className="text-slate-500 font-medium">Master your accent with real-time feedback.</p>
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
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily Drill</h3>
          <Card 
            onClick={() => {
              setSelectedItem(items[0]);
              setView('practice');
            }}
            className="p-6 bg-gradient-to-br from-primary to-accent text-white border-none shadow-xl shadow-primary/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="glass" className="bg-white/20 border-none">Recommended</Badge>
              <Sparkles size={20} className="opacity-60" />
            </div>
            <h4 className="text-2xl font-black leading-tight mb-4 group-hover:scale-[1.02] transition-transform">{items[0].text}</h4>
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
              <span>Start practice drill</span>
              <ArrowRight size={14} />
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Practice Library</h2>
          <Badge variant="secondary">{items.length} Items</Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
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
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Attempt History</h2>
            <History size={20} className="text-slate-300" />
          </div>
          
          <div className="space-y-3">
            {attempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  attempt.score.overall >= 90 ? 'bg-emerald-50 text-emerald-600' :
                  attempt.score.overall >= 80 ? 'bg-blue-50 text-blue-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {attempt.score.overall}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{attempt.text}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    {new Date(attempt.timestamp).toLocaleDateString()} • {attempt.duration}s
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => {
                  setCurrentAttempt(attempt);
                  setSelectedItem(items.find(i => i.text === attempt.text) || {
                    id: 'hist',
                    text: attempt.text,
                    ipa: attempt.ipa || '',
                    type: 'word'
                  });
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Practice Session</h2>
      </div>

      <Card className="p-10 text-center space-y-8 border-none shadow-2xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none">{selectedItem?.category}</Badge>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">{selectedItem?.text}</h1>
          {selectedItem?.ipa && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-mono text-primary font-bold tracking-widest">{selectedItem.ipa}</span>
            </div>
          )}
          <button 
            onClick={playTargetAudio}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-bold text-sm"
          >
            <Volume2 size={18} />
            Listen to Target
          </button>
        </div>

        <div className="flex flex-col items-center gap-8 pt-4">
          <div className="relative">
            <AnimatePresence>
              {recordingState === 'recording' && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5 + (volume / 50), opacity: 0.2 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-rose-500 rounded-full"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 2 + (volume / 30), opacity: 0.1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-rose-500 rounded-full"
                  />
                </>
              )}
            </AnimatePresence>
            <button 
              onClick={recordingState === 'recording' ? stopRecording : startRecording}
              disabled={recordingState === 'recorded' || recordingState === 'requesting'}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all relative z-10 ${
                recordingState === 'recording' 
                  ? 'bg-rose-500 text-white shadow-2xl shadow-rose-200 scale-95' 
                : recordingState === 'requesting'
                  ? 'bg-primary/20 text-primary animate-pulse cursor-wait'
                : recordingState === 'recorded'
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : recordingState === 'error'
                  ? 'bg-rose-100 text-rose-500 border-2 border-rose-200'
                  : 'bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95'
              }`}
            >
              {recordingState === 'recording' ? <Square size={36} fill="white" /> : 
               recordingState === 'requesting' ? <Activity size={36} className="animate-pulse" /> :
               recordingState === 'error' ? <AlertCircle size={36} /> :
               <Mic size={36} />}
            </button>
          </div>
          
          <div className="space-y-2">
            <p className={`text-xs font-black uppercase tracking-[0.2em] ${
              recordingState === 'recording' ? 'text-rose-500 animate-pulse' : 
              recordingState === 'requesting' ? 'text-primary animate-pulse' :
              recordingState === 'recorded' ? 'text-emerald-500' : 
              recordingState === 'error' ? 'text-rose-500' : 'text-slate-400'
            }`}>
              {recordingState === 'recording' ? 'Recording Voice...' : 
               recordingState === 'requesting' ? 'Requesting Mic...' :
               recordingState === 'recorded' ? 'Recording Captured' : 
               recordingState === 'error' ? 'Recording Error' : 'Tap to Start Recording'}
            </p>
            {recordingState === 'recording' && (
              <p className="text-3xl font-mono font-black text-slate-900">{formatTime(recordingTime)}</p>
            )}
          </div>
        </div>

        {micError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3 text-rose-600 text-sm font-medium">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="flex-1 text-left">{micError}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-100"
              onClick={startRecording}
            >
              Try Again
            </Button>
          </div>
        )}
      </Card>

      {audioBlob && recordingState === 'recorded' && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <button 
              onClick={() => {
                const audio = new Audio(URL.createObjectURL(audioBlob));
                audio.play();
              }}
              className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <PlayCircle size={28} />
            </button>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Recording</p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: recordingTime }}
                  className="h-full bg-primary" 
                />
              </div>
            </div>
            <span className="text-sm font-mono font-bold text-slate-900">{formatTime(recordingTime)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="py-7 rounded-[2rem] border-slate-200 text-slate-600 font-bold" onClick={() => setRecordingState('idle')}>
              <RotateCcw size={20} className="mr-2" /> Retake
            </Button>
            <Button className="py-7 rounded-[2rem] gradient-primary shadow-neon text-white font-bold" onClick={analyze}>
              <Sparkles size={20} className="mr-2" /> Analyze Now
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderAnalyzing = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-10">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-[6px] border-primary/5 border-t-primary rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-primary"
          >
            <Activity size={48} />
          </motion.div>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Analyzing Speech</h2>
        <p className="text-slate-500 font-medium max-w-[280px] mx-auto">Evaluating accuracy, fluency, and intonation patterns...</p>
      </div>
      <div className="w-56 h-2 bg-slate-100 rounded-full overflow-hidden">
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
    const { score, feedback, strengths, improvements, phonemes } = currentAttempt;

    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={resetPractice}>
            <ChevronLeft size={24} />
          </Button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Practice Result</h2>
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => setView('list')}>
            <X size={24} />
          </Button>
        </div>

        <Card className="p-10 text-center space-y-6 border-none bg-gradient-to-br from-primary to-accent text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Activity className="w-full h-full scale-150" />
          </div>
          
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Overall Accuracy</p>
            <h1 className="text-8xl font-black tracking-tighter">{score.overall}</h1>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Badge variant="glass" className="bg-white/20 border-none px-6 py-2 text-sm font-black">
                {score.overall >= 90 ? 'NATIVE-LIKE' : score.overall >= 80 ? 'PROFICIENT' : 'DEVELOPING'}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Accuracy', val: score.accuracy, color: 'bg-emerald-500' },
            { label: 'Fluency', val: score.fluency, color: 'bg-blue-500' },
            { label: 'Stress', val: score.stress, color: 'bg-amber-500' },
            { label: 'Intonation', val: score.intonation, color: 'bg-purple-500' }
          ].map((metric) => (
            <div key={metric.label} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</span>
                <span className="text-lg font-black text-slate-900">{metric.val}%</span>
              </div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.val}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full ${metric.color}`} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {strengths && strengths.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} /> Key Strengths
              </h3>
              <div className="space-y-3">
                {strengths.map((s, i) => (
                  <div key={i} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-sm font-medium text-emerald-700">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {improvements && improvements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} /> Areas for Growth
              </h3>
              <div className="space-y-3">
                {improvements.map((s, i) => (
                  <div key={i} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-sm font-medium text-amber-700">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {phonemes && phonemes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Phoneme Breakdown</h3>
            <div className="space-y-4">
              {phonemes.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-black ${
                        p.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        /{p.phoneme}/
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{p.isCorrect ? 'Correct' : 'Incorrect'}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score: {p.score}%</p>
                      </div>
                    </div>
                    {p.isCorrect ? <CheckCircle2 className="text-emerald-500" size={28} /> : <AlertCircle className="text-rose-500" size={28} />}
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{p.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-4">
          <Button className="w-full py-7 rounded-[2rem] gradient-primary shadow-neon text-white font-bold" onClick={resetPractice}>
            Practice Again
          </Button>
          <Button variant="ghost" className="w-full py-4 text-slate-400 font-bold" onClick={() => setView('list')}>
            Back to Library
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
