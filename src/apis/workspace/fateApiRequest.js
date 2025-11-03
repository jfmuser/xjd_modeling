import axios from 'axios';
import { ElMessage } from 'element-plus';
import { CODE_SUCCESS, CODE_LOGIN } from '../../utils/const/responseCode';
import useAuthStore from '../../stores/auth.store';
import useGetConfig from "@/utils/changeParams"
import * as Base64 from 'js-base64'


const instance = axios.create({
  baseURL: '/fate-api/api',
  withCredentials: false,
  timeout: 20000,
});

instance.interceptors.request.use((config) => {
  const Times = useGetConfig.getTime()
  // token
  config.headers.authorization = localStorage.getItem('token');
  // 把路由带到请求头里
  const path = window.location.href.split('/#/')[1]
  config.headers.FromRoute = path.includes('?') ? path.split('?')[0] : path
  config.headers['ref'] = Base64.encode(window.location.href.split('/#/')[0] + '/')
  // 把时间戳第一次请求放到请求头里
  config.headers.timestamp = Times;
  const authStore = useAuthStore();
  if (authStore.userInfo != null) {
    const infoObj = { ...authStore.userInfo }
    if (infoObj.salt) {
      config.headers.sign = useGetConfig.getConfig(config, infoObj.salt)
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    const authStore = useAuthStore();
    if (response.headers.authorization) {
      localStorage.setItem('token', response.headers.authorization);
    }
    const { code, data, desc } = response.data;
    if (code === CODE_SUCCESS) {
      return data;
    }
    if (code == CODE_LOGIN) {
      // 登陆失效请重新登陆系统
      authStore.setIsLogin(false);
      ElMessage.error(desc);
      // 续约token
      authStore.setIsLogin(true);
      localStorage.setItem('token', response.headers.authorization);
      return
    }
    if (data.code == 1) {
      ElMessage.error(data.desc);
    }
    return Promise.reject(desc);
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
