import axios from 'axios';
import { CODE_SUCCESS, CODE_LOGIN } from '../../utils/const/responseCode';
import { ElMessage } from 'element-plus';
const instance = axios.create({
  baseURL: '/fate-manager/api',
});

instance.interceptors.request.use(
  (config) => {
    config.headers.authorization = localStorage.getItem('token');
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (response) {
    const { data, headers } = response;
    console.log(data.code, typeof (data.code));
    if (data.code === Number(CODE_SUCCESS)) {
      return data.data;
    }
    if (data.code == Number(CODE_LOGIN)) {
      ElMessage.error(data.desc || data.msg);
      // 清空token
      localStorage.removeItem('token');
      // 设置最新续约token
      localStorage.setItem('token', headers.authorization);
      return;
    }
    if (data.code == 1) {
      ElMessage.error(data.desc);
    }
    return Promise.reject(data.desc || data.msg);
  },
  function (error) {
    console.error(error.response);
    const { data } = error.response;

    return Promise.reject(data.desc || data.message || data.error || data.msg);
  },
);

export default instance;
