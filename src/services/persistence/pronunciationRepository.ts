import { PronunciationAttempt } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface PronunciationRepository {
  getAttempts(userId: string): Promise<PronunciationAttempt[]>;
  saveAttempt(userId: string, attempt: PronunciationAttempt): Promise<void>;
  deleteAttempt(userId: string, attemptId: string): Promise<void>;
}

class LocalPronunciationRepository implements PronunciationRepository {
  private getStorageKey(userId: string) {
    return `vocalis_pronunciation_${userId}`;
  }

  async getAttempts(userId: string): Promise<PronunciationAttempt[]> {
    const saved = localStorage.getItem(this.getStorageKey(userId));
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse pronunciation attempts', e);
      return [];
    }
  }

  async saveAttempt(userId: string, attempt: PronunciationAttempt): Promise<void> {
    const attempts = await this.getAttempts(userId);
    attempts.push(attempt);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(attempts));
  }

  async deleteAttempt(userId: string, attemptId: string): Promise<void> {
    let attempts = await this.getAttempts(userId);
    attempts = attempts.filter(a => a.id !== attemptId);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(attempts));
  }
}

class SupabasePronunciationRepository implements PronunciationRepository {
  async getAttempts(userId: string): Promise<PronunciationAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('pronunciation_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        text: item.text,
        ipa: item.ipa,
        timestamp: item.timestamp,
        score: item.score,
        feedback: item.feedback,
        strengths: item.strengths,
        improvements: item.improvements,
        phonemes: item.phonemes,
        words: item.words,
        duration: item.duration,
        audioUrl: item.audio_url
      }));
    } catch (error) {
      console.error('Error fetching pronunciation attempts from Supabase:', error);
      return [];
    }
  }

  async saveAttempt(userId: string, attempt: PronunciationAttempt): Promise<void> {
    try {
      const { error } = await supabase
        .from('pronunciation_attempts')
        .insert([{
          id: attempt.id,
          user_id: userId,
          text: attempt.text,
          ipa: attempt.ipa,
          timestamp: attempt.timestamp,
          score: attempt.score,
          feedback: attempt.feedback,
          strengths: attempt.strengths,
          improvements: attempt.improvements,
          phonemes: attempt.phonemes,
          words: attempt.words,
          duration: attempt.duration,
          audio_url: attempt.audioUrl
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving pronunciation attempt to Supabase:', error);
      throw error;
    }
  }

  async deleteAttempt(userId: string, attemptId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pronunciation_attempts')
        .delete()
        .eq('id', attemptId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting pronunciation attempt from Supabase:', error);
      throw error;
    }
  }
}

export const pronunciationRepository: PronunciationRepository = isSupabaseConfigured
  ? new SupabasePronunciationRepository()
  : new LocalPronunciationRepository();
