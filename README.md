# UtsavAI Event Buddy Chat

## Project Overview
This is an AI-powered event planning assistant that helps users find and connect with vendors for their events.

## Features
- AI-powered chat interface for event planning
- Vendor recommendations based on event type and budget
- Real-time chat with AI assistant
- Vendor marketplace
- Event request management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Project Structure
```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── lib/           # Utility functions and services
  ├── types/         # TypeScript type definitions
  └── main.tsx       # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment
The application can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For any questions or support, please contact support@utsavai.com
