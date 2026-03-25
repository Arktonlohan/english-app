import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { vocabularyService } from '../services/vocabularyService';
import { authService } from '../services/authService';
import { speechService } from '../services/speechService';
import { Card, Button, Skeleton, Badge } from '../components/UI';
import { SRSLevel, VocabularyWord, DictionaryEntry } from '../types';
import { 
  Search, Volume2, Bookmark, Trash2, ChevronRight, Sparkles, 
  BookOpen, Filter, Link as LinkIcon, Mic, Languages, 
  History, Star, Info, Plus, CheckCircle2, AlertCircle,
  ArrowRight, BookMarked, Activity
} from 'lucide-react';

interface VocabularyPageProps {
  onPracticePronunciation?: (word: any) => void;
}

type ViewMode = 'bank' | 'dictionary';

export const VocabularyPage: React.FC<VocabularyPageProps> = ({ onPracticePronunciation }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('bank');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  
  // Dictionary states
  const [dictionaryResults, setDictionaryResults] = useState<DictionaryEntry[]>([]);
  const [isSearchingDictionary, setIsSearchingDictionary] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<{ word: string; definition: string; ipa: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isSlowMode, setIsSlowMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [allWords, wotd] = await Promise.all([
        vocabularyService.getWords(),
        vocabularyService.getWordOfTheDay()
      ]);
      setWords(allWords);
      setWordOfTheDay(wotd);
      setRecentSearches(vocabularyService.getRecentSearches());
      setIsLoading(false);
    };
    loadData();

    const handleRecentUpdate = () => {
      setRecentSearches(vocabularyService.getRecentSearches());
    };
    window.addEventListener('fluent_recent_searches_update', handleRecentUpdate);
    window.addEventListener('fluent_vocabulary_update', async () => {
      const allWords = await vocabularyService.getWords();
      setWords(allWords);
    });

    return () => {
      window.removeEventListener('fluent_recent_searches_update', handleRecentUpdate);
    };
  }, []);

  const filteredVocab = useMemo(() => {
    return words.filter(word => 
      (word.word || word.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (word.translation || word.meaning || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, words]);

  const handleDictionarySearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingDictionary(true);
    setSearchError(null);
    try {
      const results = await vocabularyService.lookupWord(searchQuery);
      setDictionaryResults(results);
      if (results.length === 0) {
        setSearchError("We couldn't find that word in our dictionary.");
      }
    } catch (error) {
      setSearchError("Failed to connect to the dictionary service.");
    } finally {
      setIsSearchingDictionary(false);
    }
  };

  const handleSaveWord = async (entry: DictionaryEntry) => {
    const firstMeaning = entry.meanings[0];
    const firstDef = firstMeaning.definitions[0];
    
    await vocabularyService.addWord({
      word: entry.word,
      translation: firstDef.definition,
      ipa: entry.phonetic || entry.phonetics.find(p => p.text)?.text || '',
      exampleSentence: firstDef.example || '',
    });
  };

  const handleDelete = async (id: string) => {
    await vocabularyService.removeWord(id);
  };

  const handlePronunciation = async (text: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(text);
    try {
      await speechService.speak(text, { slow: isSlowMode });
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
      // In a real app, we'd show a toast here
    } finally {
      setIsSpeaking(null);
    }
  };

  const isWordSaved = (text: string) => vocabularyService.isWordSaved(text);

  return (
    <div className="space-y-10 pb-24">
      <header className="space-y-8">
        <div className="flex justify-between items-end">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-primary">
              <BookOpen size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Vocabulary Hub</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-slate-900">
              {viewMode === 'bank' ? 'Word Bank' : 'Dictionary'}
            </h1>
          </motion.div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setIsSlowMode(!isSlowMode)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                isSlowMode ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={isSlowMode ? "Slow Mode Active" : "Normal Speed"}
            >
              <Activity size={14} className={isSlowMode ? "animate-pulse" : ""} />
              {isSlowMode ? 'Slow' : 'Normal'}
            </button>
            <div className="w-px h-4 bg-slate-200 self-center mx-1" />
            <button 
              onClick={() => setViewMode('bank')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === 'bank' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              My Bank
            </button>
            <button 
              onClick={() => setViewMode('dictionary')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === 'dictionary' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Lookup
            </button>
          </div>
        </div>

        <form onSubmit={handleDictionarySearch} className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={viewMode === 'bank' ? "Search your saved words..." : "Look up any English word..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-5 pl-14 pr-6 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300 shadow-sm"
          />
          {viewMode === 'dictionary' && searchQuery && (
            <button 
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          )}
        </form>
      </header>

      <AnimatePresence mode="wait">
        {viewMode === 'bank' ? (
          <motion.div 
            key="bank"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {filteredVocab.length} Words Saved
              </span>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                Sort by: Newest <ChevronRight size={12} />
              </button>
            </div>

            <div className="grid gap-6">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <Card key={i} className="p-6 space-y-4 border-none shadow-sm">
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-1/3 rounded-xl" />
                      <Skeleton className="h-6 w-1/4 rounded-lg" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-md" />
                  </Card>
                ))
              ) : filteredVocab.length > 0 ? (
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
                              <h3 className="text-2xl font-black font-display tracking-tight text-slate-900 group-hover:text-primary transition-colors">{word.word || word.text}</h3>
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
                              </div>
                            </div>
                            <p className="text-primary font-mono text-xs font-bold uppercase tracking-widest opacity-60">{word.ipa}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isSpeaking === (word.word || word.text)}
                              onClick={() => handlePronunciation(word.word || word.text || '')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isSpeaking === (word.word || word.text)
                                  ? 'bg-primary text-white animate-pulse'
                                  : 'bg-primary/5 text-primary hover:bg-primary/10'
                              }`}
                            >
                              <Volume2 size={16} className={isSpeaking === (word.word || word.text) ? "animate-bounce" : ""} />
                            </motion.button>
                          </div>
                        </div>

                        <p className="text-slate-500 text-lg leading-relaxed mb-6 font-medium">
                          {word.translation || word.meaning}
                        </p>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Sparkles size={14} className="text-primary/40" />
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                Added {new Date(word.createdAt || word.addedAt || '').toLocaleDateString()}
                              </span>
                            </div>
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
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-24 space-y-8">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-slate-100">
                    <Search className="text-slate-200" size={40} />
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-2xl text-slate-900">No words found</p>
                    <p className="text-slate-400 font-medium text-lg max-w-[280px] mx-auto leading-relaxed">Try searching for a different term or look up new words in the dictionary.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dictionary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {/* Word of the Day */}
            {!dictionaryResults.length && !isSearchingDictionary && wordOfTheDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-8 bg-gradient-to-br from-primary to-accent text-white border-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-colors" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2 text-white/60">
                      <Sparkles size={16} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Word of the Day</span>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-5xl font-black font-display tracking-tight">{wordOfTheDay.word}</h2>
                      <p className="text-white/60 font-mono text-sm font-bold uppercase tracking-widest">{wordOfTheDay.ipa}</p>
                    </div>
                    <p className="text-white/90 text-xl font-medium leading-relaxed max-w-xl">
                      {wordOfTheDay.definition}
                    </p>
                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={() => {
                          setSearchQuery(wordOfTheDay.word);
                          handleDictionarySearch();
                        }}
                        className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 font-black uppercase tracking-widest text-[10px]"
                      >
                        Learn More
                      </Button>
                      <Button 
                        variant="ghost" 
                        disabled={isSpeaking === wordOfTheDay.word}
                        onClick={() => handlePronunciation(wordOfTheDay.word)}
                        className={`rounded-xl w-12 h-12 p-0 transition-all ${
                          isSpeaking === wordOfTheDay.word ? 'bg-white text-primary animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Volume2 size={20} className={isSpeaking === wordOfTheDay.word ? "animate-bounce" : ""} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Recent Searches */}
            {!dictionaryResults.length && !isSearchingDictionary && recentSearches.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-2 text-slate-400">
                  <History size={16} />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Recently Looked Up</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map(word => (
                    <button
                      key={word}
                      onClick={() => {
                        setSearchQuery(word);
                        handleDictionarySearch();
                      }}
                      className="px-5 py-3 bg-slate-50 hover:bg-primary/5 hover:text-primary rounded-2xl text-sm font-bold transition-all border border-transparent hover:border-primary/10"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Dictionary Results */}
            <div className="space-y-8">
              {isSearchingDictionary ? (
                <div className="space-y-8">
                  <Skeleton className="h-64 w-full rounded-[2rem]" />
                  <Skeleton className="h-48 w-full rounded-[2rem]" />
                </div>
              ) : searchError ? (
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto">
                    <AlertCircle className="text-rose-400" size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-xl text-slate-900">{searchError}</p>
                    <p className="text-slate-400 font-medium">Try checking the spelling or search for a different word.</p>
                  </div>
                </div>
              ) : dictionaryResults.map((entry, idx) => (
                <motion.div
                  key={`${entry.word}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Card className="p-8 border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="flex justify-between items-start mb-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h2 className="text-5xl font-black font-display tracking-tight text-slate-900 capitalize">{entry.word}</h2>
                          <button 
                            disabled={isSpeaking === entry.word}
                            onClick={() => handlePronunciation(entry.word)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              isSpeaking === entry.word 
                                ? 'bg-primary text-white animate-pulse' 
                                : 'bg-primary/5 text-primary hover:bg-primary/10'
                            }`}
                          >
                            <Volume2 size={24} className={isSpeaking === entry.word ? "animate-bounce" : ""} />
                          </button>
                        </div>
                        <p className="text-primary font-mono text-sm font-bold uppercase tracking-widest opacity-60">
                          {entry.phonetic || entry.phonetics.find(p => p.text)?.text}
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => handleSaveWord(entry)}
                        disabled={isWordSaved(entry.word)}
                        className={`rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-[10px] transition-all ${
                          isWordSaved(entry.word) 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50' 
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        {isWordSaved(entry.word) ? (
                          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Saved</span>
                        ) : (
                          <span className="flex items-center gap-2"><Plus size={16} /> Save to Bank</span>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-10">
                      {entry.meanings.map((meaning, mIdx) => (
                        <div key={mIdx} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                              {meaning.partOfSpeech}
                            </Badge>
                            <div className="h-px flex-1 bg-slate-50" />
                          </div>
                          
                          <div className="space-y-8">
                            {meaning.definitions.map((def, dIdx) => (
                              <div key={dIdx} className="space-y-4">
                                <p className="text-slate-700 text-xl font-medium leading-relaxed">
                                  {def.definition}
                                </p>
                                {def.example && (
                                  <div className="bg-slate-50/50 p-5 rounded-2xl border-l-4 border-primary/20 italic text-slate-500 text-lg">
                                    "{def.example}"
                                  </div>
                                )}
                                {def.synonyms.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mr-2">Synonyms:</span>
                                    {def.synonyms.slice(0, 5).map(syn => (
                                      <span key={syn} className="text-xs font-bold text-primary/60 bg-primary/5 px-3 py-1 rounded-lg">{syn}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
