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
      className="overflow-hidden group cursor-pointer border-none"
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
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
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
      
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {speech.title}
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <User size={12} className="text-slate-400" />
            </div>
            <span className="text-xs font-semibold text-slate-500">{speech.speaker}</span>
          </div>
          <Badge variant="secondary">{speech.category}</Badge>
        </div>
      </div>
    </Card>
  );
};
