import axios from 'axios';

// Create your single, centralized Axios client
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add auth token (if present) to all requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken'); // use the same token name as your login & ProtectedRoute
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Helper to POST interaction history (used in any Section)
export async function saveHistory(feature, input_data, ai_response) {
  try {
    await apiClient.post('/api/history/', {
      feature,
      input_data,
      ai_response,
    });
  } catch (error) {
    console.error("Failed to save interaction history:", error);
  }
}

// Export the customized Axios client for all network use
export default apiClient;
