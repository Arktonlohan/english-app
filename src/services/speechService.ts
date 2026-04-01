import { Speech, TranscriptStatus, TranscriptResult, TranscriptSegment, ContentReadiness, SpeechSourceType, TranscriptSource, TranscriptCacheEntry } from '../types';
import { MOCK_SPEECHES } from '../data/speeches';
import { GoogleGenAI, Type } from "@google/genai";

const CACHE_KEY = 'falai_transcript_cache';

class TranscriptCache {
  private cache: Record<string, TranscriptCacheEntry> = {};

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      try {
        this.cache = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse transcript cache', e);
        this.cache = {};
      }
    }
  }

  private save() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
  }

  get(videoId: string): TranscriptCacheEntry | null {
    return this.cache[videoId] || null;
  }

  set(videoId: string, transcript: TranscriptResult, source: TranscriptSource) {
    this.cache[videoId] = {
      videoId,
      transcript,
      timestamp: new Date().toISOString(),
      source
    };
    this.save();
  }
}

const transcriptCache = new TranscriptCache();

class SpeechService {
  /**
   * Validates if a string is a valid YouTube URL
   */
  validateYoutubeUrl(url: string): boolean {
    if (!url) return false;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return !!(match && match[7].length === 11);
  }

  /**
   * Extracts the YouTube video ID from a URL
   */
  extractVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  /**
   * Simulates importing a speech from YouTube
   * In a real app, this would call a backend to fetch video metadata and captions
   */
  async importFromYoutube(url: string): Promise<Speech> {
    const videoId = this.extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');

    // Simulate network delay for metadata fetching
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock response for a newly imported video
    const newSpeech: Speech = {
      id: `yt-${videoId}`,
      videoId: videoId,
      title: "Imported YouTube Content", // In real app, this would be fetched from YouTube API
      speaker: "YouTube Creator",
      category: "Podcasts",
      difficulty: "Intermediate",
      duration: "0:00", // Would be fetched
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: "Content imported from YouTube for personalized shadowing practice.",
      youtubeUrl: url,
      isImported: true,
      createdAt: new Date().toISOString(),
      readiness: 'processing', // Initial state
      sourceType: 'youtube',
      metadata: {
        channelTitle: "YouTube Channel",
        publishedAt: new Date().toISOString()
      },
      transcript: {
        status: 'processing',
        segments: [],
        source: 'youtube'
      }
    };

    return newSpeech;
  }

  /**
   * Fetches the transcript for a speech with support for different states
   */
  async getTranscript(speechId: string): Promise<TranscriptResult> {
    // 1. Check curated speeches
    const curatedSpeech = MOCK_SPEECHES.find(s => s.id === speechId);
    if (curatedSpeech) {
      if (curatedSpeech.transcript && curatedSpeech.transcript.segments.length > 0) {
        const sortedSegments = [...curatedSpeech.transcript.segments].sort((a, b) => a.start - b.start);
        return {
          status: 'available',
          segments: sortedSegments,
          source: curatedSpeech.transcript.source || 'curated'
        };
      }
    }

    // 2. Check Cache for YouTube videos
    const videoId = speechId.startsWith('yt-') ? speechId.replace('yt-', '') : speechId;
    const cached = transcriptCache.get(videoId);
    if (cached) {
      return {
        ...cached.transcript,
        source: cached.source || 'cache'
      };
    }

    // 3. Try YouTube Captions (Primary for imported)
    if (speechId.startsWith('yt-')) {
      try {
        const ytTranscript = await this.fetchYoutubeCaptions(videoId);
        if (ytTranscript.status === 'available') {
          transcriptCache.set(videoId, ytTranscript, 'youtube');
          return ytTranscript;
        }
      } catch (e) {
        console.warn('YouTube caption fetch failed', e);
      }

      // 4. Fallback to AI Transcription (Layer 2)
      // We don't auto-trigger AI transcription here to avoid costs/latency
      // The UI will offer a "Generate Transcript" button which calls generateAITranscript
      return {
        status: 'unavailable',
        segments: [],
        source: 'unavailable',
        videoId
      };
    }

    return {
      status: 'unavailable',
      segments: [],
      source: 'unavailable'
    };
  }

