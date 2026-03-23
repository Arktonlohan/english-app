import React from 'react';

export type TabType = 'home' | 'speeches' | 'shadowing' | 'vocabulary' | 'flashcards' | 'pronunciation' | 'progress';

export interface PronunciationScore {
  overall: number;
  accuracy: number;
  fluency: number;
  stress: number;
  rhythm: number;
  intonation: number;
}

export interface PhonemeFeedback {
  phoneme: string;
  score: number;
  feedback: string;
  isCorrect: boolean;
}

export interface PronunciationAttempt {
  id: string;
  text: string;
  ipa?: string;
  timestamp: string;
  score: PronunciationScore;
  feedback: string[];
  phonemes?: PhonemeFeedback[];
  audioUrl?: string;
}

export interface PronunciationPracticeItem {
  id: string;
  text: string;
  ipa: string;
  audioUrl?: string;
  type: 'word' | 'sentence';
  category?: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Category = 'TED' | 'Interviews' | 'Podcasts' | 'Movies' | 'Business';

export type TranscriptState = 'available' | 'loading' | 'unavailable' | 'mock' | 'error';
export type ContentReadiness = 'ready' | 'processing' | 'no_transcript' | 'error';
export type SpeechSourceType = 'curated' | 'youtube' | 'local';

export interface Word {
  text: string;
  startTime: number;
  endTime: number;
  ipa?: string;
  meaning?: string;
  translation?: string;
  example?: string;
  audioUrl?: string;
}

export interface Sentence {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words: Word[];
  translation?: string;
  isHard?: boolean;
  isBookmarked?: boolean;
}

export interface Transcript {
  speechId: string;
  sentences: Sentence[];
  state: TranscriptState;
  source?: 'youtube_captions' | 'ai_generated' | 'curated' | 'fallback';
}

export interface Speech {
  id: string;
  title: string;
  speaker: string;
  category: Category;
  difficulty: Difficulty;
  duration: string;
  thumbnail: string;
  description: string;
  transcript?: Transcript;
  youtubeUrl?: string;
  videoId?: string;
  isImported?: boolean;
  createdAt: string;
  lastPosition?: number;
  readiness: ContentReadiness;
  sourceType: SpeechSourceType;
  metadata?: {
    views?: number;
    likes?: number;
    publishedAt?: string;
    channelTitle?: string;
    tags?: string[];
  };
}

export enum SRSLevel {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEW = 'review',
  MASTERED = 'mastered'
}

export interface VocabularyWord {
  id: string;
  text: string;
  ipa: string;
  meaning: string;
  translation?: string;
  example: string;
  mastery: number; // 0 to 100
  lastReviewed?: string;
  nextReview?: string;
  addedAt: string;
  srsLevel?: SRSLevel;
  sourceSpeechId?: string;
  sourceSentenceId?: string;
  isDifficult?: boolean;
}

export interface FlashcardStats {
  dueToday: number;
  totalCards: number;
  retentionRate: number;
  streak: number;
  learningCount: number;
  reviewingCount: number;
  masteredCount: number;
  newCount: number;
}

export interface SpeechProgress {
  speechId: string;
  lastPosition: number;
  completedSentenceIds: string[];
  difficultSentenceIds: string[];
  savedWordsCount: number;
  lastStudiedAt: string;
  totalTimeSpent: number; // in seconds
}

export interface ShadowingSession {
  id: string;
  speechId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  sentencesCompleted: number;
  difficultSentencesReviewed: number;
  wordsSaved: number;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupCredentials {
  email: string;
  password?: string;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'email' | 'google';
  createdAt: string;
  streak: number;
  learningStats: {
    totalWordsLearned: number;
    totalShadowingSessions: number;
    totalTimeSpent: number;
    lastStudyDate?: string;
    points?: number;
    level?: number;
  };
  preferences: {
    targetLanguage: string;
    dailyGoal: number;
    theme?: 'light' | 'dark' | 'system';
    notificationsEnabled?: boolean;
  };
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}
