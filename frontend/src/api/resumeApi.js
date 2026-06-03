import api from './axiosInstance';

export async function uploadResume(formData, config = {}) {
  const { data } = await api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });

  return data;
}

export async function analyzeResume(id) {
  const { data } = await api.post(`/resumes/${id}/analyze`);
  return data;
}

export async function getResumeAnalysis(id) {
  return analyzeResume(id);
}
