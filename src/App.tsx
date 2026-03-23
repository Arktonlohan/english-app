import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TabType, Speech } from './types';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { ShadowingPage } from './pages/ShadowingPage';
import { ProgressPage } from './pages/ProgressPage';
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
  const [selectedPracticeItem, setSelectedPracticeItem] = useState<any>(null);
  const { status } = useAuth();

  const handlePracticePronunciation = (item: any) => {
    setSelectedPracticeItem(item);
    setActiveTab('pronunciation');
  };

  const renderContent = () => {
    const props = {
      onTabChange: setActiveTab,
      onSelectSpeech: setSelectedSpeech,
      onPracticePronunciation: handlePracticePronunciation,
    };

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {(() => {
          switch (activeTab) {
            case 'home': return <HomePage {...props} />;
            case 'speeches': return <SpeechesPage onSelectSpeech={setSelectedSpeech} />;
            case 'shadowing': return <ShadowingPage onSelectSpeech={setSelectedSpeech} />;
            case 'vocabulary': return <VocabularyPage onPracticePronunciation={handlePracticePronunciation} />;
            case 'flashcards': return <FlashcardsPage />;
            case 'pronunciation': return (
              <PronunciationPage 
                initialItem={selectedPracticeItem} 
                onClearInitialItem={() => setSelectedPracticeItem(null)} 
              />
            );
            case 'progress': return <ProgressPage />;
            default: return <HomePage {...props} />;
          }
        })()}
      </motion.div>
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-8 overflow-hidden">
        <Logo size="xl" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-3"
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-400 font-medium text-lg">Your journey to fluency begins...</p>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
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
            onBack={() => setSelectedSpeech(null)} 
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
