# AI Travel Planner

A comprehensive AI-powered travel planning application built with Next.js, featuring personalized itinerary generation, interactive maps, and plan sharing capabilities.

## Features

### Core Functionality
- **AI-Powered Planning**: Generate personalized travel itineraries using OpenAI's GPT models
- **Travel Modes**: Choose from three travel styles:
  - **Commando**: High-intensity itineraries with maximum attractions
  - **Balanced**: Moderate pace with mix of activities and rest
  - **Leisure**: Relaxed pace focusing on experiences and comfort

### User Experience
- **User Authentication**: Secure registration and login system
- **Plan History**: View and manage all your created travel plans
- **Interactive Maps**: Visualize routes with numbered markers and attraction details
- **PDF Export**: Download travel plans as formatted PDF documents
- **Plan Sharing**: Generate shareable links for public viewing

### Technical Features
- **Database Integration**: PostgreSQL with Prisma ORM
- **Image Integration**: Automatic attraction photos via Unsplash API
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Maps**: Interactive Leaflet maps with route visualization

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Maps**: React Leaflet
- **AI**: OpenAI GPT-3.5-turbo
- **Images**: Unsplash API
- **PDF Generation**: jsPDF, html2canvas

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Unsplash API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-travel-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_travel_db"
   NEXTAUTH_SECRET="your-secret-key-change-this"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="your-openai-api-key"
   UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
   ```

4. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── travel-plans/  # Travel plan CRUD operations
│   │   └── shared/        # Public plan viewing
│   ├── auth/              # Authentication pages
│   ├── history/           # Plan history page
│   ├── plan/              # Individual plan view
│   └── shared/            # Public shared plans
├── components/            # Reusable React components
│   └── MapDisplay.tsx     # Interactive map component
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── unsplash.ts       # Image fetching utilities
└── prisma/               # Database schema and migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET|POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Travel Plans
- `GET|POST /api/travel-plans` - List/create plans
- `GET /api/travel-plans/[id]` - Get specific plan
- `POST /api/travel-plans/[id]/share` - Generate share link

### Public Access
- `GET /api/shared/[id]` - View shared plans

## Deployment

The application is designed for deployment on Railway but can be deployed on any platform supporting Node.js and PostgreSQL.

## License

This project is licensed under the MIT License.
