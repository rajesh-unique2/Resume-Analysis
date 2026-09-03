import axios from 'axios';

const API_BASE = 'http://localhost:5000'; // Replace with your backend API base URL

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

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
    
    console.log('All results:', results);
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
    console.log('ATS Response:', response.data);
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