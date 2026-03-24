import { VocabularyWord, SRSLevel } from '../types';

export const MOCK_VOCABULARY: VocabularyWord[] = [
  {
    id: 'v1',
    userId: 'mock-user',
    word: 'Nuance',
    translation: 'A subtle difference in or shade of meaning, expression, or sound.',
    ipa: '/ˈnjuː.ɑːns/',
    exampleSentence: 'The pianist played with great nuance and feeling.',
    createdAt: '2026-03-10T10:00:00Z',
    nextReview: '2026-03-23T00:00:00Z',
    interval: 1,
    easeFactor: 2.5,
    srsLevel: SRSLevel.LEARNING,
    text: 'Nuance',
    meaning: 'A subtle difference in or shade of meaning, expression, or sound.',
    example: 'The pianist played with great nuance and feeling.',
    mastery: 85,
    addedAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'v2',
    userId: 'mock-user',
    word: 'Eloquence',
    translation: 'Fluent or persuasive speaking or writing.',
    ipa: '/ˈel.ə.kwəns/',
    exampleSentence: 'A speaker of great eloquence.',
    createdAt: '2026-03-12T14:30:00Z',
    nextReview: '2026-03-23T00:00:00Z',
    interval: 1,
    easeFactor: 2.5,
    srsLevel: SRSLevel.LEARNING,
    text: 'Eloquence',
    meaning: 'Fluent or persuasive speaking or writing.',
    example: 'A speaker of great eloquence.',
    mastery: 60,
    addedAt: '2026-03-12T14:30:00Z'
  },
  {
    id: 'v3',
    userId: 'mock-user',
    word: 'Pragmatic',
    translation: 'Dealing with things sensibly and realistically.',
    ipa: '/præɡˈmæt.ɪk/',
    exampleSentence: 'A pragmatic approach to politics.',
    createdAt: '2026-03-15T09:15:00Z',
    nextReview: '2026-03-24T00:00:00Z',
    interval: 1,
    easeFactor: 2.5,
    srsLevel: SRSLevel.LEARNING,
    text: 'Pragmatic',
    meaning: 'Dealing with things sensibly and realistically.',
    example: 'A pragmatic approach to politics.',
    mastery: 40,
    addedAt: '2026-03-15T09:15:00Z'
  }
];
