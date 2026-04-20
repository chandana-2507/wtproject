import api from '../api/axios';

export const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', data, params, headers, skipToast }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        params,
        headers,
        skipToast,
      });
      return { data: result.data };
    } catch (error) {
      const errData = error.response?.data?.message || error.response?.data || error.message;
      return {
        error: {
          status: error.response?.status,
          data: errData,
        },
      };
    }
  };
