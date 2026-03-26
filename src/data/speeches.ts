import { Speech } from '../types';

export const MOCK_SPEECHES: Speech[] = [
  {
    id: 'ted-1',
    title: 'How to speak so that people want to listen',
    speaker: 'Julian Treasure',
    category: 'TED Talks',
    difficulty: 'Intermediate',
    duration: '09:58',
    thumbnail: 'https://img.youtube.com/vi/eIho2S0ZahI/maxresdefault.jpg',
    description: 'Have you ever felt like you\'re talking, but nobody is listening? Julian Treasure is here to help.',
    videoId: 'eIho2S0ZahI',
    youtubeUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    createdAt: '2024-01-01T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Best for pronunciation', 'Deep practice']
    },
    transcript: {
      status: 'available',
      segments: [
        { id: 's1', start: 0, end: 4.5, text: "I'd like to start by asking you a question.", translation: "Me gustaría empezar haciéndoles una pregunta." },
        { id: 's2', start: 4.5, end: 8.0, text: "Have you ever felt like you're talking, but nobody is listening?", translation: "¿Alguna vez has sentido que estás hablando, pero nadie te escucha?" },
        { id: 's3', start: 8.0, end: 12.5, text: "We all have that experience, and it's quite a common one.", translation: "Todos tenemos esa experiencia, y es bastante común." },
        { id: 's4', start: 12.5, end: 16.0, text: "The human voice is the instrument we all play.", translation: "La voz humana es el instrumento que todos tocamos." }
      ]
    }
  },
  {
    id: 'ted-2',
    title: 'The power of vulnerability',
    speaker: 'Brené Brown',
    category: 'TED Talks',
    difficulty: 'Advanced',
    duration: '20:19',
    thumbnail: 'https://img.youtube.com/vi/iCvmsMzlF7o/maxresdefault.jpg',
    description: 'Brené Brown studies human connection — our ability to empathize, belong, love.',
    videoId: 'iCvmsMzlF7o',
    youtubeUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    createdAt: '2024-01-02T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Emotional intelligence', 'Advanced vocabulary']
    }
  },
  {
    id: 'ted-3',
    title: 'How great leaders inspire action',
    speaker: 'Simon Sinek',
    category: 'TED Talks',
    difficulty: 'Intermediate',
    duration: '18:04',
    thumbnail: 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
    description: 'Simon Sinek has a simple but powerful model for inspirational leadership — starting with a golden circle and the question "Why?"',
    videoId: 'qp0HIF3SfI4',
    youtubeUrl: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    createdAt: '2024-01-03T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Leadership', 'Clear articulation']
    }
  },
  {
    id: 'ted-4',
    title: 'Inside the mind of a master procrastinator',
    speaker: 'Tim Urban',
    category: 'TED Talks',
    difficulty: 'Intermediate',
    duration: '14:03',
    thumbnail: 'https://img.youtube.com/vi/rv7Q7Ot9NVw/maxresdefault.jpg',
    description: 'Tim Urban knows that procrastination doesn\'t make sense, but he\'s never been able to shake his habit of waiting until the last minute to get things done.',
    videoId: 'rv7Q7Ot9NVw',
    youtubeUrl: 'https://www.youtube.com/watch?v=rv7Q7Ot9NVw',
    createdAt: '2024-01-07T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Humor', 'Best for shadowing beginners']
    },
    transcript: {
      status: 'available',
      segments: [
        { id: 's1', start: 0, end: 3.5, text: "I want to show you what's inside the mind of a master procrastinator.", translation: "Quiero mostrarles lo que hay dentro de la mente de un maestro de la procrastinación." },
        { id: 's2', start: 3.5, end: 7.0, text: "Now, I'm not a master procrastinator myself, but I know many of them.", translation: "Ahora, yo no soy un maestro de la procrastinación, pero conozco a muchos." },
        { id: 's3', start: 7.0, end: 10.5, text: "It all starts with a simple task that needs to be done.", translation: "Todo comienza con una tarea sencilla que debe hacerse." },
        { id: 's4', start: 10.5, end: 14.0, text: "But then, the Instant Gratification Monkey takes the wheel.", translation: "Pero entonces, el Mono de la Gratificación Instantánea toma el volante." }
      ]
    }
  },
  {
    id: 'ted-5',
    title: 'Your body language may shape who you are',
    speaker: 'Amy Cuddy',
    category: 'TED Talks',
    difficulty: 'Intermediate',
    duration: '21:02',
    thumbnail: 'https://img.youtube.com/vi/Ks-_Mh1QhMc/maxresdefault.jpg',
    description: 'Body language affects how others see us, but it may also change how we see ourselves.',
    videoId: 'Ks-_Mh1QhMc',
    youtubeUrl: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
    createdAt: '2024-01-08T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Confidence', 'Public speaking']
    }
  },
  {
    id: 'int-1',
    title: 'Elon Musk: The Future of AI',
    speaker: 'Lex Fridman',
    category: 'Interviews',
    difficulty: 'Advanced',
    duration: '15:45',
    thumbnail: 'https://img.youtube.com/vi/DxREm3s1scA/maxresdefault.jpg',
    description: 'A deep dive into the implications of artificial intelligence with the tech visionary.',
    videoId: 'DxREm3s1scA',
    youtubeUrl: 'https://www.youtube.com/watch?v=DxREm3s1scA',
    createdAt: '2024-01-04T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Tech', 'Deep practice']
    }
  },
  {
    id: 'int-2',
    title: 'Steve Jobs\' 2005 Stanford Commencement Address',
    speaker: 'Steve Jobs',
    category: 'Interviews',
    difficulty: 'Intermediate',
    duration: '14:32',
    thumbnail: 'https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg',
    description: 'Drawing from some of the most pivotal points in his life, Steve Jobs urges us to pursue our dreams.',
    videoId: 'UF8uR6Z6KLc',
    youtubeUrl: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    createdAt: '2024-01-05T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Inspirational', 'Best for pronunciation']
    },
    transcript: {
      status: 'available',
      segments: [
        { id: 's1', start: 0, end: 4.0, text: "I am honored to be with you today at your commencement.", translation: "Es un honor para mí estar hoy con ustedes en su graduación." },
        { id: 's2', start: 4.0, end: 8.0, text: "Truth be told, I never graduated from college.", translation: "A decir verdad, nunca me gradué de la universidad." },
        { id: 's3', start: 8.0, end: 12.0, text: "This is the closest I've ever gotten to a college graduation.", translation: "Esto es lo más cerca que he estado de una graduación universitaria." },
        { id: 's4', start: 12.0, end: 16.0, text: "Today I want to tell you three stories from my life.", translation: "Hoy quiero contarles tres historias de mi vida." }
      ]
    }
  },
  {
    id: 'int-3',
    title: 'Matthew McConaughey: The Art of Success',
    speaker: 'Matthew McConaughey',
    category: 'Interviews',
    difficulty: 'Advanced',
    duration: '12:15',
    thumbnail: 'https://img.youtube.com/vi/p0p1bjw2fOQ/maxresdefault.jpg',
    description: 'The Oscar-winning actor shares his philosophy on life, success, and the importance of "greenlights".',
    videoId: 'p0p1bjw2fOQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=p0p1bjw2fOQ',
    createdAt: '2024-01-09T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Storytelling', 'Southern accent']
    }
  },
  {
    id: 'pod-1',
    title: 'Daily English Conversation',
    speaker: 'English with Lucy',
    category: 'Podcasts',
    difficulty: 'Beginner',
    duration: '05:30',
    thumbnail: 'https://img.youtube.com/vi/pYI_X_Y2mFk/maxresdefault.jpg',
    description: 'Simple phrases and idioms for everyday use in English speaking countries.',
    videoId: 'pYI_X_Y2mFk',
    youtubeUrl: 'https://www.youtube.com/watch?v=pYI_X_Y2mFk',
    createdAt: '2024-01-06T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Everyday English', 'Short practice']
    }
  },
  {
    id: 'pod-2',
    title: 'The Diary Of A CEO: How to Master Your Mind',
    speaker: 'Steven Bartlett',
    category: 'Podcasts',
    difficulty: 'Intermediate',
    duration: '25:10',
    thumbnail: 'https://img.youtube.com/vi/v2Xp_NfP9pY/maxresdefault.jpg',
    description: 'Steven Bartlett discusses the psychological frameworks for success and mental resilience.',
    videoId: 'v2Xp_NfP9pY',
    youtubeUrl: 'https://www.youtube.com/watch?v=v2Xp_NfP9pY',
    createdAt: '2024-01-10T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Business', 'British accent']
    }
  },
  {
    id: 'pod-3',
    title: 'Huberman Lab: Focus and Productivity',
    speaker: 'Andrew Huberman',
    category: 'Podcasts',
    difficulty: 'Advanced',
    duration: '30:45',
    thumbnail: 'https://img.youtube.com/vi/h2aWYjSA1Jw/maxresdefault.jpg',
    description: 'Science-based tools for improving focus, concentration, and overall productivity.',
    videoId: 'h2aWYjSA1Jw',
    youtubeUrl: 'https://www.youtube.com/watch?v=h2aWYjSA1Jw',
    createdAt: '2024-01-11T00:00:00Z',
    readiness: 'ready',
    sourceType: 'curated',
    metadata: {
      tags: ['Science', 'Academic vocabulary']
    }
  }
];
