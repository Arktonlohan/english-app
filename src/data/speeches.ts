import { Speech } from '../types';

export const MOCK_SPEECHES: Speech[] = [
  {
    id: '1',
    title: 'How to speak so that people want to listen',
    speaker: 'Julian Treasure',
    category: 'TED',
    difficulty: 'Intermediate',
    duration: '09:58',
    thumbnail: 'https://picsum.photos/seed/speech1/400/225',
    description: 'Have you ever felt like you\'re talking, but nobody is listening? Julian Treasure is here to help.',
    createdAt: '2024-01-01T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    transcript: {
      speechId: '1',
      state: 'available',
      source: 'curated',
      sentences: [
        {
          id: 's1',
          startTime: 0,
          endTime: 5,
          text: "The human voice is the instrument we all play.",
          words: [
            { text: 'The', startTime: 0, endTime: 0.5, ipa: '/ðə/', meaning: 'Used to point to a specific thing.', example: 'The cat is on the mat.' },
            { text: 'human', startTime: 0.5, endTime: 1.2, ipa: '/ˈhjuː.mən/', meaning: 'Relating to people.', example: 'Human nature is complex.' },
            { text: 'voice', startTime: 1.2, endTime: 1.8, ipa: '/vɔɪs/', meaning: 'Sound produced in a person\'s larynx.', example: 'She has a beautiful voice.' },
            { text: 'is', startTime: 1.8, endTime: 2.1, ipa: '/ɪz/', meaning: 'Third person singular present of be.', example: 'He is happy.' },
            { text: 'the', startTime: 2.1, endTime: 2.4, ipa: '/ðə/', meaning: 'Used to point to a specific thing.', example: 'The sun is hot.' },
            { text: 'instrument', startTime: 2.4, endTime: 3.2, ipa: '/ˈɪn.strə.mənt/', meaning: 'A tool or implement.', example: 'A piano is a musical instrument.' },
            { text: 'we', startTime: 3.2, endTime: 3.5, ipa: '/wiː/', meaning: 'Used by a speaker to refer to himself or herself and one or more other people.', example: 'We are going home.' },
            { text: 'all', startTime: 3.5, endTime: 3.8, ipa: '/ɔːl/', meaning: 'Used to refer to the whole quantity or amount of something.', example: 'All the people left.' },
            { text: 'play.', startTime: 3.8, endTime: 4.5, ipa: '/pleɪ/', meaning: 'Engage in activity for enjoyment and recreation.', example: 'Children like to play.' }
          ]
        },
        {
          id: 's2',
          startTime: 5,
          endTime: 10,
          text: "It's the most powerful sound in the world, probably.",
          words: [
            { text: 'It\'s', startTime: 5, endTime: 5.5, ipa: '/ɪts/', meaning: 'Contraction of it is or it has.', example: 'It\'s raining.' },
            { text: 'the', startTime: 5.5, endTime: 5.8, ipa: '/ðə/', meaning: 'Used to point to a specific thing.', example: 'The book is on the table.' },
            { text: 'most', startTime: 5.8, endTime: 6.3, ipa: '/məʊst/', meaning: 'Greatest in amount or degree.', example: 'Most people like chocolate.' },
            { text: 'powerful', startTime: 6.3, endTime: 7.2, ipa: '/ˈpaʊə.fəl/', meaning: 'Having great power or strength.', example: 'A powerful engine.' },
            { text: 'sound', startTime: 7.2, endTime: 7.8, ipa: '/saʊnd/', meaning: 'Vibrations that travel through the air.', example: 'The sound of music.' },
            { text: 'in', startTime: 7.8, endTime: 8.1, ipa: '/ɪn/', meaning: 'Expressing the situation of something that is or appears to be enclosed or surrounded by something else.', example: 'In the box.' },
            { text: 'the', startTime: 8.1, endTime: 8.4, ipa: '/ðə/', meaning: 'Used to point to a specific thing.', example: 'The sky is blue.' },
            { text: 'world,', startTime: 8.4, endTime: 9.2, ipa: '/wɜːld/', meaning: 'The earth, together with all of its countries and peoples.', example: 'The whole world.' },
            { text: 'probably.', startTime: 9.2, endTime: 10, ipa: '/ˈprɒb.ə.bli/', meaning: 'Almost certainly; as far as one can tell.', example: 'I will probably go.' }
          ]
        }
      ]
    }
  },
  {
    id: '2',
    title: 'The power of vulnerability',
    speaker: 'Brené Brown',
    category: 'TED',
    difficulty: 'Advanced',
    duration: '20:19',
    thumbnail: 'https://picsum.photos/seed/speech2/400/225',
    description: 'Brené Brown studies human connection — our ability to empathize, belong, love.',
    createdAt: '2024-01-02T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated'
  },
  {
    id: '3',
    title: 'Elon Musk on the Future of AI',
    speaker: 'Elon Musk',
    category: 'Interviews',
    difficulty: 'Advanced',
    duration: '15:45',
    thumbnail: 'https://picsum.photos/seed/speech3/400/225',
    description: 'A deep dive into the implications of artificial intelligence with the tech visionary.',
    createdAt: '2024-01-03T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated'
  },
  {
    id: '4',
    title: 'Daily English Conversation',
    speaker: 'English with Lucy',
    category: 'Podcasts',
    difficulty: 'Beginner',
    duration: '05:30',
    thumbnail: 'https://picsum.photos/seed/speech4/400/225',
    description: 'Simple phrases and idioms for everyday use in English speaking countries.',
    createdAt: '2024-01-04T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated'
  },
  {
    id: '5',
    title: 'Steve Jobs\' 2005 Stanford Commencement Address',
    speaker: 'Steve Jobs',
    category: 'Business',
    difficulty: 'Intermediate',
    duration: '14:32',
    thumbnail: 'https://picsum.photos/seed/speech5/400/225',
    description: 'Drawing from some of the most pivotal points in his life, Steve Jobs urges us to pursue our dreams.',
    createdAt: '2024-01-05T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated'
  },
  {
    id: '6',
    title: 'The Art of Storytelling',
    speaker: 'Neil Gaiman',
    category: 'Movies',
    difficulty: 'Intermediate',
    duration: '12:10',
    thumbnail: 'https://picsum.photos/seed/speech6/400/225',
    description: 'Master storyteller Neil Gaiman shares his insights on how to craft compelling narratives.',
    createdAt: '2024-01-06T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated'
  }
];
