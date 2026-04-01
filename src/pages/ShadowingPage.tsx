import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button, Badge } from '../components/UI';
import { Mic2, Play, Clock, Sparkles, ChevronRight, Youtube, ArrowRight, Loader2, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { Speech } from '../types';
import { MOCK_SPEECHES } from '../data/speeches';
import { progressService } from '../services/progressService';
import { speechService } from '../services/speechService';

interface ShadowingPageProps {
  onSelectSpeech: (speech: Speech) => void;
}

export const ShadowingPage: React.FC<ShadowingPageProps> = ({ onSelectSpeech }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [speechProgressMap, setSpeechProgressMap] = useState<Record<string, number>>({});
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [lastImportedSpeech, setLastImportedSpeech] = useState<Speech | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    const videoId = speechService.extractVideoId(youtubeUrl);
    setPreviewVideoId(videoId);
  }, [youtubeUrl]);

  useEffect(() => {
    const loadAllProgress = async () => {
      const progressMap: Record<string, number> = {};
      for (const speech of MOCK_SPEECHES) {
        const totalSegments = speech.transcript?.segments.length || 10;
        progressMap[speech.id] = await progressService.getOverallProgress(speech.id, totalSegments);
      }
      setSpeechProgressMap(progressMap);
    };
    loadAllProgress();
  }, []);

  const handleYoutubeImport = async () => {
    if (!youtubeUrl) return;
    setImportError(null);
    
    if (!speechService.validateYoutubeUrl(youtubeUrl)) {
      setImportError('Please enter a valid YouTube URL');
      return;
    }

    setIsImporting(true);
    try {
      const importedSpeech = await speechService.importFromYoutube(youtubeUrl);
      setLastImportedSpeech(importedSpeech);
      // In a real app, we'd add this to a list of user-imported speeches
      onSelectSpeech(importedSpeech);
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to import video. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubtitleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lastImportedSpeech) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const result = await speechService.parseSubtitleFile(file, lastImportedSpeech.videoId);
      // Update the speech object with the new transcript
      const updatedSpeech: Speech = {
        ...lastImportedSpeech,
        transcript: result,
        readiness: 'ready'
      };
      setLastImportedSpeech(updatedSpeech);
      setUploadSuccess('Subtitles loaded successfully');
      // Open the player with the updated speech after a short delay to show success
      setTimeout(() => {
        onSelectSpeech(updatedSpeech);
        setUploadSuccess(null);
      }, 1500);
    } catch (error) {
      console.error('Subtitle upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Could not parse subtitle file');
    } finally {
      setIsUploading(false);
    }
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'no_transcript': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'error': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getReadinessLabel = (readiness: string) => {
    switch (readiness) {
      case 'ready': return 'Ready to Study';
      case 'processing': return 'Processing Transcript...';
      case 'no_transcript': return 'No Transcript Available';
      case 'error': return 'Import Error';
      default: return 'Unknown Status';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-12 pb-24"
    >
      {/* Header */}
      <header className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-xs font-black uppercase tracking-widest border border-primary/10"
        >
          <Sparkles size={14} />
          Master Rhythm & Intonation
        </motion.div>
        <h1 className="text-5xl font-black font-display tracking-tight text-slate-900">Shadowing</h1>
        <p className="text-slate-400 text-lg max-w-[320px] mx-auto leading-relaxed font-medium">
          Imitate native speakers in real-time to unlock natural fluency.
        </p>
      </header>

      {/* YouTube Import Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
            <Youtube size={24} />
          </div>
          <h3 className="text-2xl font-black font-display tracking-tight text-slate-900">Import from YouTube</h3>
        </div>
        
        <Card className="p-8 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="space-y-2 relative z-10">
            <p className="text-sm text-slate-400 font-medium px-2">Paste any YouTube URL to generate a custom shadowing session.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    if (importError) setImportError(null);
                  }}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-4 text-sm font-bold focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 ${
                    importError ? 'focus:ring-rose-500/20 ring-2 ring-rose-500/10' : 'focus:ring-primary/20'
                  }`}
                />
              </div>
              <Button 
                className="rounded-2xl px-8 font-black" 
                onClick={handleYoutubeImport}
                disabled={isImporting || !youtubeUrl}
              >
                {isImporting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                <span className="hidden sm:inline ml-2">Import</span>
              </Button>
            </div>

            {lastImportedSpeech && (lastImportedSpeech.readiness === 'no_transcript' || !lastImportedSpeech.transcript) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm overflow-hidden flex-shrink-0">
                    <img src={lastImportedSpeech.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">{lastImportedSpeech.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Transcript missing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-white"
                    onClick={() => document.getElementById('page-srt-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Activity size={14} />}
                    Upload Subtitles
                  </Button>
                  <input 
                    id="page-srt-upload"
                    type="file"
                    accept=".srt,.vtt"
                    className="hidden"
                    onChange={handleSubtitleUpload}
                  />
                </div>
              </motion.div>
            )}
            
            {uploadError && (
              <p className="mt-2 text-[10px] text-rose-500 font-bold px-2 flex items-center gap-1.5">
                <AlertCircle size={12} />
                {uploadError}
              </p>
            )}

            {uploadSuccess && (
              <p className="mt-2 text-[10px] text-emerald-500 font-bold px-2 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                {uploadSuccess}
              </p>
            )}
            
            <AnimatePresence>
              {importError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-rose-500 text-xs font-bold px-2"
                >
                  <AlertCircle size={14} />
                  {importError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview Section */}
          <AnimatePresence>
            {previewVideoId && !importError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="pt-4 border-t border-slate-100"
              >
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                    <img 
                      src={`https://img.youtube.com/vi/${previewVideoId}/mqdefault.jpg`} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ready to Import</p>
                    <h4 className="font-bold text-slate-900 line-clamp-1">YouTube Video Detected</h4>
                    <p className="text-xs text-slate-400 font-medium">Click import to generate your study session.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* Main Action Hub */}
      <div className="flex flex-col items-center justify-center py-10 space-y-12">
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl -z-10"
          />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="aspect-square w-64 rounded-[4rem] glass flex items-center justify-center relative shadow-2xl border-white/40 cursor-pointer group"
            onClick={() => onSelectSpeech(MOCK_SPEECHES[0])}
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-8 rounded-[3rem] border-2 border-primary/20 group-hover:border-primary/40 transition-colors"
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Mic2 size={80} className="text-primary group-hover:scale-110 transition-transform duration-500" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Tap to Start</span>
            </div>
          </motion.div>
        </div>
        
        <div className="text-center space-y-8 w-full max-w-sm">
          <div className="space-y-3">
            <h2 className="text-3xl font-black font-display text-slate-900">Ready to Speak?</h2>
            <p className="text-lg text-slate-400 font-medium">Start a quick session with our featured speech.</p>
          </div>
          <Button 
            className="w-full py-6 text-xl rounded-[2rem] shadow-2xl shadow-primary/20 font-black tracking-tight" 
            onClick={() => onSelectSpeech(MOCK_SPEECHES[0])}
          >
            Start Quick Session
          </Button>
        </div>
      </div>

      {/* Recommended Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-black font-display tracking-tight text-slate-900">Popular for Shadowing</h3>
          <button className="text-slate-400 font-bold text-sm hover:text-primary transition-colors">See All</button>
        </div>
        <div className="grid gap-6">
          {MOCK_SPEECHES.slice(0, 3).map((speech, idx) => (
            <motion.div
              key={speech.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.8 }}
            >
              <Card 
                className="p-5 flex gap-6 items-center cursor-pointer hover:bg-slate-50 transition-all duration-500 border-none group" 
                onClick={() => onSelectSpeech(speech)}
              >
                <div className="w-28 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                  <img 
                    src={speech.thumbnail} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} fill="white" className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{speech.title}</h4>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getReadinessColor(speech.readiness)}`}>
                      {getReadinessLabel(speech.readiness)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px]">{speech.difficulty}</Badge>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={12} />
                      {speech.duration}
                    </div>
                    {(speechProgressMap[speech.id] || 0) > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <CheckCircle2 size={12} />
                        {speechProgressMap[speech.id]}%
                      </div>
                    )}
                  </div>
                  {(speechProgressMap[speech.id] || 0) > 0 && (
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${speechProgressMap[speech.id]}%` }}
                      />
                    </div>
                  )}
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-primary transition-colors" />
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
