# Classic Caps

A web-based football lineup guessing game where users test their knowledge of historical football matches by identifying the starting XI players from a specific fixture.

## Features

- Select from major football leagues worldwide
- Browse historical seasons and teams
- Choose specific fixtures to play
- Guess the starting XI in a 4-4-2 formation
- Visual letter hints to help with guessing
- Game state persistence using local storage

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: API-Football (api-football.com)
- **Storage**: Browser localStorage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your API key:
   - Get a free API key from [API-Football](https://www.api-football.com/)
   - Copy `.env.local.example` to `.env.local`
   - Add your API key to `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
classic-caps/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Services and utilities
├── types/            # TypeScript type definitions
└── .kiro/specs/      # Project specifications
```

## Environment Variables

- `NEXT_PUBLIC_FOOTBALL_API_KEY`: Your API-Football API key
- `NEXT_PUBLIC_FOOTBALL_API_URL`: API-Football base URL
- `NEXT_PUBLIC_CACHE_TTL_DAYS`: Cache duration in days (default: 30)

## License

Private project
