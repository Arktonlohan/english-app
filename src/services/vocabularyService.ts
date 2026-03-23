import { VocabularyWord, SRSLevel, FlashcardStats } from '../types';
import { MOCK_VOCABULARY } from '../data/vocabulary';
import { vocabularyRepository } from './persistence/vocabularyRepository';
import { authService } from './authService';

class VocabularyService {
  private words: VocabularyWord[] = [];
  private isLoaded = false;
  private currentUserId: string | null = null;

  constructor() {
    authService.onAuthStateChanged((user) => {
      if (user) {
        if (this.currentUserId !== user.id) {
          this.currentUserId = user.id;
          this.loadWords(user.id);
        }
      } else {
        this.words = [];
        this.isLoaded = false;
        this.currentUserId = null;
        this.notify();
      }
    });
  }

  private async loadWords(userId: string) {
    try {
      this.words = await vocabularyRepository.getWords(userId);
      if (this.words.length === 0 && !this.isLoaded) {
        // Only load mock data for new users or first time
        this.words = [...MOCK_VOCABULARY];
      }
      this.isLoaded = true;
      this.notify();
    } catch (e) {
      console.error('Failed to load vocabulary:', e);
      this.words = [...MOCK_VOCABULARY];
    }
  }

  private notify() {
    window.dispatchEvent(new CustomEvent('fluent_vocabulary_update'));
  }

  async getWords(): Promise<VocabularyWord[]> {
    if (!this.isLoaded && this.currentUserId) {
      await this.loadWords(this.currentUserId);
    }
    return this.words;
  }

  getDueCards(): VocabularyWord[] {
    const now = new Date();
    return this.words.filter(word => {
      if (!word.nextReview) return true;
      return new Date(word.nextReview) <= now;
    });
  }

  getStats(): FlashcardStats {
    const allWords = this.words;
    const dueToday = this.getDueCards().length;
    
    const newCount = allWords.filter(w => !w.srsLevel || w.srsLevel === SRSLevel.NEW).length;
    const learningCount = allWords.filter(w => w.srsLevel === SRSLevel.LEARNING).length;
    const reviewingCount = allWords.filter(w => w.srsLevel === SRSLevel.REVIEW).length;
    const masteredCount = allWords.filter(w => w.srsLevel === SRSLevel.MASTERED).length;
    
    const total = allWords.length || 1;
    const retentionRate = Math.round(((masteredCount * 100) + (reviewingCount * 80) + (learningCount * 50)) / total);

    return {
      dueToday,
      totalCards: allWords.length,
      retentionRate: Math.max(0, Math.min(100, retentionRate)),
      streak: this.calculateStreak(),
      newCount,
      learningCount,
      reviewingCount,
      masteredCount
    };
  }

  private calculateStreak(): number {
    const lastReviewed = this.words
      .filter(w => w.lastReviewed)
      .map(w => new Date(w.lastReviewed!).toDateString());
    
    const uniqueDays = new Set(lastReviewed);
    return uniqueDays.size;
  }

  async addWord(word: Partial<VocabularyWord>): Promise<VocabularyWord> {
    const userId = authService.getUserId();
    if (!userId) throw new Error('User must be logged in to add words');

    const newWord: VocabularyWord = {
      id: `v-${Date.now()}`,
      text: word.text || '',
      ipa: word.ipa || '',
      meaning: word.meaning || '',
      example: word.example || '',
      translation: word.translation || '',
      mastery: 0,
      addedAt: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      srsLevel: SRSLevel.NEW,
      sourceSpeechId: word.sourceSpeechId,
      sourceSentenceId: word.sourceSentenceId,
      ...word
    };

    this.words.unshift(newWord);
    await vocabularyRepository.saveWord(userId, newWord);
    this.notify();
    return newWord;
  }

  async updateSRS(wordId: string, difficulty: 'again' | 'hard' | 'good' | 'easy') {
    const userId = authService.getUserId();
    if (!userId) return null;

    const wordIndex = this.words.findIndex(w => w.id === wordId);
    if (wordIndex === -1) return null;

    const word = this.words[wordIndex];
    let nextReview = new Date();
    let newLevel = word.srsLevel || SRSLevel.NEW;
    let newMastery = word.mastery || 0;
    let intervalText = '';

    switch (difficulty) {
      case 'again':
        nextReview.setMinutes(nextReview.getMinutes() + 10);
        newLevel = SRSLevel.LEARNING;
        newMastery = Math.max(0, newMastery - 10);
        intervalText = '10m';
        break;
      case 'hard':
        nextReview.setDate(nextReview.getDate() + 1);
        newLevel = SRSLevel.REVIEW;
        newMastery = Math.min(100, newMastery + 5);
        intervalText = '1d';
        break;
      case 'good':
        nextReview.setDate(nextReview.getDate() + 3);
        newLevel = SRSLevel.REVIEW;
        newMastery = Math.min(100, newMastery + 15);
        intervalText = '3d';
        break;
      case 'easy':
        nextReview.setDate(nextReview.getDate() + 7);
        newLevel = SRSLevel.MASTERED;
        newMastery = Math.min(100, newMastery + 25);
        intervalText = '7d';
        break;
    }

    const updatedWord = {
      ...word,
      nextReview: nextReview.toISOString(),
      lastReviewed: new Date().toISOString(),
      srsLevel: newLevel,
      mastery: newMastery,
      isDifficult: difficulty === 'again' || difficulty === 'hard'
    };

    this.words[wordIndex] = updatedWord;
    await vocabularyRepository.updateWord(userId, updatedWord);
    this.notify();

    return {
      nextReview: nextReview.toISOString(),
      intervalText,
      newLevel
    };
  }

  getVocabularyWordByText(text: string): VocabularyWord | undefined {
    return this.words.find(w => w.text.toLowerCase() === text.toLowerCase());
  }

  async removeWord(wordId: string) {
    const userId = authService.getUserId();
    if (!userId) return;

    this.words = this.words.filter(w => w.id !== wordId);
    await vocabularyRepository.deleteWord(userId, wordId);
    this.notify();
  }

  isWordSaved(text: string): boolean {
    return this.words.some(w => w.text.toLowerCase() === text.toLowerCase());
  }

  getSavedWordsCountForSpeech(speechId: string): number {
    return this.words.filter(w => w.sourceSpeechId === speechId).length;
  }
}

export const vocabularyService = new VocabularyService();