  /**
   * Attempts to fetch captions from YouTube
   * Note: This is a complex task from the frontend. In a real production app,
   * this would be handled by a backend proxy.
   */
  private async fetchYoutubeCaptions(videoId: string): Promise<TranscriptResult> {
    // In this environment, we simulate the fetch.
    // Real logic would involve fetching timedtext from YouTube.
    
    // For demonstration, we'll return unavailable for most, 
    // but we could implement a basic parser if we had the XML.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'unavailable',
      segments: [],
      source: 'unavailable',
      videoId
    };
  }

  /**
   * Parses an uploaded subtitle file (.srt or .vtt)
   */
  async parseSubtitleFile(file: File, videoId?: string): Promise<TranscriptResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error('Empty file'));
          return;
        }
        
        let segments: TranscriptSegment[] = [];
        try {
          if (file.name.toLowerCase().endsWith('.srt')) {
            segments = this.parseSrtTranscript(text);
          } else if (file.name.toLowerCase().endsWith('.vtt')) {
            segments = this.parseVttTranscript(text);
          } else {
            reject(new Error('Invalid subtitle file'));
            return;
          }
        } catch (err) {
          reject(new Error('Could not parse subtitle file'));
          return;
        }
        
        if (segments.length === 0) {
          reject(new Error('Could not parse subtitle file'));
          return;
        }
        
        const result: TranscriptResult = {
          status: 'available',
          source: 'uploaded-subtitle',
          segments,
          videoId,
          timestamp: new Date().toISOString()
        };

        // Cache it if we have a videoId
        if (videoId) {
          transcriptCache.set(videoId, result, 'uploaded-subtitle');
        }
        
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parses SRT content into segments
   */
  private parseSrtTranscript(text: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    // Normalize line endings and split by double newline to get blocks
    const blocks = text.replace(/\r\n/g, '\n').trim().split(/\n\n+/);
    
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;
      
      let timeLine = '';
      let textStartIndex = -1;
      
      // Find the time line (it contains -->)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timeLine = lines[i];
          textStartIndex = i + 1;
          break;
        }
      }
      
      if (!timeLine || textStartIndex === -1) continue;
      
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,. ]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,. ]\d{3})/);
      if (!timeMatch) continue;
      
      const start = this.timeToSeconds(timeMatch[1]);
      const end = this.timeToSeconds(timeMatch[2]);
      
      // Join all subsequent lines as the text content, remove HTML tags
      const content = lines.slice(textStartIndex).join(' ').replace(/<[^>]*>/g, '').trim();
      
      if (content) {
        segments.push({
          text: content,
          start,
          end,
          id: `srt-${segments.length}`
        });
      }
    }
    
    return segments.sort((a, b) => a.start - b.start);
  }

  /**
   * Parses VTT content into segments
   */
  private parseVttTranscript(text: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    // Normalize line endings and remove WEBVTT header
    const cleanText = text.replace(/\r\n/g, '\n').replace(/^WEBVTT[\s\S]*?\n\n/, '').trim();
    const blocks = cleanText.split(/\n\n+/);
    
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 1) continue;
      
      let timeLine = '';
      let textStartIndex = -1;
      
      // Find the time line (it contains -->)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timeLine = lines[i];
          textStartIndex = i + 1;
          break;
        }
      }
      
      if (!timeLine || textStartIndex === -1) continue;
      
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,. ]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,. ]\d{3})/);
      const shortTimeMatch = timeLine.match(/(\d{2}:\d{2}[,. ]\d{3})\s*-->\s*(\d{2}:\d{2}[,. ]\d{3})/);
      
      let start, end;
      if (timeMatch) {
        start = this.timeToSeconds(timeMatch[1]);
        end = this.timeToSeconds(timeMatch[2]);
      } else if (shortTimeMatch) {
        start = this.timeToSeconds('00:' + shortTimeMatch[1]);
        end = this.timeToSeconds('00:' + shortTimeMatch[2]);
      } else {
        continue;
      }
      
      // Join all subsequent lines as the text content, remove HTML tags
      const content = lines.slice(textStartIndex).join(' ').replace(/<[^>]*>/g, '').trim();
      
      if (content) {
        segments.push({
          text: content,
          start,
          end,
          id: `vtt-${segments.length}`
        });
      }
    }
    
    return segments.sort((a, b) => a.start - b.start);
  }

  /**
   * Helper to convert HH:MM:SS.mmm to seconds
   */
  private timeToSeconds(timeStr: string): number {
    const parts = timeStr.replace(',', '.').split(':');
    let seconds = 0;
    if (parts.length === 3) {
      seconds += parseInt(parts[0]) * 3600;
      seconds += parseInt(parts[1]) * 60;
      seconds += parseFloat(parts[2]);
    } else if (parts.length === 2) {
      seconds += parseInt(parts[0]) * 60;
      seconds += parseFloat(parts[1]);
    }
    return seconds;
  }

  /**
   * Generates a transcript using AI (Gemini)
   */
  async generateAITranscript(speechId: string): Promise<TranscriptResult> {
    const videoId = speechId.startsWith('yt-') ? speechId.replace('yt-', '') : speechId;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Transcribe the YouTube video with ID: ${videoId}. 
      Provide a structured transcript in JSON format.
      The output must be an array of segments, each with 'text', 'start' (seconds), and 'end' (seconds).
      Focus on accuracy and timing. If you cannot access the video, provide the most likely transcript if it's a famous speech or video.
      If it's a generic video you don't know, return an empty array.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                start: { type: Type.NUMBER },
                end: { type: Type.NUMBER }
              },
              required: ["text", "start", "end"]
            }
          }
        }
      });

      const segments = JSON.parse(response.text || '[]');
      
      if (segments.length > 0) {
        const result: TranscriptResult = {
          status: 'available',
          segments,
          source: 'ai',
          videoId,
          timestamp: new Date().toISOString()
        };
        transcriptCache.set(videoId, result, 'ai');
        return result;
      }

      return { status: 'unavailable', segments: [], source: 'unavailable', videoId };
    } catch (error) {
      console.error('AI Transcription failed', error);
      return { status: 'error', segments: [], source: 'unavailable', videoId };
    }
  }


  /**
   * Speaks the given text using browser speech synthesis with high-quality voice selection
   */
  async speak(text: string, options: { slow?: boolean; voicePreference?: 'us' | 'gb' } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported in this browser.'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure rate
      utterance.rate = options.slow ? 0.6 : 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Voice selection strategy
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        // Preferred voice patterns
        const preferredPatterns = options.voicePreference === 'gb' 
          ? ['Google UK English Female', 'Google UK English Male', 'Daniel', 'Serena', 'en-GB']
          : ['Google US English', 'Samantha', 'Alex', 'en-US'];

        // Try to find a high-quality preferred voice
        let selectedVoice = null;
        
        for (const pattern of preferredPatterns) {
          selectedVoice = voices.find(v => v.name.includes(pattern) || v.lang.includes(pattern));
          if (selectedVoice) break;
        }

        // Fallback to any English voice if preferred not found
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else {
          utterance.lang = options.voicePreference === 'gb' ? 'en-GB' : 'en-US';
        }
      } else {
        // If voices aren't loaded yet, set language and hope for the best
        utterance.lang = options.voicePreference === 'gb' ? 'en-GB' : 'en-US';
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error', event);
        if (event.error === 'interrupted') {
          resolve(); // Interrupted is often intentional (new speech started)
        } else {
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        }
      };

      // Some browsers need a small delay or voices might not be ready
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Checks if speech synthesis is supported and available
   */
  isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }
}

export const speechService = new SpeechService();
