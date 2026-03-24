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

  const categories: (Category | 'All')[] = ['All', 'TED', 'Interviews', 'Podcasts', 'Movies', 'Business'];
  const difficulties: (Difficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredSpeeches = useMemo(() => {
    return MOCK_SPEECHES.filter(speech => {
      const matchesCategory = selectedCategory === 'All' || speech.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || speech.difficulty === selectedDifficulty;
      const matchesSearch = speech.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            speech.speaker.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-primary">
            <LayoutGrid size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Library</span>
          </div>
          <h1 className="text-4xl font-bold font-display tracking-tight leading-tight text-white">
            Explore <span className="gradient-text">Videos</span>
          </h1>
          <p className="text-soft-gray text-sm font-medium">Find the perfect content to practice your fluency.</p>
        </motion.div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-gray group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search videos or speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-neon"
          />
        </div>
      </header>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-soft-gray">
            <Filter size={12} />
            Filter by Category
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
            {categories.map((cat, idx) => (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'gradient-primary text-white shadow-neon' 
                    : 'bg-white/5 border border-white/10 text-soft-gray hover:bg-white/10'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-soft-gray">
            <BarChart size={12} />
            Difficulty Level
          </div>
          <div className="flex gap-3">
            {difficulties.map((diff, idx) => (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  selectedDifficulty === diff 
                    ? 'bg-primary/20 border-primary text-primary shadow-neon' 
                    : 'bg-white/5 border-white/10 text-soft-gray hover:border-white/20'
                }`}
              >
                {diff}
              </motion.button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-display tracking-tight text-white">Recommended for you</h2>
            <span className="text-[10px] font-bold text-soft-gray uppercase tracking-widest">{filteredSpeeches.length} Results</span>
          </div>
          
          <div className="grid gap-8">
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
                className="text-center py-20 space-y-4"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Search className="text-white/20" size={32} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg text-white">No videos found</p>
                  <p className="text-soft-gray text-sm">Try adjusting your filters or search query.</p>
                </div>
                <Button 
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={() => { setSelectedCategory('All'); setSelectedDifficulty('All'); setSearchQuery(''); }}
                >
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
