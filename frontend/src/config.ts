// Configuration for the application
export const config = {
  // Determine API URL based on environment
  getApiUrl: (): string => {
    // For browser-based access (both Docker and local development)
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8000';
    }
    
    // For production or other environments
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  },
  
  // Other configuration options
  pollingInterval: 30000, // 30 seconds
  defaultUserId: 'user123',
};
