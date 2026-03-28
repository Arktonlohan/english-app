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
      source: 'curated',
      segments: [
        { id: 'ted-1-s1', start: 0, end: 4.5, text: "I'd like to start by asking you a question.", translation: "Me gustaría empezar haciéndoles una pregunta." },
        { id: 'ted-1-s2', start: 4.5, end: 8.0, text: "Have you ever felt like you're talking, but nobody is listening?", translation: "¿Alguna vez has sentido que estás hablando, pero nadie te escucha?" },
        { id: 'ted-1-s3', start: 8.0, end: 12.5, text: "We all have that experience, and it's quite a common one.", translation: "Todos tenemos esa experiencia, y es bastante común." },
        { id: 'ted-1-s4', start: 12.5, end: 16.0, text: "The human voice is the instrument we all play.", translation: "La voz humana es el instrumento que todos tocamos." },
        { id: 'ted-1-s5', start: 16.0, end: 20.5, text: "It's the most powerful sound in the world, probably.", translation: "Es el sonido más poderoso del mundo, probablemente." },
        { id: 'ted-1-s6', start: 20.5, end: 25.0, text: "It's the only one that can start a war or say 'I love you'.", translation: "Es el único que puede iniciar una guerra o decir 'te amo'." },
        { id: 'ted-1-s7', start: 25.0, end: 30.0, text: "And yet many people have the experience that when they speak, people don't listen.", translation: "Y sin embargo, muchas personas tienen la experiencia de que cuando hablan, la gente no escucha." },
        { id: 'ted-1-s8', start: 30.0, end: 35.5, text: "Why is that? How can we speak powerfully to make change in the world?", translation: "¿Por qué es eso? ¿Cómo podemos hablar con poder para generar cambios en el mundo?" },
        { id: 'ted-1-s9', start: 35.5, end: 41.0, text: "I'd like to suggest that there are a number of habits that we need to move away from.", translation: "Me gustaría sugerir que hay una serie de hábitos de los que debemos alejarnos." },
        { id: 'ted-1-s10', start: 41.0, end: 45.5, text: "I've assembled seven deadly sins of speaking.", translation: "He reunido siete pecados capitales del habla." },
        { id: 'ted-1-s11', start: 45.5, end: 52.0, text: "I'm not pretending this is an exhaustive list, but these seven, I think, are pretty large habits.", translation: "No pretendo que sea una lista exhaustiva, pero estos siete, creo, son hábitos bastante grandes." },
        { id: 'ted-1-s12', start: 52.0, end: 57.5, text: "The first is gossip. Speaking ill of somebody who's not there.", translation: "El primero es el chisme. Hablar mal de alguien que no está presente." },
        { id: 'ted-1-s13', start: 57.5, end: 65.0, text: "Not a nice habit, and we know perfectly well the person gossiping five minutes later will be gossiping about us.", translation: "No es un buen hábito, y sabemos perfectamente que la persona que chismea cinco minutos después estará chismeando sobre nosotros." },
        { id: 'ted-1-s14', start: 65.0, end: 70.5, text: "Second, judging. We know people who are like this in conversation.", translation: "Segundo, juzgar. Conocemos a personas que son así en la conversación." },
        { id: 'ted-1-s15', start: 70.5, end: 77.0, text: "It's very hard to listen to somebody if you know that you're being judged at the same time.", translation: "Es muy difícil escuchar a alguien si sabes que te están juzgando al mismo tiempo." },
        { id: 'ted-1-s16', start: 77.0, end: 82.5, text: "Third, negativity. You can fall into this so easily.", translation: "Tercero, la negatividad. Puedes caer en esto muy fácilmente." },
        { id: 'ted-1-s17', start: 82.5, end: 89.0, text: "My mother, in the last years of her life, became very negative, and it's hard to listen.", translation: "Mi madre, en los últimos años de su vida, se volvió muy negativa y es difícil escucharla." },
        { id: 'ted-1-s18', start: 89.0, end: 97.0, text: "I remember one day, I said to her, 'It's October 1st today,' and she said, 'I know, isn't it dreadful?'", translation: "Recuerdo que un día le dije: 'Hoy es 1 de octubre', y ella dijo: 'Lo sé, ¿no es terrible?'" }
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: [
        { id: 'ted-2-s1', start: 0, end: 4.0, text: "So, I'm going to start with this.", translation: "Así que voy a empezar con esto." },
        { id: 'ted-2-s2', start: 4.0, end: 8.0, text: "A couple of years ago, I felt like I was stuck in a rut.", translation: "Hace un par de años, sentí que estaba atrapado en la rutina." },
        { id: 'ted-2-s3', start: 8.0, end: 12.0, text: "So I decided to follow in the footsteps of the great American philosopher.", translation: "Así que decidí seguir los pasos del gran filósofo estadounidense." },
        { id: 'ted-2-s4', start: 12.0, end: 16.5, text: "Morgan Spurlock, and try something new for 30 days.", translation: "Morgan Spurlock, e intentar algo nuevo durante 30 días." },
        { id: 'ted-2-s5', start: 16.5, end: 20.0, text: "The idea is actually pretty simple.", translation: "La idea es en realidad bastante simple." },
        { id: 'ted-2-s6', start: 20.0, end: 24.5, text: "Think about something you've always wanted to add to your life.", translation: "Piensa en algo que siempre hayas querido añadir a tu vida." },
        { id: 'ted-2-s7', start: 24.5, end: 28.0, text: "And try it for the next 30 days.", translation: "Y pruébalo durante los próximos 30 días." },
        { id: 'ted-2-s8', start: 28.0, end: 33.0, text: "It turns out 30 days is just about the right amount of time.", translation: "Resulta que 30 días es la cantidad de tiempo justa." },
        { id: 'ted-2-s9', start: 33.0, end: 39.0, text: "To add a new habit or subtract a habit -- like watching the news -- from your life.", translation: "Para añadir un nuevo hábito o restar uno, como ver las noticias, de tu vida." },
        { id: 'ted-2-s10', start: 39.0, end: 44.5, text: "There’s a few things I learned while doing these 30-day challenges.", translation: "Hay algunas cosas que aprendí mientras hacía estos desafíos de 30 días." },
        { id: 'ted-2-s11', start: 44.5, end: 51.0, text: "The first was, instead of the months flying by, forgotten, the time was much more memorable.", translation: "Lo primero fue que, en lugar de que los meses pasaran volando y se olvidaran, el tiempo fue mucho más memorable." },
        { id: 'ted-2-s12', start: 51.0, end: 57.5, text: "This was part of a challenge I did to take a picture every day for a month.", translation: "Esto fue parte de un desafío que hice de tomar una foto todos los días durante un mes." },
        { id: 'ted-2-s13', start: 57.5, end: 63.0, text: "And I remember exactly where I was and what I was doing that day.", translation: "Y recuerdo exactamente dónde estaba y qué estaba haciendo ese día." },
        { id: 'ted-2-s14', start: 63.0, end: 71.0, text: "I also noticed that as I started to do more and harder 30-day challenges, my self-confidence grew.", translation: "También noté que a medida que empezaba a hacer desafíos de 30 días más y más difíciles, mi confianza en mí mismo creció." },
        { id: 'ted-2-s15', start: 71.0, end: 79.0, text: "I went from desk-dwelling computer nerd to the kind of guy who bikes to work -- for fun!", translation: "Pasé de ser un nerd de computadora que vive en un escritorio al tipo de persona que va en bicicleta al trabajo, ¡por diversión!" }
      ]
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: [
        { id: 'ted-3-s1', start: 0, end: 3.5, text: "How do you explain when things don't go as we're told?", translation: "¿Cómo explicas cuando las cosas no salen como nos dicen?" },
        { id: 'ted-3-s2', start: 3.5, end: 7.0, text: "Or better, how do you explain when others are able to achieve things?", translation: "O mejor, ¿cómo explicas cuando otros son capaces de lograr cosas?" },
        { id: 'ted-3-s3', start: 7.0, end: 11.0, text: "That seem to defy all of the assumptions?", translation: "¿Que parecen desafiar todas las suposiciones?" },
        { id: 'ted-3-s4', start: 11.0, end: 15.5, text: "For example, why is Apple so innovative?", translation: "Por ejemplo, ¿por qué Apple es tan innovadora?" },
        { id: 'ted-3-s5', start: 15.5, end: 22.0, text: "Year after year, after year, after year, they're more innovative than all their competition.", translation: "Año tras año, tras año, tras año, son más innovadores que toda su competencia." },
        { id: 'ted-3-s6', start: 22.0, end: 26.5, text: "And yet, they're just a computer company.", translation: "Y sin embargo, son solo una empresa de informática." },
        { id: 'ted-3-s7', start: 26.5, end: 32.0, text: "They're just like everyone else. They have the same access to the same talent.", translation: "Son como todos los demás. Tienen el mismo acceso al mismo talento." },
        { id: 'ted-3-s8', start: 32.0, end: 37.5, text: "The same agencies, the same consultants, the same media.", translation: "Las mismas agencias, los mismos consultores, los mismos medios." },
        { id: 'ted-3-s9', start: 37.5, end: 42.0, text: "Then why is it that they seem to have something different?", translation: "Entonces, ¿por qué parece que tienen algo diferente?" },
        { id: 'ted-3-s10', start: 42.0, end: 47.5, text: "Why is it that Martin Luther King led the Civil Rights Movement?", translation: "¿Por qué Martin Luther King lideró el Movimiento por los Derechos Civiles?" },
        { id: 'ted-3-s11', start: 47.5, end: 53.0, text: "He wasn't the only man who suffered in pre-civil rights America.", translation: "No fue el único hombre que sufrió en la América anterior a los derechos civiles." },
        { id: 'ted-3-s12', start: 53.0, end: 58.5, text: "And he certainly wasn't the only great orator of the day.", translation: "Y ciertamente no fue el único gran orador de la época." },
        { id: 'ted-3-s13', start: 58.5, end: 67.0, text: "Why him? And why is it that the Wright brothers were able to figure out controlled, powered man-flight?", translation: "¿Por qué él? ¿Y por qué los hermanos Wright pudieron descifrar el vuelo humano controlado y motorizado?" },
        { id: 'ted-3-s14', start: 67.0, end: 74.0, text: "When there were certainly other teams who were better qualified, better funded.", translation: "Cuando ciertamente había otros equipos mejor calificados, mejor financiados." },
        { id: 'ted-3-s15', start: 74.0, end: 81.0, text: "And they didn't achieve powered man-flight, and the Wright brothers beat them to it.", translation: "Y ellos no lograron el vuelo humano motorizado, y los hermanos Wright les ganaron." },
        { id: 'ted-3-s16', start: 81.0, end: 85.0, text: "There's something else at play here.", translation: "Hay algo más en juego aquí." }
      ]
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
      source: 'curated',
      segments: [
        { id: 'ted-4-s1', start: 0, end: 3.5, text: "I want to show you what's inside the mind of a master procrastinator.", translation: "Quiero mostrarles lo que hay dentro de la mente de un maestro de la procrastinación." },
        { id: 'ted-4-s2', start: 3.5, end: 7.0, text: "Now, I'm not a master procrastinator myself, but I know many of them.", translation: "Ahora, yo no soy un maestro de la procrastinación, pero conozco a muchos." },
        { id: 'ted-4-s3', start: 7.0, end: 10.5, text: "It all starts with a simple task that needs to be done.", translation: "Todo comienza con una tarea sencilla que debe hacerse." },
        { id: 'ted-4-s4', start: 10.5, end: 14.0, text: "But then, the Instant Gratification Monkey takes the wheel.", translation: "Pero entonces, el Mono de la Gratificación Instantánea toma el volante." },
        { id: 'ted-4-s5', start: 14.0, end: 20.0, text: "He says, 'Actually, let's go on YouTube and watch videos of people being interviewed.'", translation: "Él dice: 'En realidad, vayamos a YouTube y veamos videos de personas siendo entrevistadas'." },
        { id: 'ted-4-s6', start: 20.0, end: 26.5, text: "And then we'll go on a Wikipedia spiral about the history of the refrigerator.", translation: "Y luego iremos a una espiral de Wikipedia sobre la historia del refrigerador." },
        { id: 'ted-4-s7', start: 26.5, end: 31.0, text: "And then we'll check our email for the 14th time today.", translation: "Y luego revisaremos nuestro correo electrónico por decimocuarta vez hoy." },
        { id: 'ted-4-s8', start: 31.0, end: 36.0, text: "The Rational Decision-Maker is trying to stay on track.", translation: "El Tomador de Decisiones Racional está tratando de mantenerse en el camino." },
        { id: 'ted-4-s9', start: 36.0, end: 42.5, text: "But the Monkey doesn't care about the future. He only cares about the present.", translation: "Pero al Mono no le importa el futuro. Solo le importa el presente." },
        { id: 'ted-4-s10', start: 42.5, end: 46.0, text: "He wants things that are easy and fun.", translation: "Él quiere cosas que sean fáciles y divertidas." },
        { id: 'ted-4-s11', start: 46.0, end: 52.0, text: "This is the conflict that every procrastinator faces every single day.", translation: "Este es el conflicto que cada procrastinador enfrenta cada día." },
        { id: 'ted-4-s12', start: 52.0, end: 58.0, text: "And it's why we find ourselves doing things that don't make sense.", translation: "Y es por eso que nos encontramos haciendo cosas que no tienen sentido." },
        { id: 'ted-4-s13', start: 58.0, end: 62.0, text: "Until the Panic Monster wakes up.", translation: "Hasta que el Monstruo del Pánico se despierta." },
        { id: 'ted-4-s14', start: 62.0, end: 70.0, text: "The Panic Monster is dormant most of the time, but he wakes up when a deadline gets too close.", translation: "El Monstruo del Pánico está inactivo la mayor parte del tiempo, pero se despierta cuando una fecha límite se acerca demasiado." },
        { id: 'ted-4-s15', start: 70.0, end: 75.0, text: "Or when there's a danger of public embarrassment.", translation: "O cuando hay peligro de vergüenza pública." },
        { id: 'ted-4-s16', start: 75.0, end: 80.0, text: "Suddenly, the Monkey is terrified and runs away.", translation: "De repente, el Mono está aterrorizado y huye." }
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: []
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: []
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
      source: 'curated',
      segments: [
        { id: 'int-2-s1', start: 0, end: 4.0, text: "I am honored to be with you today at your commencement.", translation: "Es un honor para mí estar hoy con ustedes en su graduación." },
        { id: 'int-2-s2', start: 4.0, end: 8.0, text: "Truth be told, I never graduated from college.", translation: "A decir verdad, nunca me gradué de la universidad." },
        { id: 'int-2-s3', start: 8.0, end: 12.0, text: "This is the closest I've ever gotten to a college graduation.", translation: "Esto es lo más cerca que he estado de una graduación universitaria." },
        { id: 'int-2-s4', start: 12.0, end: 16.0, text: "Today I want to tell you three stories from my life.", translation: "Hoy quiero contarles tres historias de mi vida." },
        { id: 'int-2-s5', start: 16.0, end: 20.0, text: "That's it. No big deal. Just three stories.", translation: "Eso es todo. No es gran cosa. Solo tres historias." },
        { id: 'int-2-s6', start: 20.0, end: 24.5, text: "The first story is about connecting the dots.", translation: "La primera historia trata sobre conectar los puntos." },
        { id: 'int-2-s7', start: 24.5, end: 29.0, text: "I dropped out of Reed College after the first 6 months.", translation: "Dejé la universidad de Reed después de los primeros 6 meses." },
        { id: 'int-2-s8', start: 29.0, end: 37.0, text: "But then stayed around as a drop-in for another 18 months or so before I really quit.", translation: "Pero luego me quedé como oyente por otros 18 meses más o menos antes de dejarlo de verdad." },
        { id: 'int-2-s9', start: 37.0, end: 40.0, text: "So why did I drop out?", translation: "Entonces, ¿por qué dejé la universidad?" },
        { id: 'int-2-s10', start: 40.0, end: 43.5, text: "It started before I was born.", translation: "Empezó antes de que yo naciera." },
        { id: 'int-2-s11', start: 43.5, end: 49.0, text: "My biological mother was a young, unwed college graduate student.", translation: "Mi madre biológica era una joven estudiante de posgrado soltera." },
        { id: 'int-2-s12', start: 49.0, end: 53.0, text: "And she decided to put me up for adoption.", translation: "Y decidió darme en adopción." },
        { id: 'int-2-s13', start: 53.0, end: 59.0, text: "She felt very strongly that I should be adopted by college graduates.", translation: "Ella sentía muy firmemente que yo debía ser adoptado por graduados universitarios." },
        { id: 'int-2-s14', start: 59.0, end: 67.0, text: "So everything was all set for me to be adopted at birth by a lawyer and his wife.", translation: "Así que todo estaba listo para que fuera adoptado al nacer por un abogado y su esposa." },
        { id: 'int-2-s15', start: 67.0, end: 75.0, text: "Except that when I popped out they decided at the last minute that they really wanted a girl.", translation: "Excepto que cuando salí decidieron en el último minuto que realmente querían una niña." }
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: []
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: []
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: []
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
    },
    transcript: {
      status: 'available',
      source: 'curated',
      segments: []
    }
  }
];
