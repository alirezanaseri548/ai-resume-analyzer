import api from './axiosInstance';

export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary');
  return data;
}
