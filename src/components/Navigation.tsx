import React from 'react';
import { Home, Mic2, Mic, Repeat, BookOpen, Layers, BarChart3 } from 'lucide-react';
import { TabType, NavItem } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const items: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'speeches', label: 'Speeches', icon: <Mic2 size={20} /> },
    { id: 'shadowing', label: 'Shadow', icon: <Repeat size={20} /> },
    { id: 'pronunciation', label: 'Speak', icon: <Mic size={20} /> },
    { id: 'vocabulary', label: 'Vocab', icon: <BookOpen size={20} /> },
    { id: 'flashcards', label: 'Cards', icon: <Layers size={20} /> },
    { id: 'progress', label: 'Stats', icon: <BarChart3 size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-2 pb-safe pt-2 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
