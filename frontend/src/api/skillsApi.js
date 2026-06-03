import api from './axiosInstance';

export async function getMySkills() {
  const { data } = await api.get('/skills/me');
  return data;
}
