import { VocabularyWord, SRSLevel, FlashcardStats, DictionaryEntry } from '../types';
import { MOCK_VOCABULARY } from '../data/vocabulary';
import { vocabularyRepository } from './persistence/vocabularyRepository';
import { authService } from './authService';

class VocabularyService {
  private words: VocabularyWord[] = [];
  private isLoaded = false;
  private currentUserId: string | null = null;
  private recentSearches: string[] = [];
  private readonly RECENT_SEARCHES_KEY = 'fluent_recent_searches';

  constructor() {
    this.loadRecentSearches();
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

  async getDueCards(): Promise<VocabularyWord[]> {
    if (!this.isLoaded && this.currentUserId) {
      await this.loadWords(this.currentUserId);
    }
    const now = new Date();
    return this.words.filter(word => {
      if (!word.nextReview) return true;
      return new Date(word.nextReview) <= now;
    });
  }

  getStats(): FlashcardStats {
    const allWords = this.words;
    const now = new Date();
    const dueToday = allWords.filter(word => {
      if (!word.nextReview) return true;
      return new Date(word.nextReview) <= now;
    }).length;
    
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

    // Check if already saved to prevent duplicates
    const existing = this.getVocabularyWordByText(word.word || word.text || '');
    if (existing) return existing;

    const s1 = word.exampleSentence1 || word.exampleSentence || word.example || '';
    let s2 = word.exampleSentence2 || '';

    if (!s2 && s1) {
      s2 = this.generateAlternativeTense(word.word || word.text || '', s1);
    }

    const newWord: VocabularyWord = {
      id: `v-${Date.now()}`,
      userId,
      word: word.word || word.text || '',
      translation: word.translation || word.meaning || '',
      ipa: word.ipa || '',
      exampleSentence: s1,
      exampleSentence1: s1,
      exampleSentence2: s2,
      createdAt: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      interval: 0,
      easeFactor: 2.5,
      mastery: 0,
      srsLevel: SRSLevel.NEW,
      sourceSpeechId: word.sourceSpeechId,
      sourceSentenceId: word.sourceSentenceId,
      ...word
    };

    // Compatibility
    newWord.text = newWord.word;
    newWord.meaning = newWord.translation;
    newWord.example = newWord.exampleSentence;
    newWord.addedAt = newWord.createdAt;

    this.words.unshift(newWord);
    await vocabularyRepository.saveWord(userId, newWord);
    this.notify();
    return newWord;
  }

  private generateAlternativeTense(word: string, originalSentence: string): string {
    const w = word.toLowerCase();
    
    // Simple heuristic-based tense variation
    if (originalSentence.includes('will ') || originalSentence.includes('going to')) {
      // Future -> Past
      return `I ${w}ed yesterday and it was a great experience.`;
    } else if (originalSentence.endsWith('ed') || originalSentence.includes('was ') || originalSentence.includes('were ')) {
      // Past -> Present/Future
      return `I will ${w} tomorrow if I have enough time.`;
    } else {
      // Present -> Past
      return `Yesterday, I ${w}ed for the first time in a while.`;
    }
  }

  async updateSRS(wordId: string, difficulty: 'again' | 'hard' | 'good' | 'easy') {
    const userId = authService.getUserId();
    if (!userId) return null;

    const wordIndex = this.words.findIndex(w => w.id === wordId);
    if (wordIndex === -1) return null;

    const word = this.words[wordIndex];
    let nextReview = new Date();
    let newInterval = word.interval || 0;
    let newEaseFactor = word.easeFactor || 2.5;
    let newLevel = word.srsLevel || SRSLevel.NEW;
    let intervalText = '';

    // Simplified Anki-style logic
    switch (difficulty) {
      case 'again':
        newInterval = 0;
        nextReview.setMinutes(nextReview.getMinutes() + 10);
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
        newLevel = SRSLevel.LEARNING;
        intervalText = '10m';
        break;
      case 'hard':
        newInterval = newInterval === 0 ? 0.5 : newInterval * 1.2;
        nextReview.setHours(nextReview.getHours() + (newInterval * 24));
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
        newLevel = SRSLevel.REVIEW;
        intervalText = newInterval < 1 ? '12h' : `${Math.round(newInterval)}d`;
        break;
      case 'good':
        if (newInterval === 0) {
          newInterval = 1;
        } else {
          newInterval = newInterval * newEaseFactor;
        }
        nextReview.setDate(nextReview.getDate() + Math.round(newInterval));
        newLevel = SRSLevel.REVIEW;
        intervalText = `${Math.round(newInterval)}d`;
        break;
      case 'easy':
        if (newInterval === 0) {
          newInterval = 4;
        } else {
          newInterval = newInterval * newEaseFactor * 1.3;
        }
        nextReview.setDate(nextReview.getDate() + Math.round(newInterval));
        newEaseFactor = newEaseFactor + 0.15;
        newLevel = SRSLevel.MASTERED;
        intervalText = `${Math.round(newInterval)}d`;
        break;
    }

    const updatedWord: VocabularyWord = {
      ...word,
      nextReview: nextReview.toISOString(),
      lastReviewed: new Date().toISOString(),
      interval: newInterval,
      easeFactor: newEaseFactor,
      srsLevel: newLevel,
      mastery: Math.min(100, (newInterval / 30) * 100), // Approximate mastery
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
    return this.words.find(w => (w.word || w.text || '').toLowerCase() === text.toLowerCase());
  }

  async removeWord(wordId: string) {
    const userId = authService.getUserId();
    if (!userId) return;

    this.words = this.words.filter(w => w.id !== wordId);
    await vocabularyRepository.deleteWord(userId, wordId);
    this.notify();
  }

  isWordSaved(text: string): boolean {
    return this.words.some(w => (w.word || w.text || '').toLowerCase() === text.toLowerCase());
  }

  async getSavedWordsCountForSpeech(speechId: string): Promise<number> {
    if (!this.isLoaded && this.currentUserId) {
      await this.loadWords(this.currentUserId);
    }
    return this.words.filter(w => w.sourceSpeechId === speechId).length;
  }

  // Dictionary & Search Features
  async lookupWord(word: string): Promise<DictionaryEntry[]> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Dictionary service unavailable');
      }
      const data = await response.json();
      this.addToRecentSearches(word);
      return data as DictionaryEntry[];
    } catch (error) {
      console.error('Dictionary lookup failed:', error);
      throw error;
    }
  }

  private loadRecentSearches() {
    const saved = localStorage.getItem(this.RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        this.recentSearches = JSON.parse(saved);
      } catch (e) {
        this.recentSearches = [];
      }
    }
  }

  private addToRecentSearches(word: string) {
    const normalized = word.trim().toLowerCase();
    if (!normalized) return;
    
    this.recentSearches = [
      normalized,
      ...this.recentSearches.filter(w => w !== normalized)
    ].slice(0, 10);
    
    localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    window.dispatchEvent(new CustomEvent('fluent_recent_searches_update'));
  }

  getRecentSearches(): string[] {
    return this.recentSearches;
  }

  async getWordOfTheDay(): Promise<{ word: string; definition: string; ipa: string }> {
    // Curated list for "Word of the Day" if vocabulary is small
    const curated = [
      { word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing.', ipa: '/ˈɛləkwənt/' },
      { word: 'Resilient', definition: 'Able to withstand or recover quickly from difficult conditions.', ipa: '/rɪˈzɪliənt/' },
      { word: 'Serendipity', definition: 'The occurrence and development of events by chance in a happy or beneficial way.', ipa: '/ˌsɛrənˈdɪpɪti/' },
      { word: 'Ephemeral', definition: 'Lasting for a very short time.', ipa: '/ɪˈfɛmərəl/' },
      { word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', ipa: '/præɡˈmætɪk/' }
    ];

    // Use a date-based seed to ensure the same word for the whole day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    
    // If user has many words, maybe pick one from their vocabulary to review?
    // For now, use curated list
    return curated[dayOfYear % curated.length];
  }
}

export const vocabularyService = new VocabularyService();
