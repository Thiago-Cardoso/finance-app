# Finance App Frontend

This is the frontend application for the Personal Finance Management system built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Copy the environment variables:

```bash
cp .env.example .env.local
```

3. Update the environment variables in `.env.local` with your configuration.

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── layout/        # Layout components
│   ├── forms/         # Form components
│   └── charts/        # Chart components
├── contexts/          # React contexts
├── hooks/            # Custom hooks
├── lib/              # Utility functions
├── styles/           # Additional styles
└── types/            # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Form Validation**: Zod
- **Icons**: Lucide React
- **Linting**: ESLint
- **Formatting**: Prettier

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🔧 Configuration

### Environment Variables

See `.env.example` for required environment variables.

### API Integration

The app connects to the Rails API backend. Make sure the backend is running on the configured API URL.

## 📝 Development Guidelines

- Follow the established component structure
- Use TypeScript for type safety
- Follow the naming conventions
- Write meaningful commit messages
- Test your changes before submitting

## 🤝 Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0.
