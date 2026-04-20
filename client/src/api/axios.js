import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (original.url?.includes('/api/auth/refresh')) {
      return Promise.reject(error);
    }

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        await api.post('/api/auth/refresh', {}, { skipToast: true });
        return api(original);
      } catch {
        toast.error('Session expired. Please sign in again.');
        return Promise.reject(error);
      }
    }

    const msg =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong';

    if (!original.skipToast && status !== 401) {
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }

    return Promise.reject(error);
  }
);

export default api;
