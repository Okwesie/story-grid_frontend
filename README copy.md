# StoryGrid

## Description
StoryGrid is a modern social media platform designed for sharing stories and connecting with friends.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js & npm**
   ```bash
   # Check if Node.js is installed
   node --version

   # If not installed, download and install from
   # https://nodejs.org/en/ (LTS version recommended)
   ```

2. **Git**
   ```bash
   # Check if Git is installed
   git --version

   # If not installed on macOS, install with:
   brew install git
   ```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/StoryGrid.git
   cd StoryGrid
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # OR using pnpm (if preferred)
   # First install pnpm globally
   npm install -g pnpm
   # Then install dependencies
   pnpm install
   ```

## Running the Application

1. **Development mode**
   ```bash
   # Using npm
   npm run dev

   # OR using pnpm
   pnpm dev
   ```
   The application will be available at `http://localhost:3000`

2. **Build for production**
   ```bash
   # Using npm
   npm run build
   npm start

   # OR using pnpm
   pnpm build
   pnpm start
   ```

## Project Structure

```
StoryGrid/
├── app/                   # Next.js app directory
├── components/           # React components
├── public/              # Static files (images)
└── styles/             # Global styles and Tailwind CSS
```

## Features
- Modern, responsive design
- Real-time social interactions
- Story sharing capabilities
- User authentication
- Interactive onboarding carousel

## Technology Stack
- Next.js 14
- React
- Tailwind CSS
- TypeScript
- Node.js
