import axios from 'axios';
import { CLOUD_MANAGER_USER_FIRST_LOGIN_UPDATE_PASSWORD } from '../../utils/const/responseCode';

const instance = axios.create({
  baseURL: '/cloud-manager/api',
  withCredentials: false,
  timeout: 20000,
});

instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    const { code } = data;
    if (code === CLOUD_MANAGER_USER_FIRST_LOGIN_UPDATE_PASSWORD) {
      localStorage.setItem('resetPasswordRequired', 'on');
      return data.data;
    }
    if (code === 0) {
      return data.data;
    }
    if (code === 153 || code === 130) {
      if (!localStorage.getItem('Please login first!')) {
        localStorage.setItem('Please login first!', 'Please login first!')
      }
      // else {
      //   localStorage.removeItem('Please login first!')
      // }
    }
    console.error(data);
    return Promise.reject(data.msg);
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  },
);

export default instance;
