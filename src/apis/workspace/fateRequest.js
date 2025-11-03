import axios from 'axios';

const instance = axios.create({
  baseURL: '/fate/v1',
  withCredentials: false,
  timeout: 20000,
});

instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    const { retcode } = data;
    if (retcode === 100) {
      return Promise.reject(data);
    }
    return data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
