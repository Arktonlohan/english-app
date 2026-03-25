import React from 'react';

export type TabType = 'home' | 'shadowing' | 'videos' | 'vocabulary' | 'flashcards' | 'progress' | 'settings' | 'pronunciation';

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

export interface SyllableFeedback {
  text: string;
  isStressed: boolean;
  score: number;
  feedback?: string;
}

export interface WordFeedback {
  text: string;
  ipa?: string;
  score: number;
  syllables: SyllableFeedback[];
  phonemes?: PhonemeFeedback[];
}

export interface PronunciationAttempt {
  id: string;
  text: string;
  ipa?: string;
  timestamp: string;
  score: PronunciationScore;
  feedback: string[];
  strengths?: string[];
  improvements?: string[];
  phonemes?: PhonemeFeedback[];
  words?: WordFeedback[];
  audioUrl?: string;
  duration?: number;
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
export type Category = 'TED Talks' | 'Interviews' | 'Podcasts';

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

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      synonyms: string[];
      antonyms: string[];
      example?: string;
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  sourceUrls: string[];
}

export interface VocabularyWord {
  id: string;
  userId: string;
  word: string;
  translation: string;
  ipa: string;
  exampleSentence: string;
  createdAt: string;
  nextReview: string;
  interval: number; // in days
  easeFactor: number;
  
  // Legacy/Compatibility fields
  text?: string; // mapped to word
  meaning?: string; // mapped to translation
  example?: string; // mapped to exampleSentence
  addedAt?: string; // mapped to createdAt
  mastery?: number;
  srsLevel?: SRSLevel;
  sourceSpeechId?: string;
  sourceSentenceId?: string;
  isDifficult?: boolean;
  lastReviewed?: string;
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
  bookmarkedSentenceIds: string[];
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
    nativeLanguage: string;
    dailyGoal: number;
    theme?: 'light' | 'dark' | 'system';
    notificationsEnabled?: boolean;
    subtitleSize?: 'sm' | 'md' | 'lg';
  };
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}
