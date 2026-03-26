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
import { vocabularyService } from '../services/vocabularyService';
import { PronunciationAttempt, PronunciationPracticeItem, PronunciationScore, VocabularyWord } from '../types';

type ViewState = 'list' | 'practice' | 'analyzing' | 'result';

interface PronunciationPageProps {
  initialItem?: any;
  onClearInitialItem?: () => void;
}

export const PronunciationPage: React.FC<PronunciationPageProps> = ({ initialItem, onClearInitialItem }) => {
  const [view, setView] = useState<ViewState>('list');
  const [items, setItems] = useState<PronunciationPracticeItem[]>([]);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [selectedItem, setSelectedItem] = useState<PronunciationPracticeItem | null>(null);
  const [attempts, setAttempts] = useState<PronunciationAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<PronunciationAttempt | null>(null);
  
  // Recording states
  const [recordingState, setRecordingState] = useState<'idle' | 'requesting' | 'recording' | 'stopped' | 'recorded' | 'error'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [volume, setVolume] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(12).fill(0));
  const [isSilent, setIsSilent] = useState(false);
  const silenceCounterRef = useRef(0);

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
      const vocab = await vocabularyService.getWords();
      setVocabularyWords(vocab);
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
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);

        // Silence detection
        if (average < 5) {
          silenceCounterRef.current += 1;
          if (silenceCounterRef.current > 150) { // ~3 seconds at 60fps
            setIsSilent(true);
          }
        } else {
          silenceCounterRef.current = 0;
          setIsSilent(false);
        }

        // Get frequency bands for visualization
        const bands = 12;
        const step = Math.floor(dataArray.length / bands);
        const newFreqData = [];
        for (let i = 0; i < bands; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
          }
          newFreqData.push(sum / step);
        }
        setFrequencyData(newFreqData);
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 4. Start recording
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/ogg;codecs=opus';
        
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setIsSilent(false);
      silenceCounterRef.current = 0;

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
    if (!selectedItem || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speechService.speak(selectedItem.text, { slow: isSlowMode });
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
    } finally {
      setIsSpeaking(false);
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

      {vocabularyWords.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">From Your Vocabulary</h2>
            <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none">{vocabularyWords.length} Words</Badge>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {vocabularyWords.slice(0, 10).map((word) => (
              <Card 
                key={word.id}
                onClick={() => {
                  setSelectedItem({
                    id: word.id,
                    text: word.word || word.text || '',
                    ipa: word.ipa || '',
                    type: 'word',
                    category: 'Vocabulary'
                  });
                  setView('practice');
                }}
                className="p-4 min-w-[160px] flex-shrink-0 cursor-pointer hover:border-primary/20 transition-all bg-white"
              >
                <div className="space-y-2">
                  <p className="font-black text-slate-900 truncate">{word.word || word.text}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{word.ipa || '/.../'}</p>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="text-[10px] font-black uppercase tracking-widest">Practice</span>
                    <ArrowRight size={10} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => setView('list')}>
            <ChevronLeft size={24} />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Practice Session</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedItem?.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSlowMode(!isSlowMode)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              isSlowMode ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            <Activity size={12} className={isSlowMode ? "animate-pulse" : ""} />
            {isSlowMode ? 'Slow' : 'Normal'}
          </button>
          <Badge variant="glass" className="bg-primary/5 text-primary border-none">
            {selectedItem?.type === 'word' ? 'Word Focus' : 'Sentence Flow'}
          </Badge>
        </div>
      </div>

      <Card className="p-10 text-center space-y-10 border-none shadow-2xl shadow-primary/5 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: recordingState === 'recording' ? '100%' : 0 }}
            transition={{ duration: 10, ease: "linear" }}
            className="h-full bg-primary"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">{selectedItem?.text}</h1>
            {selectedItem?.ipa && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono text-primary/60 font-medium tracking-[0.2em]">{selectedItem.ipa}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-3">
            <button 
              disabled={isSpeaking}
              onClick={playTargetAudio}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-lg ${
                isSpeaking 
                  ? 'bg-primary text-white animate-pulse shadow-primary/20' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              <Volume2 size={20} className={isSpeaking ? "animate-bounce" : ""} />
              {isSpeaking ? 'Speaking...' : 'Listen to Target'}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 pt-4">
          <div className="relative">
            <AnimatePresence>
              {recordingState === 'recording' && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.4 + (volume / 40), opacity: 0.2 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.8 + (volume / 25), opacity: 0.1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="flex gap-1 items-end h-8">
                      {frequencyData.map((val, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: 4 + (val / 4) }}
                          className="w-1 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </AnimatePresence>
            
            {isSilent && recordingState === 'recording' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm z-20 flex items-center gap-2"
              >
                <AlertCircle size={12} />
                No sound detected
              </motion.div>
            )}
            
            <button 
              onClick={recordingState === 'recording' ? stopRecording : startRecording}
              disabled={recordingState === 'recorded' || recordingState === 'requesting'}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all relative z-10 shadow-2xl ${
                recordingState === 'recording' 
                  ? 'bg-rose-500 text-white shadow-rose-200 scale-95' 
                : recordingState === 'requesting'
                  ? 'bg-primary/20 text-primary animate-pulse cursor-wait'
                : recordingState === 'recorded'
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : recordingState === 'error'
                  ? 'bg-rose-100 text-rose-500 border-2 border-rose-200'
                  : 'bg-primary text-white shadow-primary/30 hover:scale-105 active:scale-95'
              }`}
            >
              {recordingState === 'recording' ? <Square size={40} fill="white" /> : 
               recordingState === 'requesting' ? <Activity size={40} className="animate-pulse" /> :
               recordingState === 'error' ? <AlertCircle size={40} /> :
               <Mic size={40} />}
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                recordingState === 'recording' ? 'text-rose-500' : 
                recordingState === 'requesting' ? 'text-primary' :
                recordingState === 'recorded' ? 'text-emerald-500' : 
                recordingState === 'error' ? 'text-rose-500' : 'text-slate-400'
              }`}>
                {recordingState === 'recording' ? 'Recording Voice...' : 
                 recordingState === 'requesting' ? 'Initializing Mic...' :
                 recordingState === 'recorded' ? 'Voice Captured' : 
                 recordingState === 'error' ? 'Mic Error' : 'Ready to Record'}
              </p>
              <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                {(recordingState === 'recording' || recordingState === 'requesting') && (
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/2 bg-primary"
                  />
                )}
              </div>
            </div>
            
            {recordingState === 'recording' && (
              <p className="text-4xl font-mono font-black text-slate-900 tabular-nums">{formatTime(recordingTime)}</p>
            )}
          </div>
        </div>

        {micError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex flex-col gap-4 text-rose-600"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-sm uppercase tracking-widest">Access Denied</p>
                <p className="text-sm font-medium leading-relaxed opacity-80">{micError}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full py-6 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-100 font-bold"
              onClick={startRecording}
            >
              Grant Permission & Retry
            </Button>
          </motion.div>
        )}
      </Card>

      {audioBlob && recordingState === 'recorded' && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Info size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro Tip</p>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Speak clearly and at a natural pace. Ensure you're in a quiet environment for the most accurate analysis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <button 
              onClick={() => {
                const audio = new Audio(URL.createObjectURL(audioBlob));
                audio.play();
              }}
              className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <PlayCircle size={32} />
            </button>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Attempt</p>
                <span className="text-xs font-mono font-bold text-slate-900">{formatTime(recordingTime)}</span>
              </div>
              <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: recordingTime, ease: "linear" }}
                  className="h-full bg-primary rounded-full" 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="py-8 rounded-[2rem] border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs" onClick={() => setRecordingState('idle')}>
              <RotateCcw size={18} className="mr-2" /> Retake
            </Button>
            <Button className="py-8 rounded-[2rem] gradient-primary shadow-neon text-white font-black uppercase tracking-widest text-xs" onClick={analyze}>
              <Sparkles size={18} className="mr-2" /> Analyze Now
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderAnalyzing = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = [
      "Analyzing speech patterns...",
      "Evaluating vowel clarity...",
      "Checking syllable stress...",
      "Measuring rhythm and flow...",
      "Calculating expert feedback..."
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % messages.length);
      }, 1500);
      return () => clearInterval(interval);
    }, []);

    return (
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {messages[messageIndex]}
          </h2>
          <p className="text-slate-500 font-medium max-w-[280px] mx-auto">
            Our AI is processing your recording to give you the most accurate feedback.
          </p>
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
  };

  const renderResult = () => {
    if (!currentAttempt) return null;
    const { score, feedback, strengths, improvements, phonemes, words } = currentAttempt;

    const previousAttempts = attempts.filter(a => a.text === currentAttempt.text && a.id !== currentAttempt.id);
    const bestScore = previousAttempts.length > 0 ? Math.max(...previousAttempts.map(a => a.score.overall)) : null;
    const improvement = bestScore !== null ? score.overall - bestScore : null;

    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={resetPractice}>
            <ChevronLeft size={24} />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Analysis Report</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attempt {attempts.filter(a => a.text === currentAttempt.text).length}</p>
          </div>
          <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => setView('list')}>
            <X size={24} />
          </Button>
        </div>

        <Card className="p-10 text-center space-y-6 border-none bg-slate-900 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <Activity className="w-full h-full scale-150" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Pronunciation Score</p>
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-8xl font-black tracking-tighter">{score.overall}</h1>
                {improvement !== null && (
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black ${improvement >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {improvement >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                    {improvement >= 0 ? `+${improvement}` : improvement}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <Badge variant="glass" className={`${
                score.overall >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 
                score.overall >= 80 ? 'bg-blue-500/20 text-blue-400' : 
                'bg-amber-500/20 text-amber-400'
              } border-none px-6 py-2 text-sm font-black`}>
                {score.overall >= 90 ? 'NATIVE-LIKE' : score.overall >= 80 ? 'PROFICIENT' : 'DEVELOPING'}
              </Badge>
            </div>

            {currentAttempt.verdict && (
              <p className="text-sm font-medium text-slate-300 max-w-[320px] mx-auto leading-relaxed italic">
                "{currentAttempt.verdict}"
              </p>
            )}

            {bestScore !== null && (
              <div className="pt-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
                <span>Personal Best: {bestScore}</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span>{improvement !== null && improvement > 0 ? 'New Record!' : 'Keep Pushing'}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Comparison Section */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="py-8 rounded-[2rem] border-slate-200 flex flex-col gap-2 h-auto"
            onClick={playTargetAudio}
          >
            <Volume2 size={20} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Expert Audio</span>
          </Button>
          <Button 
            variant="outline" 
            className="py-8 rounded-[2rem] border-slate-200 flex flex-col gap-2 h-auto"
            onClick={() => {
              if (currentAttempt.audioUrl) {
                const audio = new Audio(currentAttempt.audioUrl);
                audio.play();
              }
            }}
          >
            <PlayCircle size={20} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest">Your Recording</span>
          </Button>
        </div>

        {/* Detailed Word Breakdown */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Word Breakdown</h3>
          <div className="flex flex-wrap gap-4">
            {words?.map((word, idx) => (
              <div key={idx} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 min-w-[120px]">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-lg font-black text-slate-900">{word.text}</span>
                  <span className={`text-xs font-black ${word.score >= 85 ? 'text-emerald-500' : word.score >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {word.score}%
                  </span>
                </div>
                <div className="flex gap-1">
                  {word.syllables.map((syl, sIdx) => (
                    <div 
                      key={sIdx} 
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                        syl.score >= 85 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        syl.score >= 70 ? 'bg-amber-50 border-amber-100 text-amber-600' :
                        'bg-rose-50 border-rose-100 text-rose-600'
                      } ${syl.isStressed ? 'ring-2 ring-primary/20 ring-offset-1' : ''}`}
                    >
                      {syl.text}
                      {syl.isStressed && <span className="ml-1 text-primary">ˈ</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Accuracy', val: score.accuracy, color: 'bg-emerald-500', icon: <CheckCircle2 size={12} /> },
            { label: 'Fluency', val: score.fluency, color: 'bg-blue-500', icon: <Activity size={12} /> },
            { label: 'Stress', val: score.stress, color: 'bg-amber-500', icon: <Sparkles size={12} /> },
            { label: 'Intonation', val: score.intonation, color: 'bg-purple-500', icon: <TrendingUp size={12} /> }
          ].map((metric) => (
            <div key={metric.label} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${metric.color.replace('bg-', 'bg-')}/10 ${metric.color.replace('bg-', 'text-')}`}>
                    {metric.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</span>
                </div>
                <span className="text-lg font-black text-slate-900">{metric.val}%</span>
              </div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.val}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full ${metric.color}`} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expert Feedback</h3>
            <div className="grid grid-cols-1 gap-3">
              {strengths?.map((s, i) => (
                <div key={i} className="p-5 bg-emerald-50/30 rounded-3xl border border-emerald-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Strength</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{s}</p>
                  </div>
                </div>
              ))}
              {improvements?.map((s, i) => (
                <div key={i} className="p-5 bg-amber-50/30 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Improvement</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {phonemes && phonemes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phoneme Analysis</h3>
            <div className="space-y-4">
              {phonemes.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-mono text-3xl font-black ${
                        p.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        /{p.phoneme}/
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900">{p.isCorrect ? 'Correct' : 'Needs Work'}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${p.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${p.score}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{p.score}%</span>
                        </div>
                      </div>
                    </div>
                    {p.isCorrect ? <CheckCircle2 className="text-emerald-500" size={24} /> : <AlertCircle className="text-rose-500" size={24} />}
                  </div>
                  <div className={`p-4 rounded-2xl border flex gap-3 ${
                    p.isCorrect ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-rose-50/30 border-rose-100/50'
                  }`}>
                    <Info size={16} className={`shrink-0 mt-0.5 ${p.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`} />
                    <div className="space-y-1">
                      <p className={`text-xs font-bold leading-relaxed ${p.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {p.feedback}
                      </p>
                      {p.tip && (
                        <p className={`text-[10px] font-medium italic ${p.isCorrect ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>
                          Tip: {p.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-10 flex flex-col gap-4">
          <Button className="w-full py-8 rounded-[2rem] gradient-primary shadow-neon text-white font-black uppercase tracking-widest text-sm" onClick={resetPractice}>
            Practice Again
          </Button>
          <Button variant="ghost" className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]" onClick={() => setView('list')}>
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
