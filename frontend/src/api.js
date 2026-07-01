import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const resumeApi = {
  create: (data) => api.post('/resumes', data),
  list: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const analysisApi = {
  analyze: (data) => api.post('/analyses', data),
  list: () => api.get('/analyses'),
  getById: (id) => api.get(`/analyses/${id}`),
  listByResume: (resumeId) => api.get(`/analyses/resume/${resumeId}`),
};

export const applicationApi = {
  create: (data) => api.post('/applications', data),
  list: (status) => api.get('/applications', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

export const interviewApi = {
  create: (data) => api.post('/interviews', data),
  generateMock: (data) => api.post('/interviews/mock', data),
  list: (status) => api.get('/interviews', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/interviews/${id}`),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

export default api;
