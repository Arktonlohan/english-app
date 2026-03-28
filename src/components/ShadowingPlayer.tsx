import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Speech, Word, TranscriptResult, TranscriptSegment, TranscriptStatus } from '../types';
import { Button, Card, Badge } from './UI';
import { speechService } from '../services/speechService';
import { vocabularyService } from '../services/vocabularyService';
import { progressService } from '../services/progressService';
import { AuthProvider, useAuth } from '../context/AuthContext';
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
  Sparkles,
  Activity
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
  const [bookmarksMode, setBookmarksMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [difficultSentenceIds, setDifficultSentenceIds] = useState<string[]>([]);
  const [completedSentenceIds, setCompletedSentenceIds] = useState<string[]>([]);
  const [bookmarkedSentenceIds, setBookmarkedSentenceIds] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [savedWordsCount, setSavedWordsCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const { user, updatePreferences } = useAuth();
  const [subtitleSize, setSubtitleSize] = useState<'sm' | 'md' | 'lg'>(user?.preferences?.subtitleSize || 'md');
  
  // Transcript State
  const [transcriptResult, setTranscriptResult] = useState<TranscriptResult | null>(null);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [isLoopingSentence, setIsLoopingSentence] = useState(false);
  const [showSizeControl, setShowSizeControl] = useState(false);
  
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
      // If speech already has a valid transcript (e.g. from upload), use it
      if (speech.transcript && speech.transcript.segments && speech.transcript.segments.length > 0) {
        setTranscriptResult(speech.transcript);
        setIsTranscriptLoading(false);
        return;
      }

      setIsTranscriptLoading(true);
      setTranscriptError(null);
      try {
        const result = await speechService.getTranscript(speech.id);
        setTranscriptResult(result);
      } catch (error) {
        console.error('Failed to fetch transcript:', error);
        setTranscriptError('Transcript unavailable for this video.');
      } finally {
        setIsTranscriptLoading(false);
      }
    };

    fetchTranscript();
  }, [speech.id, speech.transcript]);

  const segments = useMemo(() => {
    return transcriptResult?.segments || [];
  }, [transcriptResult]);

  const activeSegmentIndex = useMemo(() => {
    if (!segments.length) return -1;
    
    // Find the segment that contains the current time
    const idx = segments.findIndex(
      s => currentTime >= s.start && currentTime < s.end
    );
    
    // If no exact match, find the closest upcoming segment
    if (idx === -1) {
      return segments.findIndex(s => s.start > currentTime);
    }
    
    return idx;
  }, [segments, currentTime]);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await progressService.getSpeechProgress(speech.id);
      setDifficultSentenceIds(progress.difficultSentenceIds);
      setCompletedSentenceIds(progress.completedSentenceIds);
      setBookmarkedSentenceIds(progress.bookmarkedSentenceIds || []);
      const overall = await progressService.getOverallProgress(speech.id, segments.length);
      setOverallProgress(overall);
      const savedCount = await vocabularyService.getSavedWordsCountForSpeech(speech.id);
      setSavedWordsCount(savedCount);

      if (progress.lastPosition > 5) {
        setShowResumeDialog(true);
      }
    };
    loadProgress();
  }, [speech.id, segments.length]);

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
            segmentsCompleted: currentProgress.completedSentenceIds.length,
            difficultSentencesReviewed: currentProgress.difficultSentenceIds.length,
            wordsSaved: await vocabularyService.getSavedWordsCountForSpeech(speech.id)
          });
          await progressService.addTimeSpent(speech.id, duration);
        }
      };
      saveFinalSession();
    };
  }, [speech.id, sessionStartTime]);

  // Sync current time with YouTube player
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && playerRef.current) {
      interval = setInterval(async () => {
        if (!playerRef.current) return;
        
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // Save position periodically (every 5 seconds)
        const now = Date.now();
        if (now - lastSavedTimeRef.current > 5000) {
          await progressService.saveLastPosition(speech.id, time);
          lastSavedTimeRef.current = now;
        }

        // Mark sentence as completed if we've reached the end
        if (activeSegmentIndex !== -1) {
          const currentSegment = segments[activeSegmentIndex];
          if (time >= currentSegment.end - 0.5) {
            await progressService.markSentenceCompleted(speech.id, currentSegment.id);
            setCompletedSentenceIds(prev => 
              prev.includes(currentSegment.id) ? prev : [...prev, currentSegment.id]
            );
            const overall = await progressService.getOverallProgress(speech.id, segments.length);
            setOverallProgress(overall);
          }
        }

        // Handle Auto-Pause
        if (autoPause && activeSegmentIndex !== -1) {
          const currentSegment = segments[activeSegmentIndex];
          if (time >= currentSegment.end - 0.1) {
            setIsPlaying(false);
            playerRef.current.pauseVideo();
          }
        }

        // Handle Looping
        if ((loopMode === 'sentence' || isLoopingSentence) && activeSegmentIndex !== -1) {
          const currentSegment = segments[activeSegmentIndex];
          if (time >= currentSegment.end) {
            playerRef.current.seekTo(currentSegment.start, true);
          }
        }

        // Handle Difficult Mode Skipping
        if (difficultMode && activeSegmentIndex !== -1) {
          const currentSegment = segments[activeSegmentIndex];
          if (!difficultSentenceIds.includes(currentSegment.id) && time >= currentSegment.start) {
            // Skip to next difficult sentence
            const nextDifficult = segments.find(s => s.start > time && difficultSentenceIds.includes(s.id));
            if (nextDifficult) {
              playerRef.current.seekTo(nextDifficult.start, true);
            } else {
              // No more difficult sentences, maybe stop or loop back
              const firstDifficult = segments.find(s => difficultSentenceIds.includes(s.id));
              if (firstDifficult) {
                playerRef.current.seekTo(firstDifficult.start, true);
              }
            }
          }
        }
      }, 50); // More frequent updates for smoother sync
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, autoPause, loopMode, activeSegmentIndex, segments, speech.id, difficultMode, difficultSentenceIds, isLoopingSentence]);

  // Auto-scroll transcript
  useEffect(() => {
    if (activeSegmentIndex !== -1 && transcriptContainerRef.current) {
      const activeElement = transcriptContainerRef.current.children[activeSegmentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeSegmentIndex]);

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

  const handleRepeatSentence = () => {
    if (activeSegmentIndex !== -1 && playerRef.current) {
      const currentSegment = segments[activeSegmentIndex];
      playerRef.current.seekTo(currentSegment.start, true);
      playerRef.current.playVideo();
    }
  };

  const handleGoBack5s = () => {
    if (playerRef.current) {
      const newTime = Math.max(0, currentTime - 5);
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleGoForward5s = () => {
    if (playerRef.current) {
      const newTime = currentTime + 5;
      playerRef.current.seekTo(newTime, true);
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

  const toggleLoopSentence = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLoopingSentence(!isLoopingSentence);
  };

  const handleSentenceClick = (segment: TranscriptSegment) => {
    if (playerRef.current) {
      playerRef.current.seekTo(segment.start, true);
      playerRef.current.playVideo();
    }
  };
  const handleWordClickFromText = async (wordText: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const cleanWord = wordText.replace(/[.,!?;:()]/g, '');
    
    // Create a basic Word object
    const word: Word = {
      text: cleanWord,
      startTime: currentTime,
      endTime: currentTime,
      meaning: 'Loading definition...',
      translation: 'Loading translation...',
      ipa: '/.../',
      example: segments[activeSegmentIndex]?.text || ''
    };
    
    setSelectedWord(word);
    setIsSaved(vocabularyService.isWordSaved(cleanWord));
    
    // Attempt to fetch real details
    try {
      const entries = await vocabularyService.lookupWord(cleanWord);
      if (entries && entries.length > 0) {
        const entry = entries[0];
        const meaning = entry.meanings[0]?.definitions[0]?.definition || 'Definition unavailable';
        
        setSelectedWord(prev => prev ? {
          ...prev,
          meaning,
          ipa: entry.phonetic || entry.phonetics[0]?.text || '/.../'
        } : null);
      }
    } catch (e) {
      console.error('Lookup failed', e);
    }
  };

  const handleSaveWord = async () => {
    if (!selectedWord) return;
    
    const isAlreadySaved = vocabularyService.isWordSaved(selectedWord.text);
    if (isAlreadySaved) {
      setIsSaved(true);
      return;
    }
    
    const wordToSave = {
      word: selectedWord.text,
      ipa: selectedWord.ipa || '/.../', 
      translation: selectedWord.translation || 'Translation unavailable', 
      exampleSentence: segments[activeSegmentIndex]?.text || selectedWord.example || 'Example unavailable', 
      sourceSpeechId: speech.id,
      sourceSentenceId: segments[activeSegmentIndex]?.id
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

  const toggleSubtitleSize = (size: 'sm' | 'md' | 'lg') => {
    setSubtitleSize(size);
    updatePreferences({ subtitleSize: size });
    setShowSizeControl(false);
  };

  const speakWord = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speechService.speak(text, { slow: isSlowMode });
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
    } finally {
      setIsSpeaking(false);
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

  const toggleBookmark = async (sentenceId: string) => {
    const isNowBookmarked = await progressService.toggleBookmarkedSentence(speech.id, sentenceId);
    if (isNowBookmarked) {
      setBookmarkedSentenceIds(prev => [...prev, sentenceId]);
    } else {
      setBookmarkedSentenceIds(prev => prev.filter(id => id !== sentenceId));
    }
  };

  const handleGenerateAITranscript = async () => {
    setIsGeneratingTranscript(true);
    setTranscriptError(null);
    try {
      const newTranscript = await speechService.generateAITranscript(speech.id);
      setTranscriptResult(newTranscript);
    } catch (error) {
      console.error('Failed to generate AI transcript:', error);
      setTranscriptError('AI Transcription failed. Please try again later.');
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleSubtitleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscriptLoading(true);
    setTranscriptError(null);
    try {
      const result = await speechService.parseSubtitleFile(file, videoId || undefined);
      setTranscriptResult(result);
    } catch (error) {
      console.error('Subtitle upload failed:', error);
      setTranscriptError(error instanceof Error ? error.message : 'Failed to parse subtitle file.');
    } finally {
      setIsTranscriptLoading(false);
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
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isFocusMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {transcriptResult?.source === 'uploaded-subtitle' ? 'Custom Subtitles' : 'Shadowing Mode'}
              </span>
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
           <button 
            onClick={() => setBookmarksMode(!bookmarksMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${bookmarksMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-400 hover:bg-slate-100'}`}
            title="Bookmarked Sentences Mode"
          >
            <Bookmark size={20} />
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
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${isFocusMode ? 'bg-slate-950' : 'bg-white'}`}>
        {/* Video Section (Fixed) */}
        <div className={`flex-none relative transition-all duration-700 ease-in-out ${isFocusMode ? 'aspect-video max-w-5xl mx-auto mt-4 rounded-3xl shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)]' : 'aspect-video w-full'} bg-black overflow-hidden z-20`}>
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
          
          {/* Custom Play Overlay */}
          {!isPlaying && videoId && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10" onClick={togglePlay}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Play size={40} fill="currentColor" />
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800/50">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
              style={{ width: `${videoProgress || 0}%` }}
            />
          </div>
        </div>

        {/* Scrollable Transcript Panel */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {/* Overall Progress Bar (Hidden in Focus Mode) */}
          {!isFocusMode && (
            <div className="px-6 py-6 bg-slate-50/50 border-b border-slate-100">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Mastery</p>
                      <p className="text-base font-black text-slate-900">{overallProgress}%</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sentences</p>
                      <p className="text-xs font-bold text-slate-600">{completedSentenceIds.length}/{segments.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Saved</p>
                      <p className="text-xs font-bold text-primary">{savedWordsCount}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full gradient-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transcript Content */}
          <div className={`px-6 py-10 max-w-3xl mx-auto space-y-8 transition-all duration-500`}>
            {isTranscriptLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                  />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Analyzing Speech</h3>
                  <p className="text-slate-500 font-medium animate-pulse">Syncing transcript with video timeline...</p>
                </div>
              </div>
            ) : (transcriptResult?.status === 'unavailable' || segments.length === 0) ? (
              <div className="py-12 flex flex-col items-center text-center px-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-md w-full p-10 rounded-[3rem] border-2 border-dashed transition-all duration-500 ${
                    isFocusMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${
                    isFocusMode ? 'bg-white/10 text-white' : 'bg-white text-primary shadow-sm border border-slate-100'
                  }`}>
                    <FileQuestion size={40} />
                  </div>
                  
                  <h3 className={`text-2xl font-black mb-4 tracking-tight ${isFocusMode ? 'text-white' : 'text-slate-900'}`}>
                    Transcript is not available yet.
                  </h3>
                  
                  <p className={`font-medium leading-relaxed mb-10 ${isFocusMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    We couldn't find captions for this video. You can try generating one with AI or upload your own.
                  </p>
                  
                  <div className="space-y-4 mb-10">
                    <Button 
                      className="w-full py-6 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                      onClick={handleGenerateAITranscript}
                      disabled={isGeneratingTranscript}
                    >
                      {isGeneratingTranscript ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Generate with AI
                        </>
                      )}
                    </Button>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                        onClick={() => document.getElementById('srt-upload')?.click()}
                      >
                        <Activity size={16} />
                        Upload .SRT / .VTT
                      </Button>
                      <input 
                        id="srt-upload"
                        type="file"
                        accept=".srt,.vtt"
                        className="hidden"
                        onChange={handleSubtitleUpload}
                      />
                      <Button 
                        variant="ghost"
                        className="flex-1 py-4 rounded-xl text-sm font-bold"
                        onClick={onBack}
                      >
                        Go Back
                      </Button>
                    </div>
                  </div>
                  
                  {transcriptError && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={14} />
                      {transcriptError}
                    </div>
                  )}
                  
                  <div className={`p-6 rounded-2xl text-left border ${
                    isFocusMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 text-primary">
                        <Info size={20} />
                      </div>
                      <div className="space-y-3">
                        <p className={`text-sm font-black uppercase tracking-wider ${isFocusMode ? 'text-white' : 'text-slate-900'}`}>
                          Pro Tip
                        </p>
                        <p className={`text-xs font-medium leading-relaxed ${isFocusMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Curated videos always have high-quality, verified transcripts ready for practice.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div 
                ref={transcriptContainerRef}
                className="space-y-6 pb-40"
              >
                {segments.map((segment, sIdx) => {
                  const isDifficult = difficultSentenceIds.includes(segment.id);
                  const isCompleted = completedSentenceIds.includes(segment.id);
                  const isBookmarked = bookmarkedSentenceIds.includes(segment.id);
                  const isActive = sIdx === activeSegmentIndex;
                  
                  return (
                    <motion.div
                      key={segment.id}
                      onClick={() => {
                        if (playerRef.current) {
                          playerRef.current.seekTo(segment.start, true);
                          playerRef.current.playVideo();
                        }
                      }}
                      className={`
                        relative p-8 rounded-[2.5rem] transition-all duration-500 cursor-pointer group border-2
                        ${isActive 
                          ? `bg-primary/10 border-primary/40 scale-[1.02] shadow-[0_0_60px_rgba(var(--primary-rgb),0.3)] ring-4 ring-primary/10` 
                          : isFocusMode ? 'bg-white/5 border-transparent hover:bg-white/10' : 'bg-white hover:bg-slate-50 border-transparent'}
                        ${isDifficult && !isActive ? 'border-rose-100/50 bg-rose-50/5' : ''}
                        ${isCompleted && !isActive ? 'opacity-40 grayscale-[0.5]' : ''}
                      `}
                      animate={{
                        opacity: isActive ? 1 : (isCompleted ? 0.4 : (isFocusMode ? 0.6 : 0.9)),
                        scale: isActive ? 1.02 : 1
                      }}
                    >
                      {/* Active Glow Effect */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeGlow"
                          className="absolute inset-0 rounded-[2.5rem] bg-primary/20 blur-2xl -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}

                      <div className="flex flex-wrap gap-x-2 gap-y-3 justify-center">
                        {segment.text.split(/\s+/).map((word, idx) => (
                          <span 
                            key={idx}
                            onClick={(e) => handleWordClickFromText(word, e)}
                            className={`
                              cursor-pointer transition-all inline-block font-black text-center
                              ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : isFocusMode ? 'text-white/80' : 'text-slate-800'} 
                              ${subtitleSize === 'sm' ? 'text-lg' : subtitleSize === 'lg' ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}
                              hover:scale-110 hover:text-primary
                            `}
                          >
                            {word}
                          </span>
                        ))}
                      </div>

                      {/* Sentence Translation */}
                      <AnimatePresence>
                        {showTranslation && segment.translation && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-primary/10 text-center"
                          >
                            <p className={`text-slate-500 font-medium leading-relaxed italic ${subtitleSize === 'sm' ? 'text-sm' : subtitleSize === 'lg' ? 'text-xl' : 'text-lg'}`}>
                              {segment.translation}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Controls (Simplified & Compact) */}
      <div className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-4 px-6 pointer-events-none z-50">
        <div className={`glass rounded-full p-2 flex items-center gap-1 shadow-2xl pointer-events-auto border transition-all duration-500 ${isFocusMode ? 'bg-white/10 border-white/10' : 'bg-white/90 border-white/30'} backdrop-blur-3xl`}>
          <button 
            onClick={togglePlaybackRate}
            className={`w-9 h-9 rounded-full flex flex-col items-center justify-center transition-all ${playbackRate < 1 ? 'bg-primary text-white' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="text-[8px] font-black">{playbackRate}x</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowSizeControl(!showSizeControl)}
              className={`w-9 h-9 rounded-full flex flex-col items-center justify-center transition-all ${showSizeControl ? 'bg-primary text-white' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="text-[8px] font-black uppercase">{subtitleSize}</span>
            </button>
            
            <AnimatePresence>
              {showSizeControl && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white rounded-2xl shadow-2xl border border-slate-100 p-1 flex flex-col gap-0.5 min-w-[80px]"
                >
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSubtitleSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${
                        subtitleSize === size ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className={`w-px h-5 mx-1 ${isFocusMode ? 'bg-white/10' : 'bg-slate-200'}`} />

          <button 
            onClick={handleGoBack5s}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <SkipBack size={14} />
          </button>

          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>

          <button 
            onClick={handleGoForward5s}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <SkipForward size={14} />
          </button>

          <div className={`w-px h-5 mx-1 ${isFocusMode ? 'bg-white/10' : 'bg-slate-200'}`} />

          <button 
            onClick={() => setShowTranslation(!showTranslation)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${showTranslation ? 'bg-primary text-white' : isFocusMode ? 'text-white/60 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Languages size={14} />
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
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={isSpeaking}
                        onClick={() => speakWord(selectedWord.text)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isSpeaking 
                            ? 'bg-primary text-white animate-pulse shadow-lg shadow-primary/20' 
                            : 'bg-primary/5 text-primary hover:bg-primary/10'
                        }`}
                      >
                        <Volume2 size={20} className={isSpeaking ? "animate-bounce" : ""} />
                      </button>
                      <button 
                        onClick={() => setIsSlowMode(!isSlowMode)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isSlowMode 
                            ? 'bg-amber-100 text-amber-600 shadow-sm' 
                            : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Slow Mode"
                      >
                        <Activity size={18} className={isSlowMode ? "animate-pulse" : ""} />
                      </button>
                    </div>
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
                    <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">
                      {user?.preferences?.nativeLanguage || 'Native'} Translation
                    </h4>
                    <p className="text-primary text-xl font-black leading-tight">
                      {selectedWord.translation || 'Translation unavailable'}
                    </p>
                  </div>
                </div>

                <div className="p-8 border-2 border-slate-50 rounded-[2.5rem] relative space-y-4">
                  <div className="absolute -top-3 left-8 bg-white px-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Contextual Examples</div>
                  <div className="space-y-4">
                    <p className="text-slate-500 italic text-xl font-medium leading-relaxed">
                      "{selectedWord.example || 'Example unavailable'}"
                    </p>
                    {vocabularyService.getVocabularyWordByText(selectedWord.text)?.exampleSentence2 && (
                      <p className="text-primary/60 italic text-lg font-medium leading-relaxed border-t border-slate-50 pt-4">
                        "{vocabularyService.getVocabularyWordByText(selectedWord.text)?.exampleSentence2}"
                      </p>
                    )}
                  </div>
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
