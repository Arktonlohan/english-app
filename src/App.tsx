import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TabType, Speech, TranscriptResult } from './types';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { ShadowingPage } from './pages/ShadowingPage';
import { ProgressPage } from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import { SpeechesPage } from './pages/SpeechesPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { PronunciationPage } from './pages/PronunciationPage';
import { AuthPage } from './pages/AuthPage';
import { Logo } from './components/Logo';
import { ShadowingPlayer } from './components/ShadowingPlayer';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedSpeech, setSelectedSpeech] = useState<Speech | null>(null);
  const [uploadedTranscript, setUploadedTranscript] = useState<TranscriptResult | null>(null);
  const [selectedPracticeItem, setSelectedPracticeItem] = useState<any>(null);
  const { status, isReady } = useAuth();

  const handlePracticePronunciation = (item: any) => {
    setSelectedPracticeItem(item);
    setActiveTab('pronunciation');
  };

  const renderContent = () => {
    const props = {
      onTabChange: setActiveTab,
      onSelectSpeech: (speech: Speech, transcript?: TranscriptResult) => {
        setSelectedSpeech(speech);
        if (transcript) setUploadedTranscript(transcript);
        else setUploadedTranscript(null);
      },
      onPracticePronunciation: handlePracticePronunciation,
    };

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {(() => {
          switch (activeTab) {
            case 'home': return <HomePage {...props} />;
            case 'shadowing': return <ShadowingPage onSelectSpeech={props.onSelectSpeech} />;
            case 'videos': return <SpeechesPage onSelectSpeech={props.onSelectSpeech} />;
            case 'vocabulary': return <VocabularyPage onPracticePronunciation={handlePracticePronunciation} />;
            case 'flashcards': return <FlashcardsPage />;
            case 'pronunciation': return (
              <PronunciationPage 
                initialItem={selectedPracticeItem} 
                onClearInitialItem={() => setSelectedPracticeItem(null)} 
              />
            );
            case 'progress': return <ProgressPage />;
            case 'settings': return <SettingsPage />;
            default: return <HomePage {...props} />;
          }
        })()}
      </motion.div>
    );
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse" />
        
        <div className="relative z-10 space-y-6">
          <Logo size="xl" showText={false} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-display font-bold gradient-text glow-text">Falai</h1>
            <p className="text-soft-pink font-medium tracking-widest uppercase text-xs mt-2">Speak Like a Native</p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10 space-y-3"
        >
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-400 font-medium">Your journey to fluency begins...</p>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <main className="max-w-md mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence>
        {selectedSpeech && (
          <ShadowingPlayer 
            speech={selectedSpeech} 
            transcript={uploadedTranscript || undefined}
            onBack={() => {
              setSelectedSpeech(null);
              setUploadedTranscript(null);
            }} 
            onPracticePronunciation={handlePracticePronunciation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
