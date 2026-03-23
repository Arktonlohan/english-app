import { SpeechProgress, ShadowingSession } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface ProgressRepository {
  getSpeechProgress(userId: string, speechId: string): Promise<SpeechProgress>;
  saveSpeechProgress(userId: string, progress: SpeechProgress): Promise<void>;
  getAllProgress(userId: string): Promise<{ [key: string]: SpeechProgress }>;
  saveSession(userId: string, session: ShadowingSession): Promise<void>;
  getAllSessions(userId: string): Promise<ShadowingSession[]>;
}

class LocalProgressRepository implements ProgressRepository {
  private getProgressKey(userId: string, speechId: string): string {
    return `fluent_progress_${userId}_${speechId}`;
  }

  private getSessionsKey(userId: string): string {
    return `fluent_sessions_${userId}`;
  }

  async getSpeechProgress(userId: string, speechId: string): Promise<SpeechProgress> {
    const saved = localStorage.getItem(this.getProgressKey(userId, speechId));
    if (saved) return JSON.parse(saved);
    return {
      speechId,
      lastPosition: 0,
      difficultSentenceIds: [],
      completedSentenceIds: [],
      savedWordsCount: 0,
      lastStudiedAt: new Date().toISOString(),
      totalTimeSpent: 0
    };
  }

  async saveSpeechProgress(userId: string, progress: SpeechProgress): Promise<void> {
    localStorage.setItem(this.getProgressKey(userId, progress.speechId), JSON.stringify(progress));
  }

  async getAllProgress(userId: string): Promise<{ [key: string]: SpeechProgress }> {
    const allProgress: { [key: string]: SpeechProgress } = {};
    const prefix = `fluent_progress_${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const speechId = key.replace(prefix, '');
        allProgress[speechId] = await this.getSpeechProgress(userId, speechId);
      }
    }
    return allProgress;
  }

  async saveSession(userId: string, session: ShadowingSession): Promise<void> {
    const sessions = await this.getAllSessions(userId);
    sessions.push(session);
    localStorage.setItem(this.getSessionsKey(userId), JSON.stringify(sessions));
  }

  async getAllSessions(userId: string): Promise<ShadowingSession[]> {
    const data = localStorage.getItem(this.getSessionsKey(userId));
    return data ? JSON.parse(data) : [];
  }
}

class SupabaseProgressRepository implements ProgressRepository {
  async getSpeechProgress(userId: string, speechId: string): Promise<SpeechProgress> {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('speech_id', speechId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        return {
          speechId,
          lastPosition: 0,
          difficultSentenceIds: [],
          completedSentenceIds: [],
          savedWordsCount: 0,
          lastStudiedAt: new Date().toISOString(),
          totalTimeSpent: 0
        };
      }

      return this.mapFromDb(data);
    } catch (error) {
      console.error('Error fetching speech progress from Supabase:', error);
      throw error;
    }
  }

  async saveSpeechProgress(userId: string, progress: SpeechProgress): Promise<void> {
    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: userId,
          speech_id: progress.speechId,
          last_position: progress.lastPosition,
          completed_sentence_ids: progress.completedSentenceIds,
          difficult_sentence_ids: progress.difficultSentenceIds,
          saved_words_count: progress.savedWordsCount,
          total_time_spent: progress.totalTimeSpent,
          last_studied_at: progress.lastStudiedAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, speech_id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving speech progress to Supabase:', error);
      throw error;
    }
  }

  async getAllProgress(userId: string): Promise<{ [key: string]: SpeechProgress }> {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const result: { [key: string]: SpeechProgress } = {};
      (data || []).forEach(item => {
        const progress = this.mapFromDb(item);
        result[progress.speechId] = progress;
      });
      return result;
    } catch (error) {
      console.error('Error fetching all progress from Supabase:', error);
      return {};
    }
  }

  async saveSession(userId: string, session: ShadowingSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .insert([{
          user_id: userId,
          speech_id: session.speechId,
          start_time: session.startTime,
          end_time: session.endTime,
          duration: session.duration,
          sentences_completed: session.sentencesCompleted,
          difficult_sentences_reviewed: session.difficultSentencesReviewed,
          words_saved: session.wordsSaved
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving session to Supabase:', error);
      throw error;
    }
  }

  async getAllSessions(userId: string): Promise<ShadowingSession[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(this.mapSessionFromDb);
    } catch (error) {
      console.error('Error fetching sessions from Supabase:', error);
      return [];
    }
  }

  private mapFromDb(dbProgress: any): SpeechProgress {
    return {
      speechId: dbProgress.speech_id,
      lastPosition: dbProgress.last_position,
      completedSentenceIds: dbProgress.completed_sentence_ids || [],
      difficultSentenceIds: dbProgress.difficult_sentence_ids || [],
      savedWordsCount: dbProgress.saved_words_count || 0,
      lastStudiedAt: dbProgress.last_studied_at || dbProgress.updated_at,
      totalTimeSpent: dbProgress.total_time_spent || 0
    };
  }

  private mapSessionFromDb(dbSession: any): ShadowingSession {
    return {
      id: dbSession.id,
      speechId: dbSession.speech_id,
      startTime: dbSession.start_time,
      endTime: dbSession.end_time,
      duration: dbSession.duration,
      sentencesCompleted: dbSession.sentences_completed,
      difficultSentencesReviewed: dbSession.difficult_sentences_reviewed,
      wordsSaved: dbSession.words_saved
    };
  }
}

export const progressRepository: ProgressRepository = isSupabaseConfigured 
  ? new SupabaseProgressRepository() 
  : new LocalProgressRepository();
