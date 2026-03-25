import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_SPEECHES } from '../data/speeches';
import { Speech, Category, Difficulty } from '../types';
import { SpeechCard } from '../components/SpeechCard';
import { Search, Filter, BarChart, Sparkles, LayoutGrid } from 'lucide-react';
import { Skeleton, Button } from '../components/UI';

interface SpeechesPageProps {
  onSelectSpeech: (speech: Speech) => void;
}

export const SpeechesPage: React.FC<SpeechesPageProps> = ({ onSelectSpeech }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedDifficulty]);

  const categories: (Category | 'All')[] = ['All', 'TED Talks', 'Interviews', 'Podcasts'];
  const difficulties: (Difficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredSpeeches = useMemo(() => {
    return MOCK_SPEECHES.filter(speech => {
      const matchesCategory = selectedCategory === 'All' || speech.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || speech.difficulty === selectedDifficulty;
      const matchesSearch = speech.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            speech.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            speech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            speech.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const recommendedSpeeches = useMemo(() => {
    // Simple logic: first 3 speeches that match difficulty if not 'All', or just first 3
    return MOCK_SPEECHES.slice(0, 3);
  }, []);

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Explore</span>
          </div>
          <h1 className="text-4xl font-bold font-display tracking-tight leading-tight text-white">
            Study <span className="gradient-text">Library</span>
          </h1>
          <p className="text-soft-gray text-sm font-medium">Curated high-quality content for intentional practice.</p>
        </motion.div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-gray group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by title, speaker, or tags (e.g. 'pronunciation')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-neon"
          />
        </div>
      </header>

      <div className="space-y-12">
        {/* Featured / Recommended Horizontal Scroll */}
        {selectedCategory === 'All' && selectedDifficulty === 'All' && !searchQuery && (
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                Recommended for your level
              </h2>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
              {recommendedSpeeches.map((speech, idx) => (
                <motion.div
                  key={`rec-${speech.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[300px] w-[300px]"
                >
                  <SpeechCard 
                    speech={speech} 
                    onClick={onSelectSpeech} 
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar Filters */}
          <aside className="space-y-10 hidden lg:block">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-soft-gray">
                <Filter size={12} />
                Categories
              </div>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all ${
                      selectedCategory === cat 
                        ? 'bg-primary/10 border border-primary/30 text-primary' 
                        : 'text-soft-gray hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-soft-gray">
                <BarChart size={12} />
                Difficulty
              </div>
              <div className="flex flex-col gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all ${
                      selectedDifficulty === diff 
                        ? 'bg-primary/10 border border-primary/30 text-primary' 
                        : 'text-soft-gray hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          {/* Mobile Filters */}
          <div className="lg:hidden space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'gradient-primary text-white shadow-neon' 
                      : 'bg-white/5 border border-white/10 text-soft-gray'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-display tracking-tight text-white">
                {selectedCategory === 'All' ? 'All Content' : selectedCategory}
              </h2>
              <span className="text-[10px] font-bold text-soft-gray uppercase tracking-widest">{filteredSpeeches.length} Results</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full rounded-[2rem] bg-white/5" />
                    <div className="space-y-2 px-2">
                      <Skeleton className="h-6 w-3/4 bg-white/5" />
                      <Skeleton className="h-4 w-1/2 bg-white/5" />
                    </div>
                  </div>
                ))
              ) : (
                filteredSpeeches.map((speech, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1 }}
                    key={speech.id}
                  >
                    <SpeechCard 
                      speech={speech} 
                      onClick={onSelectSpeech} 
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {!isLoading && filteredSpeeches.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 space-y-6 glass-dark rounded-[3rem] border border-white/5"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto shadow-neon">
                  <Search className="text-primary/40" size={40} />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-2xl text-white font-display tracking-tight">No videos found</p>
                  <p className="text-soft-gray text-sm max-w-[240px] mx-auto font-medium">We couldn't find any videos matching your current filters.</p>
                </div>
                <Button 
                  variant="glass"
                  className="border-white/10 text-white hover:bg-white/5 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  onClick={() => { setSelectedCategory('All'); setSelectedDifficulty('All'); setSearchQuery(''); }}
                >
                  Reset all filters
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  </div>
);
};
