import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { vocabularyService } from '../services/vocabularyService';
import { authService } from '../services/authService';
import { speechService } from '../services/speechService';
import { Card, Button, Skeleton, Badge } from '../components/UI';
import { SRSLevel, VocabularyWord } from '../types';
import { Search, Volume2, Bookmark, Trash2, ChevronRight, Sparkles, BookOpen, Filter, Link as LinkIcon, Mic, Languages } from 'lucide-react';

interface VocabularyPageProps {
  onPracticePronunciation?: (word: any) => void;
}

export const VocabularyPage: React.FC<VocabularyPageProps> = ({ onPracticePronunciation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    const loadWords = async () => {
      const allWords = await vocabularyService.getWords();
      setWords(allWords);
      setIsLoading(false);
    };
    loadWords();
  }, []);

  const filteredVocab = useMemo(() => {
    return words.filter(word => 
      word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, words]);

  const handleDelete = async (id: string) => {
    await vocabularyService.removeWord(id);
    const allWords = await vocabularyService.getWords();
    setWords(allWords);
  };

  const handlePronunciation = async (text: string) => {
    try {
      await speechService.speak(text);
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
      // Fallback or user feedback could be added here
    }
  };

  return (
    <div className="space-y-10 pb-24">
      <header className="space-y-6">
        <div className="flex justify-between items-end">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-primary">
              <BookOpen size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Your Library</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-slate-900">Word Bank</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
          >
            <Filter size={20} />
          </motion.div>
        </div>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search your saved words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-14 pr-6 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300"
          />
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {filteredVocab.length} Words Saved
          </span>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
            Sort by: Newest <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <Card key={i} className="p-6 space-y-4 border-none shadow-sm">
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-1/3 rounded-xl" />
                    <Skeleton className="h-6 w-1/4 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </Card>
              ))
            ) : (
              filteredVocab.map((word, idx) => (
                <motion.div
                  layout
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-none bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black font-display tracking-tight text-slate-900 group-hover:text-primary transition-colors">{word.text}</h3>
                            <div className="flex items-center gap-1.5">
                              {word.srsLevel && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-[8px] px-2 py-0.5 border-none ${
                                    word.srsLevel === SRSLevel.MASTERED ? 'bg-emerald-50 text-emerald-600' :
                                    word.srsLevel === SRSLevel.REVIEW ? 'bg-blue-50 text-blue-600' :
                                    word.srsLevel === SRSLevel.LEARNING ? 'bg-amber-50 text-amber-600' :
                                    'bg-slate-50 text-slate-400'
                                  }`}
                                >
                                  {word.srsLevel.toUpperCase()}
                                </Badge>
                              )}
                              {word.isDifficult && (
                                <Badge variant="destructive" className="text-[8px] px-2 py-0.5 bg-rose-50 text-rose-600 border-none">
                                  DIFFICULT
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-primary font-mono text-xs font-bold uppercase tracking-widest opacity-60">{word.ipa}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1.5">Mastery</div>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${word.mastery}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-primary to-accent" 
                              />
                            </div>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePronunciation(word.text || word.word)}
                            className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            <Volume2 size={16} />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Languages size={12} className="text-primary/40" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                          {authService.getCurrentUser()?.preferences?.nativeLanguage || 'Native'} Translation
                        </span>
                      </div>
                      <p className="text-slate-500 text-lg leading-relaxed mb-6 font-medium line-clamp-2">
                        {word.translation || word.meaning}
                      </p>

                      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-primary/40" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                              Added {new Date(word.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {word.sourceSpeechId && (
                            <div className="flex items-center gap-1.5 text-primary/40">
                              <LinkIcon size={10} />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Source: {word.sourceSpeechId.split('-')[0]}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            onClick={() => onPracticePronunciation?.(word)}
                            className="w-10 h-10 p-0 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                          >
                            <Mic size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleDelete(word.id)}
                            className="w-10 h-10 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={18} />
                          </Button>
                          <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all">
                            <Bookmark size={18} fill="currentColor" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {!isLoading && filteredVocab.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 space-y-8"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-slate-100">
                <Search className="text-slate-200" size={40} />
              </div>
              <div className="space-y-3">
                <p className="font-black text-2xl text-slate-900">No words found</p>
                <p className="text-slate-400 font-medium text-lg max-w-[280px] mx-auto leading-relaxed">Try searching for a different term or add new words from speeches.</p>
              </div>
              <Button variant="outline" className="rounded-2xl px-8 py-4 font-bold" onClick={() => setSearchQuery('')}>Clear Search</Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
