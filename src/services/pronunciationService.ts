import { 
  PronunciationAttempt, 
  PronunciationPracticeItem, 
  PronunciationScore, 
  PhonemeFeedback,
  WordFeedback,
  SyllableFeedback
} from '../types';
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
    window.dispatchEvent(new CustomEvent('falai_pronunciation_update'));
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

  async analyzePronunciation(text: string, audioBlob: Blob, duration: number): Promise<PronunciationAttempt> {
    const userId = authService.getUserId();
    if (!userId) throw new Error('User must be logged in to analyze pronunciation');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Believable analysis logic
    const wordCount = text.split(' ').length;
    
    // Ideal duration is roughly 0.3-0.6 seconds per word for fluent speech
    const idealDuration = Math.max(0.5, wordCount * 0.4);
    const durationRatio = duration / idealDuration;
    
    // Score factors
    let fluencyModifier = 0;
    if (durationRatio < 0.5) fluencyModifier = -20; // Too fast
    else if (durationRatio > 2.0) fluencyModifier = -15; // Too slow
    else if (durationRatio > 1.2) fluencyModifier = -5; // Slightly slow
    
    // Base scores with some randomness but influenced by "logic"
    const baseAccuracy = 82 + (Math.random() * 12);
    const baseFluency = 78 + fluencyModifier + (Math.random() * 15);
    const baseStress = 75 + (Math.random() * 15);
    const baseRhythm = 70 + (Math.random() * 20);
    const baseIntonation = 75 + (Math.random() * 15);

    const score: PronunciationScore = {
      overall: Math.round((baseAccuracy + baseFluency + baseStress + baseRhythm + baseIntonation) / 5),
      accuracy: Math.round(baseAccuracy),
      fluency: Math.round(baseFluency),
      stress: Math.round(baseStress),
      rhythm: Math.round(baseRhythm),
      intonation: Math.round(baseIntonation)
    };

    const strengths: string[] = [];
    const improvements: string[] = [];
    
    if (score.accuracy > 85) strengths.push("Clear articulation of individual sounds.");
    if (score.fluency > 85) strengths.push("Natural pace and smooth transitions.");
    if (score.stress > 80) strengths.push("Correct emphasis on stressed syllables.");
    
    if (score.accuracy < 80) improvements.push("Focus on vowel clarity in multi-syllable words.");
    if (durationRatio > 1.5) improvements.push("Try to reduce pauses between words for better flow.");
    if (score.intonation < 80) improvements.push("Work on rising and falling pitch at sentence ends.");

    const feedback = this.generateFeedback(score);
    const phonemes = this.generatePhonemeFeedback(text);
    const words = this.generateWordFeedback(text);

    const attempt: PronunciationAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date().toISOString(),
      score,
      feedback,
      strengths,
      improvements,
      phonemes,
      words,
      duration,
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
    const words = text.toLowerCase().split(/\s+/);
    const phonemes: PhonemeFeedback[] = [];
    
    // Comprehensive phoneme mapping for common English sounds
    const phonemeMap: Record<string, { symbol: string; feedback: string; tip: string }> = {
      'th': { 
        symbol: 'θ', 
        feedback: "The 'th' sound should be produced with the tongue between the teeth.",
        tip: "Place the tip of your tongue between your upper and lower front teeth. Blow air out gently."
      },
      'r': { 
        symbol: 'r', 
        feedback: "The 'r' sound in English is retroflex; avoid touching the roof of your mouth.",
        tip: "Curl the tip of your tongue back slightly without touching the roof of your mouth. Keep your lips slightly rounded."
      },
      'l': { 
        symbol: 'l', 
        feedback: "The 'l' sound requires the tip of the tongue to touch the alveolar ridge.",
        tip: "Touch the tip of your tongue to the ridge just behind your upper front teeth. Let air flow around the sides of your tongue."
      },
      'v': { 
        symbol: 'v', 
        feedback: "The 'v' sound is a voiced labiodental fricative.",
        tip: "Touch your upper teeth to your lower lip and blow air through while vibrating your vocal cords."
      },
      'w': { 
        symbol: 'w', 
        feedback: "The 'w' sound is a voiced labio-velar approximant.",
        tip: "Round your lips tightly as if you're about to whistle, then quickly move them apart while making a sound."
      },
      'sh': { 
        symbol: 'ʃ', 
        feedback: "The 'sh' sound is a voiceless palato-alveolar fricative.",
        tip: "Push your lips forward slightly and blow air through the space between your tongue and the roof of your mouth."
      }
    };

    // Check for phonemes in the text
    Object.keys(phonemeMap).forEach(key => {
      if (text.toLowerCase().includes(key)) {
        const data = phonemeMap[key];
        const isCorrect = Math.random() > 0.3;
        phonemes.push({
          phoneme: data.symbol,
          score: isCorrect ? Math.round(85 + Math.random() * 15) : Math.round(40 + Math.random() * 30),
          feedback: data.feedback,
          isCorrect
        });
      }
    });

    // If no specific phonemes found, add a generic vowel one
    if (phonemes.length === 0) {
      phonemes.push({
        phoneme: 'ə',
        score: Math.round(75 + Math.random() * 25),
        feedback: "The schwa sound /ə/ is the most common sound in English.",
        isCorrect: true
      });
    }

    return phonemes.slice(0, 3); // Limit to 3 for UI clarity
  }

  private generateWordFeedback(text: string): WordFeedback[] {
    const rawWords = text.split(' ');
    return rawWords.map(word => {
      const syllables = this.mockSyllables(word);
      const wordScore = Math.round(75 + Math.random() * 25);
      
      return {
        text: word,
        score: wordScore,
        syllables,
        phonemes: [] // Could add word-specific phonemes here
      };
    });
  }

  private mockSyllables(word: string): SyllableFeedback[] {
    const cleanWord = word.replace(/[.,!?;]/g, '');
    const len = cleanWord.length;
    
    // Very basic mock syllable splitter
    if (len <= 4) {
      return [{ text: cleanWord, isStressed: true, score: Math.round(80 + Math.random() * 20) }];
    } else if (len <= 7) {
      const mid = Math.floor(len / 2);
      return [
        { text: cleanWord.substring(0, mid), isStressed: true, score: Math.round(80 + Math.random() * 20) },
        { text: cleanWord.substring(mid), isStressed: false, score: Math.round(70 + Math.random() * 30) }
      ];
    } else {
      const part = Math.floor(len / 3);
      return [
        { text: cleanWord.substring(0, part), isStressed: false, score: Math.round(70 + Math.random() * 30) },
        { text: cleanWord.substring(part, part * 2), isStressed: true, score: Math.round(80 + Math.random() * 20) },
        { text: cleanWord.substring(part * 2), isStressed: false, score: Math.round(70 + Math.random() * 30) }
      ];
    }
  }

  async getStats() {
    const userId = authService.getUserId();
    if (!userId) return null;

    if (!this.isLoaded) await this.loadAttempts(userId);
    if (this.attempts.length === 0) return null;

    const totalScore = this.attempts.reduce((acc, curr) => acc + curr.score.overall, 0);
    const avgScore = Math.round(totalScore / this.attempts.length);
    
    const latestAttempt = this.attempts[0]; // Already sorted in getAttempts
    
    return {
      totalAttempts: this.attempts.length,
      averageScore: avgScore,
      latestScore: latestAttempt?.score.overall || 0,
      improvement: this.attempts.length > 1 ? avgScore - this.attempts[this.attempts.length - 1].score.overall : 0
    };
  }
}

export const pronunciationService = new PronunciationService();
