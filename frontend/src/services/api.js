import axios from 'axios';

const API_BASE = 'https://resume-analysis-1-ir4g.onrender.com'; // Replace with your backend API base URL

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// Attach the logged-in user's token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend says the token is missing/expired (401), the stored
// session is stale - clear it and bounce to /login instead of letting
// the app sit there silently failing every request.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const registerRequest = async (email, password, name) => {
  try {
    const response = await api.post('/api/auth/register', { email, password, name });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
  }
};

export const loginRequest = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
  }
};

export const getMeRequest = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const analyzeResume = async (formData) => {
  try {
    // Get all job descriptions from formData
    const jobDescriptions = formData.getAll('jobDescription');
    const resumeFile = formData.get('resume');

    // Process jobs one at a time to avoid sending concurrent Gemini requests.
    const results = [];
    for (const jobDesc of jobDescriptions) {
      try {
        const singleFormData = new FormData();
        singleFormData.append('resume', resumeFile);
        singleFormData.append('jobDescription', jobDesc);

        const response = await api.post('/api/analyze', singleFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        results.push({
          ...response.data,
          jobDescription: jobDesc
        });
      } catch (error) {
        results.push({
          error: true,
          message: error.response?.data?.message || 'Analysis failed for this job',
          jobDescription: jobDesc
        });
      }
    }

    return { results };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Analysis failed. Please try again.');
  }
};

export const checkATS = async (formData) => {
  try {
    const response = await api.post('/api/ats-check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('ATS Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'ATS check failed. Please try again.');
  }
};

export const getHistory = async () => {
  try {
    const response = await api.get('/api/history');
    return response.data;
  } catch (error) {
    console.error('History Error:', error.response?.data || error.message);
    throw new Error('Failed to load history');
  }
};

export const deleteHistoryItem = async (id) => {
  try {
    const response = await api.delete(`/api/history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete History Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete history item.');
  }
};