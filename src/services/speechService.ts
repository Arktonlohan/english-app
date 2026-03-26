import { Speech, TranscriptStatus, TranscriptResult, TranscriptSegment, ContentReadiness, SpeechSourceType } from '../types';
import { MOCK_SPEECHES } from '../data/speeches';

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
        segments: []
      }
    };

    return newSpeech;
  }

  /**
   * Fetches the transcript for a speech with support for different states
   */
  async getTranscript(speechId: string): Promise<TranscriptResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Check curated speeches
    const curatedSpeech = MOCK_SPEECHES.find(s => s.id === speechId);
    if (curatedSpeech && curatedSpeech.transcript && curatedSpeech.transcript.segments.length > 0) {
      // Sort segments by start time to ensure correct order
      const sortedSegments = [...curatedSpeech.transcript.segments].sort((a, b) => a.start - b.start);
      return {
        status: 'available',
        segments: sortedSegments
      };
    }

    // 2. For YouTube videos or curated without transcript, return unavailable
    return {
      status: 'unavailable',
      segments: []
    };
  }

  /**
   * Mock for AI-generated transcription
   * In this version, we return unavailable to be honest as requested
   */
  async generateAITranscript(speechId: string): Promise<TranscriptResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      status: 'unavailable',
      segments: []
    };
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
