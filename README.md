# Falai | Speak Like a Native

Falai is an AI-powered language fluency coach designed to help you master pronunciation, expand your vocabulary, and build confidence through immersive practice.

## Features

- **Shadowing Practice**: Practice speaking along with native-like speech patterns.
- **Pronunciation Drills**: Get real-time feedback on your accent and phoneme accuracy.
- **Vocabulary Mastery**: Build your personal dictionary and practice with spaced-repetition flashcards.
- **Progress Tracking**: Monitor your learning journey with detailed statistics and insights.
- **AI-Powered Insights**: Personalized recommendations based on your performance.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Backend (Optional)**: Supabase (Auth & Database)
- **Persistence**: Local Storage fallback for offline-first experience

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd falai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials if you want cloud sync.
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Supabase Setup (Optional)

To enable cloud persistence and multi-device sync:

1. Create a new project at [Supabase](https://supabase.com).
2. Get your `URL` and `Anon Key` from the API settings.
3. Add them to your `.env` file.
4. The app will automatically detect these and switch from local storage to Supabase.

## License

MIT
