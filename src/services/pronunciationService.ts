import { PronunciationAttempt, PronunciationPracticeItem, PronunciationScore, PhonemeFeedback } from '../types';
import { pronunciationRepository } from './persistence/pronunciationRepository';
import { authService } from './authService';

const MOCK_PRACTICE_ITEMS: PronunciationPracticeItem[] = [
  { id: '1', text: 'Thorough', ipa: '/ˈθʌrə/', type: 'word', category: 'Commonly Mispronounced' },
  { id: '2', text: 'Schedule', ipa: '/ˈʃɛdjuːl/', type: 'word', category: 'Commonly Mispronounced' },
  { id: '3', text: 'Entrepreneur', ipa: '/ˌɒntrəprəˈnɜː/', type: 'word', category: 'Business' },
  { id: '4', text: 'The quick brown fox jumps over the lazy dog.', ipa: '', type: 'sentence', category: 'Pangrams' },
  { id: '5', text: 'Success is not final, failure is not fatal.', ipa: '', type: 'sentence', category: 'Inspirational' },
  { id: '6', text: 'Anonymity', ipa: '/ˌænəˈnɪmɪti/', type: 'word', category: 'Commonly Mispronounced' },
  { id: '7', text: 'Phenomenon', ipa: '/fəˈnɒmɪnən/', type: 'word', category: 'Commonly Mispronounced' },
  { id: '8', text: 'Rural', ipa: '/ˈrʊərəl/', type: 'word', category: 'Commonly Mispronounced' },
];

class PronunciationService {
  private attempts: PronunciationAttempt[] = [];
  private isLoaded = false;
  private currentUserId: string | null = null;

  constructor() {
    authService.onAuthStateChanged((user) => {
      if (user) {
        if (this.currentUserId !== user.id) {
          this.currentUserId = user.id;
          this.loadAttempts(user.id);
        }
      } else {
        this.attempts = [];
        this.isLoaded = false;
        this.currentUserId = null;
        this.notify();
      }
    });
  }

  private async loadAttempts(userId: string) {
    try {
      this.attempts = await pronunciationRepository.getAttempts(userId);
      this.isLoaded = true;
      this.notify();
    } catch (e) {
      console.error('Failed to load pronunciation attempts:', e);
    }
  }

  private notify() {
    window.dispatchEvent(new CustomEvent('fluent_pronunciation_update'));
  }

  async getAttempts(): Promise<PronunciationAttempt[]> {
    const userId = authService.getUserId();
    if (!userId) return [];
    if (!this.isLoaded) await this.loadAttempts(userId);
    return [...this.attempts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getPracticeItems(): PronunciationPracticeItem[] {
    return MOCK_PRACTICE_ITEMS;
  }

  async analyzePronunciation(text: string, audioBlob: Blob): Promise<PronunciationAttempt> {
    const userId = authService.getUserId();
    if (!userId) throw new Error('User must be logged in to analyze pronunciation');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis logic
    const overall = Math.floor(Math.random() * 30) + 70; // 70-99
    const accuracy = Math.floor(Math.random() * 20) + 80;
    const fluency = Math.floor(Math.random() * 20) + 75;
    const stress = Math.floor(Math.random() * 20) + 70;
    const rhythm = Math.floor(Math.random() * 20) + 75;
    const intonation = Math.floor(Math.random() * 20) + 80;

    const score: PronunciationScore = {
      overall,
      accuracy,
      fluency,
      stress,
      rhythm,
      intonation
    };

    const feedback = this.generateFeedback(score);
    const phonemes = this.generatePhonemeFeedback(text);

    const attempt: PronunciationAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date().toISOString(),
      score,
      feedback,
      phonemes,
      audioUrl: URL.createObjectURL(audioBlob)
    };

    this.attempts.push(attempt);
    await pronunciationRepository.saveAttempt(userId, attempt);
    this.notify();
    return attempt;
  }

  private generateFeedback(score: PronunciationScore): string[] {
    const feedback: string[] = [];
    
    if (score.overall >= 90) {
      feedback.push("Excellent pronunciation! Your clarity is near-native.");
    } else if (score.overall >= 80) {
      feedback.push("Great job! Most sounds are clear and well-articulated.");
    } else {
      feedback.push("Good attempt. Focus on specific vowel sounds to improve clarity.");
    }

    if (score.stress < 80) {
      feedback.push("Try to emphasize the stressed syllables more clearly.");
    }

    if (score.fluency < 80) {
      feedback.push("Work on connecting words more smoothly to improve flow.");
    }

    return feedback;
  }

  private generatePhonemeFeedback(text: string): PhonemeFeedback[] {
    // Very basic mock phoneme feedback
    const words = text.split(' ');
    const phonemes: PhonemeFeedback[] = [];
    
    // Just mock some phonemes for the first word
    if (words.length > 0) {
      const firstWord = words[0].toLowerCase();
      if (firstWord.includes('th')) {
        phonemes.push({
          phoneme: 'θ',
          score: Math.random() > 0.3 ? 90 : 40,
          feedback: "The 'th' sound should be produced with the tongue between the teeth.",
          isCorrect: Math.random() > 0.3
        });
      }
      if (firstWord.includes('r')) {
        phonemes.push({
          phoneme: 'r',
          score: Math.random() > 0.2 ? 85 : 50,
          feedback: "The 'r' sound in English is retroflex; avoid touching the roof of your mouth.",
          isCorrect: Math.random() > 0.2
        });
      }
    }

    return phonemes;
  }

  async getStats() {
    const userId = authService.getUserId();
    if (!userId) return null;

    if (!this.isLoaded) await this.loadAttempts(userId);
    if (this.attempts.length === 0) return null;

    const totalScore = this.attempts.reduce((acc, curr) => acc + curr.score.overall, 0);
    const avgScore = Math.round(totalScore / this.attempts.length);
    
    const latestAttempt = this.attempts[this.attempts.length - 1];
    
    return {
      totalAttempts: this.attempts.length,
      averageScore: avgScore,
      latestScore: latestAttempt.score.overall,
      improvement: this.attempts.length > 1 ? avgScore - this.attempts[0].score.overall : 0
    };
  }
}

export const pronunciationService = new PronunciationService();
