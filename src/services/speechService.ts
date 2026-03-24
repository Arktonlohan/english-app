import { Speech, Transcript, TranscriptState, ContentReadiness, SpeechSourceType } from '../types';

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
        speechId: `yt-${videoId}`,
        state: 'loading',
        sentences: []
      }
    };

    return newSpeech;
  }

  /**
   * Fetches the transcript for a speech with support for different states
   */
  async getTranscript(speechId: string): Promise<Transcript> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For mock purposes, we'll return a generated transcript if it's an imported video
    if (speechId.startsWith('yt-')) {
      // Simulate a 10% chance of transcript being unavailable to test fallbacks
      const random = Math.random();
      if (random < 0.1) {
        return {
          speechId,
          state: 'unavailable',
          sentences: []
        };
      }
      
      // Simulate a 15% chance of returning a mock/simplified transcript
      if (random < 0.25) {
        return {
          speechId,
          state: 'mock',
          source: 'fallback',
          sentences: this.generateMockTranscript(speechId).sentences.slice(0, 1) // Just one sentence
        };
      }

      return this.generateMockTranscript(speechId);
    }

    // Curated speeches usually have transcripts
    return this.generateMockTranscript(speechId);
  }

  /**
   * Updates the readiness state of a speech based on its transcript
   */
  getReadinessFromTranscript(transcript: Transcript): ContentReadiness {
    switch (transcript.state) {
      case 'available':
      case 'mock':
        return 'ready';
      case 'loading':
        return 'processing';
      case 'unavailable':
        return 'no_transcript';
      case 'error':
        return 'error';
      default:
        return 'processing';
    }
  }

  /**
   * Generates a mock transcript for testing fallbacks and loading states
   */
  generateMockTranscript(speechId: string): Transcript {
    return {
      speechId,
      state: 'available',
      source: 'ai_generated',
      sentences: [
        {
          id: "s1",
          startTime: 0,
          endTime: 5.5,
          text: "Welcome to this amazing lesson on how to speak like a native speaker.",
          words: [
            { text: "Welcome", startTime: 0, endTime: 0.5, ipa: "/ˈwɛlkəm/", meaning: "To greet someone in a polite or friendly way", translation: "Bienvenido", example: "Welcome to our home!" },
            { text: "to", startTime: 0.5, endTime: 0.7 },
            { text: "this", startTime: 0.7, endTime: 1.0 },
            { text: "amazing", startTime: 1.0, endTime: 1.6, ipa: "/əˈmeɪzɪŋ/", meaning: "Causing great surprise or wonder", translation: "increíble", example: "The view was amazing." },
            { text: "lesson", startTime: 1.6, endTime: 2.1, ipa: "/ˈlɛsən/", meaning: "A period of learning or teaching", translation: "lección", example: "I have a piano lesson today." },
            { text: "on", startTime: 2.1, endTime: 2.3 },
            { text: "how", startTime: 2.3, endTime: 2.6 },
            { text: "to", startTime: 2.6, endTime: 2.8 },
            { text: "speak", startTime: 2.8, endTime: 3.3, ipa: "/spiːk/", meaning: "To say something in order to convey information", translation: "hablar", example: "She speaks three languages." },
            { text: "like", startTime: 3.3, endTime: 3.6 },
            { text: "a", startTime: 3.6, endTime: 3.8 },
            { text: "native", startTime: 3.8, endTime: 4.5, ipa: "/ˈneɪtɪv/", meaning: "A person born in a specified place", translation: "nativo", example: "He is a native of New York." },
            { text: "speaker.", startTime: 4.5, endTime: 5.5, ipa: "/ˈspiːkər/", meaning: "A person who speaks a specified language", translation: "hablante", example: "She is a fluent speaker." }
          ],
          translation: "Bienvenido a esta increíble lección sobre cómo hablar como un hablante nativo."
        },
        {
          id: "s2",
          startTime: 6.0,
          endTime: 11.0,
          text: "The key is not just vocabulary, but rhythm and intonation.",
          words: [
            { text: "The", startTime: 6.0, endTime: 6.2 },
            { text: "key", startTime: 6.2, endTime: 6.6, ipa: "/kiː/", meaning: "A thing that provides a means of achieving something", translation: "clave", example: "The key to success is hard work." },
            { text: "is", startTime: 6.6, endTime: 6.8 },
            { text: "not", startTime: 6.8, endTime: 7.1 },
            { text: "just", startTime: 7.1, endTime: 7.5 },
            { text: "vocabulary,", startTime: 7.5, endTime: 8.5, ipa: "/vəˈkæbjʊləri/", meaning: "The body of words used in a particular language", translation: "vocabulario", example: "He has a wide vocabulary." },
            { text: "but", startTime: 8.5, endTime: 8.8 },
            { text: "rhythm", startTime: 8.8, endTime: 9.5, ipa: "/ˈrɪðəm/", meaning: "A strong, regular, repeated pattern of movement or sound", translation: "ritmo", example: "The rhythm of the music was catchy." },
            { text: "and", startTime: 9.5, endTime: 9.8 },
            { text: "intonation.", startTime: 9.8, endTime: 11.0, ipa: "/ˌɪntəˈneɪʃən/", meaning: "The rise and fall of the voice in speaking", translation: "entonación", example: "English has a complex intonation system." }
          ],
          translation: "La clave no es solo el vocabulario, sino el ritmo y la entonación."
        },
        {
          id: "s3",
          startTime: 11.5,
          endTime: 16.0,
          text: "Practice every day to improve your fluency and confidence.",
          words: [
            { text: "Practice", startTime: 11.5, endTime: 12.2, ipa: "/ˈpræktɪs/", meaning: "Perform an activity or exercise regularly", translation: "Práctica", example: "Practice makes perfect." },
            { text: "every", startTime: 12.2, endTime: 12.5 },
            { text: "day", startTime: 12.5, endTime: 12.8 },
            { text: "to", startTime: 12.8, endTime: 13.0 },
            { text: "improve", startTime: 13.0, endTime: 13.6, ipa: "/ɪmˈpruːv/", meaning: "Make or become better", translation: "mejorar", example: "I want to improve my English." },
            { text: "your", startTime: 13.6, endTime: 13.8 },
            { text: "fluency", startTime: 13.8, endTime: 14.5, ipa: "/ˈfluːənsi/", meaning: "The quality or condition of being fluent", translation: "fluidez", example: "Fluency is important for communication." },
            { text: "and", startTime: 14.5, endTime: 14.8 },
            { text: "confidence.", startTime: 14.8, endTime: 16.0, ipa: "/ˈkɒnfɪdəns/", meaning: "The feeling or belief that one can rely on someone or something", translation: "confianza", example: "She has a lot of confidence." }
          ],
          translation: "Practica todos los días para mejorar tu fluidez y confianza."
        }
      ]
    };
  }
}

export const speechService = new SpeechService();
