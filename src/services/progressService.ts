import { SpeechProgress, ShadowingSession } from '../types';
import { progressRepository } from './persistence/progressRepository';
import { authService } from './authService';

class ProgressService {
  private progressMap: { [key: string]: SpeechProgress } = {};
  private sessions: ShadowingSession[] = [];
  private isLoaded = false;
  private currentUserId: string | null = null;

  constructor() {
    authService.onAuthStateChanged((user) => {
      if (user) {
        if (this.currentUserId !== user.id) {
          this.currentUserId = user.id;
          this.loadProgress(user.id);
        }
      } else {
        this.progressMap = {};
        this.sessions = [];
        this.isLoaded = false;
        this.currentUserId = null;
        this.notify();
      }
    });
  }

  private async loadProgress(userId: string) {
    try {
      this.progressMap = await progressRepository.getAllProgress(userId);
      this.sessions = await progressRepository.getAllSessions(userId);
      this.isLoaded = true;
      this.notify();
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  }

  private notify() {
    window.dispatchEvent(new CustomEvent('fluent_progress_update'));
  }

  async getSpeechProgress(speechId: string): Promise<SpeechProgress> {
    const userId = authService.getUserId();
    if (!userId) {
      return {
        speechId,
        lastPosition: 0,
        difficultSentenceIds: [],
        completedSentenceIds: [],
        bookmarkedSentenceIds: [],
        savedWordsCount: 0,
        lastStudiedAt: new Date().toISOString(),
        totalTimeSpent: 0
      };
    }

    if (!this.isLoaded) await this.loadProgress(userId);
    
    if (this.progressMap[speechId]) {
      return this.progressMap[speechId];
    }

    const progress = await progressRepository.getSpeechProgress(userId, speechId);
    this.progressMap[speechId] = progress;
    return progress;
  }

  async saveLastPosition(speechId: string, position: number) {
    const userId = authService.getUserId();
    if (!userId) return;

    const progress = await this.getSpeechProgress(speechId);
    progress.lastPosition = position;
    progress.lastStudiedAt = new Date().toISOString();
    
    this.progressMap[speechId] = progress;
    await progressRepository.saveSpeechProgress(userId, progress);
    this.notify();
  }

  async toggleDifficultSentence(speechId: string, sentenceId: string) {
    const userId = authService.getUserId();
    if (!userId) return false;

    const progress = await this.getSpeechProgress(speechId);
    const index = progress.difficultSentenceIds.indexOf(sentenceId);
    if (index > -1) {
      progress.difficultSentenceIds.splice(index, 1);
    } else {
      progress.difficultSentenceIds.push(sentenceId);
    }
    
    this.progressMap[speechId] = progress;
    await progressRepository.saveSpeechProgress(userId, progress);
    this.notify();
    return progress.difficultSentenceIds.includes(sentenceId);
  }
  
  async toggleBookmarkedSentence(speechId: string, sentenceId: string) {
    const userId = authService.getUserId();
    if (!userId) return false;

    const progress = await this.getSpeechProgress(speechId);
    const index = progress.bookmarkedSentenceIds.indexOf(sentenceId);
    if (index > -1) {
      progress.bookmarkedSentenceIds.splice(index, 1);
    } else {
      progress.bookmarkedSentenceIds.push(sentenceId);
    }
    
    this.progressMap[speechId] = progress;
    await progressRepository.saveSpeechProgress(userId, progress);
    this.notify();
    return progress.bookmarkedSentenceIds.includes(sentenceId);
  }

  async markSentenceCompleted(speechId: string, sentenceId: string) {
    const userId = authService.getUserId();
    if (!userId) return;

    const progress = await this.getSpeechProgress(speechId);
    if (!progress.completedSentenceIds.includes(sentenceId)) {
      progress.completedSentenceIds.push(sentenceId);
      this.progressMap[speechId] = progress;
      await progressRepository.saveSpeechProgress(userId, progress);
      this.notify();
    }
  }

  async updateSavedWordsCount(speechId: string, count: number) {
    const userId = authService.getUserId();
    if (!userId) return;

    const progress = await this.getSpeechProgress(speechId);
    progress.savedWordsCount = count;
    this.progressMap[speechId] = progress;
    await progressRepository.saveSpeechProgress(userId, progress);
    this.notify();
  }

  async addTimeSpent(speechId: string, seconds: number) {
    const userId = authService.getUserId();
    if (!userId) return;

    const progress = await this.getSpeechProgress(speechId);
    progress.totalTimeSpent += seconds;
    this.progressMap[speechId] = progress;
    await progressRepository.saveSpeechProgress(userId, progress);
    this.notify();
  }

  async getOverallProgress(speechId: string, totalSentences: number): Promise<number> {
    if (totalSentences === 0) return 0;
    const progress = await this.getSpeechProgress(speechId);
    return Math.round((progress.completedSentenceIds.length / totalSentences) * 100);
  }

  async saveSession(session: ShadowingSession) {
    const userId = authService.getUserId();
    if (!userId) return;

    this.sessions.push(session);
    await progressRepository.saveSession(userId, session);
    this.notify();
  }

  async getTodayStats() {
    const userId = authService.getUserId();
    if (!userId) return { timeSpent: 0, segmentsCompleted: 0, wordsSaved: 0, sessionCount: 0 };

    if (!this.isLoaded) await this.loadProgress(userId);
    const today = new Date().toDateString();
    const todaySessions = this.sessions.filter(s => new Date(s.startTime).toDateString() === today);
    
    return {
      timeSpent: todaySessions.reduce((acc, s) => acc + s.duration, 0),
      segmentsCompleted: todaySessions.reduce((acc, s) => acc + s.segmentsCompleted, 0),
      wordsSaved: todaySessions.reduce((acc, s) => acc + s.wordsSaved, 0),
      sessionCount: todaySessions.length
    };
  }

  async getOverallStats() {
    const userId = authService.getUserId();
    if (!userId) return { totalTime: 0, totalWords: 0, completedSegments: 0, difficultSentences: 0 };

    if (!this.isLoaded) await this.loadProgress(userId);
    const totalTime = this.sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalWords = this.sessions.reduce((acc, s) => acc + s.wordsSaved, 0);
    const completedSegments = this.sessions.reduce((acc, s) => acc + s.segmentsCompleted, 0);
    const difficultSentences = Object.values(this.progressMap).reduce((acc, p) => acc + p.difficultSentenceIds.length, 0);

    return {
      totalTime,
      totalWords,
      completedSegments,
      difficultSentences
    };
  }

  async getMostRecentSpeechProgress(): Promise<SpeechProgress | null> {
    const userId = authService.getUserId();
    if (!userId) return null;

    if (!this.isLoaded) await this.loadProgress(userId);
    const progressList = Object.values(this.progressMap);
    if (progressList.length === 0) return null;
    
    return progressList.sort((a, b) => 
      new Date(b.lastStudiedAt).getTime() - new Date(a.lastStudiedAt).getTime()
    )[0];
  }
}

export const progressService = new ProgressService();
