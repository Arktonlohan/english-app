import { User, LoginCredentials, SignupCredentials } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AUTH_KEY = 'fluent_auth_user';

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  private isInitialized = false;
  private authReady = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (isSupabaseConfigured) {
      await this.initSupabaseAuth();
    } else {
      this.initLocalAuth();
    }
    this.authReady = true;
    this.notifyListeners();
  }

  public isReady(): boolean {
    return this.authReady;
  }

  private initLocalAuth() {
    try {
      const savedUser = localStorage.getItem(AUTH_KEY);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Verify if this user still exists in our local profiles to get latest data
        const profiles = this.getLocalProfiles();
        const profile = profiles.find(p => p.id === user.id);
        if (profile) {
          this.currentUser = profile;
        } else {
          this.currentUser = user;
        }
      }
    } catch (e) {
      console.error('Failed to init local auth:', e);
    } finally {
      this.isInitialized = true;
      this.notifyListeners();
    }
  }

  private getLocalProfiles(): User[] {
    const stored = localStorage.getItem('fluent_local_profiles');
    return stored ? JSON.parse(stored) : [];
  }

  private getLocalCredentials(): Record<string, string> {
    const stored = localStorage.getItem('fluent_local_credentials');
    return stored ? JSON.parse(stored) : {};
  }

  private saveLocalProfile(user: User) {
    const profiles = this.getLocalProfiles();
    const index = profiles.findIndex(p => p.id === user.id || p.email.toLowerCase() === user.email.toLowerCase());
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...user };
    } else {
      profiles.push(user);
    }
    localStorage.setItem('fluent_local_profiles', JSON.stringify(profiles));
  }

  private saveLocalCredentials(email: string, pass: string) {
    const credentials = this.getLocalCredentials();
    credentials[email.toLowerCase()] = pass;
    localStorage.setItem('fluent_local_credentials', JSON.stringify(credentials));
  }

  private generateLocalId(email: string): string {
    // Simple stable ID generation from email
    return 'local-' + btoa(email.toLowerCase()).replace(/=/g, '').substring(0, 12);
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
        nativeLanguage: profile?.target_language || 'English',
        dailyGoal: profile?.daily_goal || 15,
        theme: profile?.theme || 'system',
        notificationsEnabled: profile?.notifications_enabled ?? true,
        subtitleSize: profile?.subtitle_size || 'md'
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
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login failed');
      
      await this.handleUserAuthenticated(data.user);
      return this.currentUser!;
    }

    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const profiles = this.getLocalProfiles();
    const existingUser = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      throw new Error('Account not found. Please sign up first.');
    }

    const credentials = this.getLocalCredentials();
    const storedPassword = credentials[email.toLowerCase()];

    if (storedPassword && storedPassword !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    this.currentUser = existingUser;
    localStorage.setItem(AUTH_KEY, JSON.stringify(existingUser));
    this.notifyListeners();
    return existingUser;
  }

  async signUp(email: string, password: string, name?: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

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
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userId = this.generateLocalId(email);
    const profiles = this.getLocalProfiles();
    const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      displayName: name || email.split('@')[0],
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      streak: 0,
      learningStats: {
        totalWordsLearned: 0,
        totalShadowingSessions: 0,
        totalTimeSpent: 0,
        points: 0,
        level: 1
      },
      preferences: {
        nativeLanguage: 'English',
        dailyGoal: 15,
        theme: 'system',
        notificationsEnabled: true,
        subtitleSize: 'md'
      }
    };

    this.saveLocalProfile(user);
    this.saveLocalCredentials(email, password);
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
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          }
        }
      });
      if (error) throw error;
    } else {
      // Do not auto-login with mock account
      throw new Error('Google Sign-In is not configured for this environment. Please use email and password.');
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

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<void> {
    if (!this.currentUser) return;

    const newPreferences = {
      ...this.currentUser.preferences,
      ...preferences
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({
          target_language: newPreferences.nativeLanguage,
          daily_goal: newPreferences.dailyGoal,
          theme: newPreferences.theme,
          notifications_enabled: newPreferences.notificationsEnabled,
          subtitle_size: newPreferences.subtitleSize
        })
        .eq('id', this.currentUser.id);

      if (error) throw error;
    }

    this.currentUser = {
      ...this.currentUser,
      preferences: newPreferences
    };

    if (!isSupabaseConfigured) {
      this.saveLocalProfile(this.currentUser);
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
  }
}

export const authService = new AuthService();
