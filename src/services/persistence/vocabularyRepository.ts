import { VocabularyWord } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface VocabularyRepository {
  getWords(userId: string): Promise<VocabularyWord[]>;
  saveWord(userId: string, word: VocabularyWord): Promise<void>;
  updateWord(userId: string, word: VocabularyWord): Promise<void>;
  deleteWord(userId: string, wordId: string): Promise<void>;
}

class LocalVocabularyRepository implements VocabularyRepository {
  private getStorageKey(userId: string): string {
    return `vocalis_vocab_${userId}`;
  }

  async getWords(userId: string): Promise<VocabularyWord[]> {
    const stored = localStorage.getItem(this.getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  }

  async saveWord(userId: string, word: VocabularyWord): Promise<void> {
    const words = await this.getWords(userId);
    words.unshift(word);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(words));
  }

  async updateWord(userId: string, word: VocabularyWord): Promise<void> {
    const words = await this.getWords(userId);
    const index = words.findIndex(w => w.id === word.id);
    if (index !== -1) {
      words[index] = word;
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(words));
    }
  }

  async deleteWord(userId: string, wordId: string): Promise<void> {
    const words = await this.getWords(userId);
    const filtered = words.filter(w => w.id !== wordId);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(filtered));
  }
}

class SupabaseVocabularyRepository implements VocabularyRepository {
  async getWords(userId: string): Promise<VocabularyWord[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(this.mapFromDb);
    } catch (error) {
      console.error('Error fetching vocabulary from Supabase:', error);
      throw error;
    }
  }

  async saveWord(userId: string, word: VocabularyWord): Promise<void> {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .insert([this.mapToDb(word, userId)]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving word to Supabase:', error);
      throw error;
    }
  }

  async updateWord(userId: string, word: VocabularyWord): Promise<void> {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update(this.mapToDb(word, userId))
        .eq('id', word.id)
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating word in Supabase:', error);
      throw error;
    }
  }

  async deleteWord(userId: string, wordId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', wordId)
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting word from Supabase:', error);
      throw error;
    }
  }

  private mapToDb(word: VocabularyWord, userId: string) {
    return {
      id: word.id.startsWith('v-') ? undefined : word.id,
      user_id: userId,
      text: word.text,
      ipa: word.ipa,
      meaning: word.meaning,
      example: word.example,
      translation: word.translation,
      source_speech_id: word.sourceSpeechId,
      source_sentence_id: word.sourceSentenceId,
      mastery: word.mastery,
      srs_level: word.srsLevel?.toUpperCase() || 'NEW',
      next_review: word.nextReview,
      last_reviewed: word.lastReviewed,
      is_difficult: word.isDifficult || false
    };
  }

  private mapFromDb(dbWord: any): VocabularyWord {
    return {
      id: dbWord.id,
      text: dbWord.text,
      ipa: dbWord.ipa,
      meaning: dbWord.meaning,
      example: dbWord.example,
      translation: dbWord.translation,
      sourceSpeechId: dbWord.source_speech_id,
      sourceSentenceId: dbWord.source_sentence_id,
      mastery: dbWord.mastery || 0,
      addedAt: dbWord.created_at,
      lastReviewed: dbWord.last_reviewed,
      nextReview: dbWord.next_review,
      srsLevel: dbWord.srs_level?.toLowerCase() as any,
      isDifficult: dbWord.is_difficult
    };
  }
}

export const vocabularyRepository: VocabularyRepository = isSupabaseConfigured 
  ? new SupabaseVocabularyRepository() 
  : new LocalVocabularyRepository();
