import { useState, useEffect, useCallback } from 'react';
import { progressService } from '../services/progressService';
import { vocabularyService } from '../services/vocabularyService';
import { authService } from '../services/authService';
import { MOCK_SPEECHES } from '../data/speeches';
import { Speech, SpeechProgress, User } from '../types';

export interface DashboardData {
  recentSpeech: Speech | null;
  recentProgress: SpeechProgress | null;
  overallStats: {
    totalTime: number;
    totalWords: number;
    completedSentences: number;
    difficultSentences: number;
  };
  todayStats: {
    timeSpent: number;
    sentencesCompleted: number;
    wordsSaved: number;
    sessionCount: number;
  };
  flashcardStats: {
    dueToday: number;
    totalCards: number;
    retentionRate: number;
    streak: number;
  };
  user: User | null;
  isLoading: boolean;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    recentSpeech: null,
    recentProgress: null,
    overallStats: { totalTime: 0, totalWords: 0, completedSentences: 0, difficultSentences: 0 },
    todayStats: { timeSpent: 0, sentencesCompleted: 0, wordsSaved: 0, sessionCount: 0 },
    flashcardStats: { dueToday: 0, totalCards: 0, retentionRate: 0, streak: 0 },
    user: null,
    isLoading: true,
  });

  const refreshData = useCallback(async () => {
    const user = authService.getCurrentUser();
    const recentProgress = await progressService.getMostRecentSpeechProgress();
    const recentSpeech = recentProgress 
      ? MOCK_SPEECHES.find(s => s.id === recentProgress.speechId) || null 
      : null;

    const overallStats = await progressService.getOverallStats();
    const todayStats = await progressService.getTodayStats();
    const flashcardStats = vocabularyService.getStats();

    setData({
      recentSpeech,
      recentProgress,
      overallStats,
      todayStats,
      flashcardStats,
      user,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    refreshData();

    const handleProgressUpdate = () => refreshData();
    const handleVocabUpdate = () => refreshData();
    const unsubscribeAuth = authService.onAuthStateChanged(() => refreshData());

    window.addEventListener('falai_progress_update', handleProgressUpdate);
    window.addEventListener('falai_vocabulary_update', handleVocabUpdate);

    return () => {
      window.removeEventListener('falai_progress_update', handleProgressUpdate);
      window.removeEventListener('falai_vocabulary_update', handleVocabUpdate);
      unsubscribeAuth();
    };
  }, [refreshData]);

  return data;
};
