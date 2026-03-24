import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Speech, Sentence, Word, Transcript } from '../types';
import { Button, Card, Badge } from './UI';
import { vocabularyService } from '../services/vocabularyService';
import { progressService } from '../services/progressService';
import { speechService } from '../services/speechService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  Settings, 
  Mic, 
  Volume2, 
  X,
  Bookmark,
  CheckCircle2,
  Info,
  SkipBack,
  SkipForward,
  Repeat,
  Languages,
  Zap,
  History,
  AlertCircle,
  PlayCircle,
  Brain,
  Trophy,
  Loader2,
  FileQuestion,
  Sparkles
} from 'lucide-react';

interface ShadowingPlayerProps {
  speech: Speech;
  onBack: () => void;
  onPracticePronunciation?: (word: any) => void;
}

export const ShadowingPlayer: React.FC<ShadowingPlayerProps> = ({ speech, onBack, onPracticePronunciation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loopMode, setLoopMode] = useState<'none' | 'sentence' | 'paragraph'>('none');
  const [autoPause, setAutoPause] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [difficultMode, setDifficultMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [difficultSentenceIds, setDifficultSentenceIds] = useState<string[]>([]);
  const [completedSentenceIds, setCompletedSentenceIds] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [savedWordsCount, setSavedWordsCount] = useState(0);
  
  // Transcript State
  const [transcript, setTranscript] = useState<Transcript | undefined>(speech.transcript);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);

  const videoId = useMemo(() => {
    if (speech.videoId) return speech.videoId;
    if (!speech.youtubeUrl) return null;
    return speechService.extractVideoId(speech.youtubeUrl);
  }, [speech.videoId, speech.youtubeUrl]);

  // Fetch transcript if needed
  useEffect(() => {
    const fetchTranscript = async () => {
      if (!transcript || transcript.state === 'loading') {
        setIsTranscriptLoading(true);
        setTranscriptError(null);
        try {
          const fetchedTranscript = await speechService.getTranscript(speech.id);
          setTranscript(fetchedTranscript);
        } catch (error) {
          console.error('Failed to fetch transcript:', error);
          setTranscriptError('Transcript unavailable for this video.');
        } finally {
          setIsTranscriptLoading(false);
        }
      }
    };

    fetchTranscript();
  }, [speech.id, transcript]);

  const sentences = useMemo(() => {
    return transcript?.sentences || [];
  }, [transcript]);

  const filteredSentences = useMemo(() => {
    if (!difficultMode) return sentences;
    return sentences.filter(s => difficultSentenceIds.includes(s.id));
  }, [sentences, difficultMode, difficultSentenceIds]);

  const activeSentenceIndex = useMemo(() => {
    return sentences.findIndex(
      s => currentTime >= s.startTime && currentTime <= s.endTime
    );
  }, [sentences, currentTime]);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await progressService.getSpeechProgress(speech.id);
      setDifficultSentenceIds(progress.difficultSentenceIds);
      setCompletedSentenceIds(progress.completedSentenceIds);
      const overall = await progressService.getOverallProgress(speech.id, sentences.length);
      setOverallProgress(overall);
      setSavedWordsCount(vocabularyService.getSavedWordsCountForSpeech(speech.id));

      if (progress.lastPosition > 5) {
        setShowResumeDialog(true);
      }
    };
    loadProgress();
  }, [speech.id, sentences.length]);

  // Session Tracking Cleanup
  useEffect(() => {
    return () => {
      const saveFinalSession = async () => {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);
        
        if (duration > 10) { // Only save sessions longer than 10 seconds
          const currentProgress = await progressService.getSpeechProgress(speech.id);
          await progressService.saveSession({
            id: `session-${Date.now()}`,
            speechId: speech.id,
            startTime: sessionStartTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            sentencesCompleted: currentProgress.completedSentenceIds.length,
            difficultSentencesReviewed: currentProgress.difficultSentenceIds.length,
            wordsSaved: vocabularyService.getSavedWordsCountForSpeech(speech.id)
          });
          await progressService.addTimeSpent(speech.id, duration);
        }
      };
      saveFinalSession();
    };
  }, [speech.id, sessionStartTime]);

  // Sync current time with YouTube player
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      timeUpdateIntervalRef.current = setInterval(async () => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // Save position periodically (every 5 seconds)
        const now = Date.now();
        if (now - lastSavedTimeRef.current > 5000) {
          await progressService.saveLastPosition(speech.id, time);
          lastSavedTimeRef.current = now;
        }

        // Mark sentence as completed if we've reached the end
        if (activeSentenceIndex !== -1) {
          const currentSentence = sentences[activeSentenceIndex];
          if (time >= currentSentence.endTime - 0.5) {
            await progressService.markSentenceCompleted(speech.id, currentSentence.id);
            setCompletedSentenceIds(prev => 
              prev.includes(currentSentence.id) ? prev : [...prev, currentSentence.id]
            );
            const overall = await progressService.getOverallProgress(speech.id, sentences.length);
            setOverallProgress(overall);
          }
        }

        // Handle Auto-Pause
        if (autoPause && activeSentenceIndex !== -1) {
          const currentSentence = sentences[activeSentenceIndex];
          if (time >= currentSentence.endTime - 0.1) {
            setIsPlaying(false);
            playerRef.current.pauseVideo();
          }
        }

        // Handle Looping
        if (loopMode === 'sentence' && activeSentenceIndex !== -1) {
          const currentSentence = sentences[activeSentenceIndex];
          if (time >= currentSentence.endTime) {
            playerRef.current.seekTo(currentSentence.startTime, true);
          }
        }

        // Handle Difficult Mode Skipping
        if (difficultMode && activeSentenceIndex !== -1) {
          const currentSentence = sentences[activeSentenceIndex];
          if (!difficultSentenceIds.includes(currentSentence.id) && time >= currentSentence.startTime) {
            // Skip to next difficult sentence
            const nextDifficult = sentences.find(s => s.startTime > time && difficultSentenceIds.includes(s.id));
            if (nextDifficult) {
              playerRef.current.seekTo(nextDifficult.startTime, true);
            } else {
              // No more difficult sentences, maybe stop or loop back
              const firstDifficult = sentences.find(s => difficultSentenceIds.includes(s.id));
              if (firstDifficult) {
                playerRef.current.seekTo(firstDifficult.startTime, true);
              }
            }
          }
        }
      }, 100);
    } else {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }
    return () => {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };
  }, [isPlaying, autoPause, loopMode, activeSentenceIndex, sentences, speech.id, difficultMode, difficultSentenceIds]);

  // Auto-scroll transcript
  useEffect(() => {
    if (activeSentenceIndex !== -1 && transcriptContainerRef.current) {
      const activeElement = transcriptContainerRef.current.children[activeSentenceIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeSentenceIndex]);

  const onPlayerReady: YouTubeProps['onReady'] = async (event) => {
    playerRef.current = event.target;
    playerRef.current.setPlaybackRate(playbackRate);
    
    // Position will be handled by Resume Dialog or initial load if no dialog
    const progress = await progressService.getSpeechProgress(speech.id);
    if (progress.lastPosition > 0 && !showResumeDialog) {
      playerRef.current.seekTo(progress.lastPosition, true);
      setCurrentTime(progress.lastPosition);
    }
  };

  const handleResume = async () => {
    const progress = await progressService.getSpeechProgress(speech.id);
    if (playerRef.current) {
      playerRef.current.seekTo(progress.lastPosition, true);
      playerRef.current.playVideo();
    }
    setShowResumeDialog(false);
  };

  const handleStartOver = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
    }
    setShowResumeDialog(false);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === YouTube.PlayerState.ENDED) {
      setIsPlaying(false);
      // Trigger session summary when video ends
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);
      if (duration > 5) {
        setShowSessionSummary(true);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };
  
  const handleWordClick = async (word: Word, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWord(word);
    const isSaved = await vocabularyService.isWordSaved(word.text);
    setIsSaved(isSaved);
  };

  const handleSentenceClick = (sentence: Sentence) => {
    if (playerRef.current) {
      playerRef.current.seekTo(sentence.startTime, true);
      playerRef.current.playVideo();
    }
  };

  const handleBack = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);
    
    if (duration > 5) {
      setShowSessionSummary(true);
    } else {
      onBack();
    }
  };

  const handleSaveWord = async () => {
    if (!selectedWord) return;
    
    const existingWord = await vocabularyService.getVocabularyWordByText(selectedWord.text);
    if (existingWord) {
      setIsSaved(true);
      return;
    }
    
    const wordToSave = {
      text: selectedWord.text,
      ipa: selectedWord.ipa || '/.../', 
      meaning: selectedWord.meaning || 'Definition unavailable', 
      example: selectedWord.example || 'Example unavailable', 
      translation: selectedWord.translation || 'Translation unavailable', 
      sourceSpeechId: speech.id,
      sourceSentenceId: sentences[activeSentenceIndex]?.id
    };

    await vocabularyService.addWord(wordToSave);
    
    setIsSaved(true);
    const newCount = await vocabularyService.getSavedWordsCountForSpeech(speech.id);
    setSavedWordsCount(newCount);
    await progressService.updateSavedWordsCount(speech.id, newCount);
  };

  const toggleLoopMode = () => {
    setLoopMode(prev => {
      if (prev === 'none') return 'sentence';
      if (prev === 'sentence') return 'paragraph';
      return 'none';
    });
  };

  const togglePlaybackRate = () => {
    const rates = [0.5, 0.75, 1];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(nextRate);
    }
  };

  const toggleDifficult = async (sentenceId: string) => {
    const isNowDifficult = await progressService.toggleDifficultSentence(speech.id, sentenceId);
    if (isNowDifficult) {
      setDifficultSentenceIds(prev => [...prev, sentenceId]);
    } else {
      setDifficultSentenceIds(prev => prev.filter(id => id !== sentenceId));
    }
  };

  const videoProgress = playerRef.current ? (currentTime / playerRef.current.getDuration()) * 100 : 0;

  const youtubeOptions: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      disablekb: 1,
    },
  };

  return (
    <div className={`fixed inset-0 bg-white z-50 flex flex-col overflow-hidden font-sans transition-colors duration-500 ${isFocusMode ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Header */}
      <header className={`px-6 py-4 flex items-center justify-between border-b transition-all duration-500 z-10 ${isFocusMode ? 'border-white/5 bg-slate-950/80' : 'border-slate-100 bg-white/80'} backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFocusMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className={`font-bold line-clamp-1 ${isFocusMode ? 'text-white' : 'text-slate-900'}`}>{speech.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={isFocusMode ? "glass" : "primary"} className="text-[10px] py-0 px-1.5">PREMIUM</Badge>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isFocusMode ? 'text-slate-500' : 'text-slate-400'}`}>Shadowing Mode</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFocusMode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-100'}`}
            title="Focus Mode"
          >
            <Zap size={20} />
          </button>
           <button 
            onClick={() => setDifficultMode(!difficultMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${difficultMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:bg-slate-100'}`}
            title="Difficult Sentences Mode"
          >
            <Brain size={20} />
          </button>
           {!isFocusMode && (
             <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showTranslation ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Languages size={20} />
            </button>
           )}
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Settings size={20} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto pb-40 transition-all duration-500 ${isFocusMode ? 'bg-slate-950' : 'bg-white'}`}>
        {/* Video Section */}
        <div className={`relative transition-all duration-700 ease-in-out ${isFocusMode ? 'aspect-video max-w-5xl mx-auto mt-10 rounded-[3rem] shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)]' : 'aspect-video w-full sticky top-0 z-20'} bg-black overflow-hidden`}>
          {videoId ? (
            <div className="w-full h-full pointer-events-none">
              <YouTube 
                videoId={videoId}
                opts={youtubeOptions}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white bg-slate-900">
              <AlertCircle className="mr-2" /> Invalid YouTube URL
            </div>
          )}
          
          {/* Focus Mode Subtitles Overlay */}
          <AnimatePresence>
            {isFocusMode && activeSentenceIndex !== -1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-x-0 bottom-12 px-12 text-center pointer-events-none"
              >
                <div className="bg-black/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 inline-block max-w-4xl">
                  <p className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                    {sentences[activeSentenceIndex].text}
                  </p>
                  {showTranslation && (
                    <p className="mt-4 text-xl text-white/60 font-medium italic">
                      {sentences[activeSentenceIndex].translation}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Custom Play Overlay */}
          {!isPlaying && videoId && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10" onClick={togglePlay}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Play size={40} fill="currentColor" />
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-800/50">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
              style={{ width: `${videoProgress || 0}%` }}
            />
          </div>
        </div>

        {/* Overall Progress Bar */}
        {!isFocusMode && (
          <div className="px-6 py-6 bg-slate-50 border-b border-slate-100">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Mastery</p>
                    <p className="text-lg font-black text-slate-900">{overallProgress}% Completed</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sentences</p>
                    <p className="text-sm font-bold text-slate-600">{completedSentenceIds.length} / {sentences.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Difficult</p>
                    <p className="text-sm font-bold text-rose-500">{difficultSentenceIds.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Saved</p>
                    <p className="text-sm font-bold text-primary">{savedWordsCount}</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="h-full gradient-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Transcript Section */}
        <div className={`px-6 py-10 max-w-3xl mx-auto space-y-12 transition-all duration-500 ${isFocusMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'}`}>
          <div 
            ref={transcriptContainerRef}
            className="space-y-10"
          >
            {/* Transcript Source Info */}
          {!isTranscriptLoading && transcript && transcript.state !== 'unavailable' && (
            <div className="flex items-center justify-center gap-4 pb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {transcript.state === 'mock' ? 'Sample Transcript' : 'AI Verified Transcript'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <Brain size={12} className="text-primary" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ready for Shadowing
                </span>
              </div>
            </div>
          )}

          {isTranscriptLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative">
                  <Loader2 className="animate-spin text-primary" size={48} />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-slate-900 font-black text-xl tracking-tight">Analyzing Content</p>
                  <p className="text-slate-400 font-medium animate-pulse">Generating your personalized transcript...</p>
                </div>
              </div>
            ) : transcript?.state === 'unavailable' || transcriptError ? (
              <Card className="p-12 border-none bg-slate-50 rounded-[3.5rem] text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center text-slate-300 mx-auto shadow-xl border border-slate-100 relative z-10">
                  <FileQuestion size={48} />
                </div>
                
                <div className="space-y-3 relative z-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Transcript Unavailable</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    We couldn't automatically retrieve a transcript for this video. You can still watch and listen to the original audio.
                  </p>
                </div>
                
                <div className="pt-6 flex flex-col gap-4 max-w-sm mx-auto relative z-10">
                  <Button 
                    className="rounded-[1.5rem] py-6 font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                    onClick={() => {
                      // Force a mock transcript for study
                      setTranscript(speechService.generateMockTranscript(speech.id));
                      setTranscriptError(null);
                    }}
                  >
                    <Sparkles size={20} />
                    Try Sample Study Mode
                  </Button>
                  <button 
                    onClick={onBack}
                    className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors py-2"
                  >
                    Choose Another Video
                  </button>
                </div>
              </Card>
            ) : filteredSentences.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                  <AlertCircle size={32} />
                </div>
                <p className="text-slate-400 font-bold">No sentences found matching your filters.</p>
                <Button variant="secondary" onClick={() => setDifficultMode(false)}>
                  Show All Sentences
                </Button>
              </div>
            ) : (
              filteredSentences.map((sentence) => {
              const sIdx = sentences.findIndex(s => s.id === sentence.id);
              const isDifficult = difficultSentenceIds.includes(sentence.id);
              const isCompleted = completedSentenceIds.includes(sentence.id);
              
              return (
                <motion.div
                  key={sentence.id}
                  onClick={() => handleSentenceClick(sentence)}
                  className={`
                    relative p-8 rounded-[2.5rem] transition-all duration-500 cursor-pointer group border-2
                    ${sIdx === activeSentenceIndex 
                      ? 'bg-primary/5 shadow-2xl shadow-primary/5 border-primary/20' 
                      : 'bg-white hover:bg-slate-50 border-transparent'}
                    ${isDifficult && sIdx !== activeSentenceIndex ? 'border-rose-100 bg-rose-50/20' : ''}
                    ${isCompleted && sIdx !== activeSentenceIndex ? 'opacity-60' : ''}
                  `}
                  animate={{
                    scale: sIdx === activeSentenceIndex ? 1.02 : 1,
                    opacity: sIdx === activeSentenceIndex ? 1 : (difficultMode ? 1 : (isCompleted ? 0.6 : 0.9))
                  }}
                >
                  {/* Sentence Status Badges */}
                  <div className="absolute -top-3 left-8 flex gap-2">
                    {isDifficult && (
                      <Badge variant="warning" className="rounded-full px-2 py-0.5 text-[8px] font-black shadow-sm">Difficult</Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="success" className="rounded-full px-2 py-0.5 text-[8px] font-black shadow-sm">Mastered</Badge>
                    )}
                  </div>

                  {/* Sentence Controls */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                     <button 
                      onClick={(e) => { e.stopPropagation(); handleSentenceClick(sentence); }}
                      className="w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-90"
                      title="Replay Sentence"
                     >
                        <RotateCcw size={16} />
                     </button>
                     <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onPracticePronunciation?.({
                          text: sentence.text,
                          ipa: ''
                        });
                        onBack();
                      }}
                      className="w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-90"
                      title="Practice Pronunciation"
                     >
                        <Mic size={16} />
                     </button>
                     <button 
                      onClick={(e) => { e.stopPropagation(); toggleDifficult(sentence.id); }}
                      className={`w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isDifficult ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                      title="Mark as Difficult"
                     >
                        <AlertCircle size={16} />
                     </button>
                  </div>

                <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center">
                  {sentence.words.map((wordObj, wIdx) => {
                    const isWordActive = currentTime >= wordObj.startTime && currentTime <= wordObj.endTime;
                    return (
                      <motion.span
                        key={wIdx}
                        onClick={(e) => handleWordClick(wordObj, e)}
                        className={`
                          text-2xl md:text-3xl font-black cursor-pointer transition-all duration-300 rounded-xl px-1.5 py-0.5 relative
                          ${isWordActive 
                            ? 'text-primary' 
                            : 'text-slate-800'}
                        `}
                      >
                        {isWordActive && (
                          <motion.span 
                            layoutId="glow"
                            className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        {wordObj.text}
                      </motion.span>
                    );
                  })}
                </div>

                {/* Sentence Translation */}
                <AnimatePresence>
                  {showTranslation && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-primary/10 text-center"
                    >
                      <p className="text-slate-400 font-medium text-lg leading-relaxed italic">
                        {sentence.translation || "Translation unavailable"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Indicator per sentence */}
                {sIdx === activeSentenceIndex && (
                  <div className="absolute bottom-4 right-6 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-primary' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  </main>

      {/* Floating Controls */}
      <div className="fixed bottom-8 inset-x-0 flex flex-col items-center gap-4 px-6 pointer-events-none">
        {/* Mode Indicators */}
        <div className="flex gap-2 pointer-events-auto">
           {isFocusMode && (
             <Badge variant="glass" className="rounded-full px-3 py-1 flex items-center gap-1 shadow-lg border-white/10">
               <Zap size={10} /> Focus Mode
             </Badge>
           )}
           {autoPause && (
             <Badge variant="accent" className="rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
               <Pause size={10} /> Auto-Pause
             </Badge>
           )}
           {loopMode !== 'none' && (
             <Badge variant="primary" className="rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
               <Repeat size={10} /> Loop: {loopMode}
             </Badge>
           )}
        </div>

        <div className={`glass rounded-[3rem] p-4 flex items-center gap-3 shadow-2xl pointer-events-auto border transition-all duration-500 ${isFocusMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/30'} backdrop-blur-2xl`}>
          <button 
            onClick={togglePlaybackRate}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all ${playbackRate < 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <Zap size={16} className={playbackRate < 1 ? 'mb-0.5' : 'mb-0'} />
            <span className="text-[10px] font-black">{playbackRate}x</span>
          </button>
          
          <button 
            onClick={toggleLoopMode}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${loopMode !== 'none' ? 'bg-accent text-white shadow-lg shadow-accent/20' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <Repeat size={20} />
          </button>

          <div className={`w-px h-8 mx-1 ${isFocusMode ? 'bg-white/10' : 'bg-slate-200/50'}`} />

          <button 
            onClick={() => {
              if (playerRef.current) {
                const time = playerRef.current.getCurrentTime();
                playerRef.current.seekTo(Math.max(0, time - 5), true);
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <History size={20} />
          </button>

          <button 
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all relative group"
          >
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            onClick={() => setAutoPause(!autoPause)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${autoPause ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <PlayCircle size={20} />
          </button>

          <div className={`w-px h-8 mx-1 ${isFocusMode ? 'bg-white/10' : 'bg-slate-200/50'}`} />

          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <Mic size={20} />
          </button>

          <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-white/50'}`}>
            <Volume2 size={20} />
          </button>
        </div>
      </div>

      {/* Session Summary Dialog */}
      <AnimatePresence>
        {showSessionSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[3rem] p-10 shadow-2xl max-w-md w-full text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto">
                <Trophy size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Great Session!</h3>
                <p className="text-slate-500 font-medium">Here's what you achieved today:</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-2xl font-black text-slate-900">{Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)}m</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Spent</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-2xl font-black text-slate-900">{completedSentenceIds.length}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentences</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-2xl font-black text-slate-900">{difficultSentenceIds.length}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficult</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-2xl font-black text-slate-900">{savedWordsCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Words Saved</p>
                </div>
              </div>

              <Button className="w-full py-6 rounded-2xl text-lg font-bold" onClick={onBack}>
                Finish Session
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resume Dialog */}
      <AnimatePresence>
        {showResumeDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[3rem] p-10 shadow-2xl max-w-md w-full text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <History size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back!</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Would you like to continue where you left off or start from the beginning?
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button className="w-full py-6 rounded-2xl text-lg font-bold" onClick={handleResume}>
                  Resume Learning
                </Button>
                <Button variant="secondary" className="w-full py-6 rounded-2xl text-lg font-bold" onClick={handleStartOver}>
                  Start from Beginning
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Word Detail Modal */}
      <AnimatePresence>
        {selectedWord && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[4rem] p-10 z-[70] shadow-2xl max-w-2xl mx-auto"
            >
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                  <h3 className="text-5xl font-black text-slate-900 tracking-tight">{selectedWord.text}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-primary font-mono tracking-widest">{selectedWord.ipa || '/.../'}</span>
                    <button className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveWord}
                    className={`w-14 h-14 rounded-[1.5rem] border-2 flex items-center justify-center transition-all ${
                      isSaved ? 'bg-primary/10 border-primary/20 text-primary' : 'border-slate-50 text-slate-300 hover:text-primary hover:border-primary/20'
                    }`}
                  >
                    <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => setSelectedWord(null)}
                    className="w-14 h-14 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-3">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Meaning</h4>
                    <p className="text-slate-700 text-xl font-bold leading-tight">
                      {selectedWord.meaning || 'Definition unavailable'}
                    </p>
                  </div>
                  <div className="p-8 bg-primary/5 rounded-[2.5rem] space-y-3">
                    <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Translation</h4>
                    <p className="text-primary text-xl font-black leading-tight">
                      {selectedWord.translation || 'Translation unavailable'}
                    </p>
                  </div>
                </div>

                <div className="p-8 border-2 border-slate-50 rounded-[2.5rem] relative">
                  <div className="absolute -top-3 left-8 bg-white px-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Example</div>
                  <p className="text-slate-500 italic text-xl font-medium leading-relaxed">
                    "{selectedWord.example || 'Example unavailable'}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="py-8 rounded-[2rem] text-lg font-bold border-2"
                    onClick={() => {
                      if (selectedWord) {
                        onPracticePronunciation?.({
                          text: selectedWord.text,
                          ipa: selectedWord.ipa || '/.../'
                        });
                        onBack(); // Close player to see the new tab
                      }
                    }}
                  >
                    Practice Pronunciation
                  </Button>
                  <Button 
                    onClick={handleSaveWord}
                    className={`py-8 rounded-[2rem] text-lg font-bold shadow-xl transition-all ${isSaved ? 'bg-emerald-500 shadow-emerald-200' : 'shadow-primary/20'}`}
                  >
                    {isSaved ? <CheckCircle2 className="mr-2" /> : null}
                    {isSaved ? 'Saved!' : 'Save to Flashcards'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
