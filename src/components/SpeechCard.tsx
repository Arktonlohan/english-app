import React from 'react';
import { motion } from 'motion/react';
import { Speech } from '../types';
import { Card, Badge } from './UI';
import { Play, Clock, User } from 'lucide-react';

interface SpeechCardProps {
  speech: Speech;
  onClick: (speech: Speech) => void;
}

export const SpeechCard: React.FC<SpeechCardProps> = ({ speech, onClick }) => {
  const getDifficultyVariant = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <Card 
      className="overflow-hidden group cursor-pointer border border-white/5 glass-dark hover:border-primary/50 transition-all duration-500"
      onClick={() => onClick(speech)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={speech.thumbnail} 
          alt={speech.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-neon"
          >
            <Play size={20} fill="currentColor" />
          </motion.div>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 glass rounded-lg text-[10px] font-bold text-white">
          {speech.duration}
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant={getDifficultyVariant(speech.difficulty)}>
            {speech.difficulty}
          </Badge>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {speech.metadata?.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-lg leading-tight text-white group-hover:text-primary transition-colors line-clamp-2 glow-text">
            {speech.title}
          </h3>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <User size={12} className="text-soft-gray" />
            </div>
            <span className="text-xs font-semibold text-soft-gray">{speech.speaker}</span>
          </div>
          <Badge variant="secondary" className="bg-white/5 text-soft-gray border-white/10 text-[10px] uppercase tracking-tighter">{speech.category}</Badge>
        </div>
      </div>
    </Card>
  );
};
