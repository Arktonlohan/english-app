import { User, LoginCredentials, SignupCredentials } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AUTH_KEY = 'fluent_auth_user';

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  private isInitialized = false;

  constructor() {
    if (isSupabaseConfigured) {
      this.initSupabaseAuth();
    } else {
      const savedUser = localStorage.getItem(AUTH_KEY);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
      this.isInitialized = true;
      this.notifyListeners();
    }
  }

  private async initSupabaseAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.handleUserAuthenticated(session.user);
      } else {
        this.isInitialized = true;
        this.notifyListeners();
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await this.handleUserAuthenticated(session.user);
        } else {
          this.currentUser = null;
          this.notifyListeners();
        }
      });
    } catch (error) {
      console.error('Supabase auth initialization failed:', error);
      this.isInitialized = true;
      this.notifyListeners();
    }
  }

  private async handleUserAuthenticated(sbUser: any) {
    // Fetch or create profile
    const profile = await this.getOrCreateProfile(sbUser);
    this.currentUser = this.mapToUser(sbUser, profile);
    this.isInitialized = true;
    this.notifyListeners();
  }

  private async getOrCreateProfile(sbUser: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const metadata = sbUser.user_metadata || {};
        const newProfile = {
          id: sbUser.id,
          email: sbUser.email,
          full_name: metadata.full_name || sbUser.email?.split('@')[0],
          avatar_url: metadata.avatar_url,
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        return created;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      return null;
    }
  }

  private mapToUser(sbUser: any, profile: any): User {
    const metadata = sbUser.user_metadata || {};
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      displayName: profile?.full_name || metadata.full_name || sbUser.email?.split('@')[0],
      photoURL: profile?.avatar_url || metadata.avatar_url,
      authProvider: sbUser.app_metadata?.provider === 'google' ? 'google' : 'email',
      createdAt: sbUser.created_at,
      streak: profile?.streak || 0,
      learningStats: {
        totalWordsLearned: profile?.total_words_learned || 0,
        totalShadowingSessions: profile?.total_sessions || 0,
        totalTimeSpent: profile?.total_time || 0,
        lastStudyDate: profile?.last_study_date,
        points: profile?.points || 0,
        level: profile?.level || 1
      },
      preferences: {
        targetLanguage: profile?.target_language || 'English',
        dailyGoal: profile?.daily_goal || 15,
        theme: profile?.theme || 'system',
        notificationsEnabled: profile?.notifications_enabled ?? true
      }
    };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserId(): string | null {
    return this.currentUser?.id || null;
  }

  isAuthReady(): boolean {
    return this.isInitialized;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  async login(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login failed');
      
      await this.handleUserAuthenticated(data.user);
      return this.currentUser!;
    }

    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user: User = {
      id: 'local-user-123',
      email,
      displayName: email.split('@')[0],
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      streak: 5,
      learningStats: {
        totalWordsLearned: 45,
        totalShadowingSessions: 12,
        totalTimeSpent: 120
      },
      preferences: {
        targetLanguage: 'English',
        dailyGoal: 15
      }
    };

    this.currentUser = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  async signUp(email: string, password: string, name?: string): Promise<User> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed');
      
      await this.handleUserAuthenticated(data.user);
      return this.currentUser!;
    }

    // Mock sign up logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user: User = {
      id: 'local-user-' + Math.random().toString(36).substr(2, 9),
      email,
      displayName: name || email.split('@')[0],
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      streak: 0,
      learningStats: {
        totalWordsLearned: 0,
        totalShadowingSessions: 0,
        totalTimeSpent: 0
      },
      preferences: {
        targetLanguage: 'English',
        dailyGoal: 15
      }
    };

    this.currentUser = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  async loginWithGoogle(): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } else {
      alert('Google login is only available when Supabase is configured.');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } else {
      console.log('Reset link sent to:', email);
    }
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
    this.notifyListeners();
  }
}

export const authService = new AuthService();
