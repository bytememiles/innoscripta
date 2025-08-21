# News Aggregator Frontend | Innoscripta

A modern React TypeScript frontend built with Material-UI for the Innoscripta News Aggregator application.

## Features

- **React 19** with TypeScript
- **Material-UI (MUI)** for components and theming
- **Dark/Light theme support** with system preference detection
- **Redux Toolkit** for state management with RTK Query
- **React Router** for client-side routing
- **React Hook Form** with Yup validation
- **Responsive design** optimized for mobile and desktop
- **Authentication system** with protected routes
- **Real-time news feed** with infinite scrolling
- **Advanced search and filtering**
- **User preferences management**
- **Dynamic page titles** with SEO optimization

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form + Yup
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Styling**: Emotion (CSS-in-JS)

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

## Docker Setup

### Production Build

Build and run the production-optimized container:

```bash
# Build the production image
docker-compose build frontend

# Run the production container
docker-compose up frontend

# Or run in detached mode
docker-compose up -d frontend
```

The frontend will be available at `http://localhost:3000`

### Development Mode

Run the development server with hot reloading:

```bash
# Run the development container
docker-compose --profile dev up frontend-dev

# Or run in detached mode
docker-compose --profile dev up -d frontend-dev
```

The development server will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=News Aggregator
```

## Local Development (without Docker)

If you prefer to run locally without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   ├── news/         # News-related components
│   │   └── ui/           # Generic UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── store/            # Redux store and slices
│   │   ├── api/          # RTK Query API definitions
│   │   └── slices/       # Redux slices
│   ├── styles/           # Global styles
│   ├── theme/            # MUI theme configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Application entry point
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── docker-compose.yml    # Docker Compose configuration
├── nginx.conf            # Nginx configuration for production
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Theme System

The application supports both light and dark themes:

- **System Preference**: Automatically detects user's system theme
- **Manual Toggle**: Users can manually switch between themes
- **Persistence**: Theme preference is saved to localStorage

## Authentication

The frontend includes a complete authentication system:

- **Login/Register**: Form-based authentication
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Token Management**: Automatic token refresh and logout
- **Password Reset**: Forgot password functionality

## API Integration

- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Authentication**: Automatic token injection in requests
- **Error Handling**: Global error handling with user notifications
- **Caching**: Intelligent caching with RTK Query

## Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Responsive grid layouts and collapsible navigation
- **Mobile**: Touch-optimized interface with drawer navigation

## Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Analysis**: Build-time bundle size warnings
- **Caching**: Service worker ready (can be enabled)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Troubleshooting

### Common Issues

**Build fails with Node.js version error:**

- Ensure you're using Node.js 20+ or use Docker

**CORS errors:**

- Check that `VITE_API_URL` points to the correct backend URL
- Ensure the backend allows the frontend's origin

**Hot reloading not working in Docker:**

- Use the development Docker setup with `--profile dev`
- Ensure port 5173 is properly mapped

### Docker Issues

**Container won't start:**

```bash
# Check logs
docker-compose logs frontend

# Rebuild without cache
docker-compose build --no-cache frontend
```

**Port conflicts:**

```bash
# Change ports in docker-compose.yml
ports:
  - "3001:80"  # Instead of 3000:80
```

## License

This project is part of the Innoscripta News Aggregator application.
