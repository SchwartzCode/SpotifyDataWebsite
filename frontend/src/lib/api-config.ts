// API configuration that works both in development and production environments

// When running locally with separate servers:
// - Backend on http://localhost:5000
// - Frontend on http://localhost:3000
// 
// When running in production Docker container:
// - Both frontend and backend served from the same origin

function getApiBaseUrl(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return '/api';
    }
    
    // In development, Next.js runs on port 3000 while Flask runs on port 5000
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5000/api';
    }
    
    // In production, the Flask server also serves the frontend,
    // so we can use a relative URL
    return '/api';
  }
  
  export const API_BASE_URL = getApiBaseUrl();