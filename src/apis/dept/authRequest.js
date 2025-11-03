import axios from 'axios';
import {
  CODE_SUCCESS,
  CODE_LOGIN,
  CODE_UPDATE_PASSWORD,
} from '../../utils/const/responseCode';
import useAuthStore from '../../stores/auth.store';
import { ElMessage } from 'element-plus';
// 签名方法
import useGetConfig from "@/utils/changeParams"
import router from '../../router/index'
import * as Base64 from 'js-base64'

const instance = axios.create({
  baseURL: '/auth',
});

instance.interceptors.request.use(
  (config) => {
    const Times = useGetConfig.getTime()
    config.headers.authorization = localStorage.getItem('token');
    // 把路由带到请求头里
    const path = window.location.href.split('/#/')[1]
    config.headers.FromRoute = path.includes('?') ? path.split('?')[0] : path
    // config.headers.FromRoute = ''
    config.headers['ref'] = Base64.encode(window.location.href.split('/#/')[0] + '/')
    // 把时间戳第一次请求放到请求头里
    config.headers.timestamp = Times;
    const authStore = useAuthStore();
    if (authStore.userInfo != null) {
      const infoObj = { ...authStore.userInfo }
      config.headers.sign = useGetConfig.getConfig(config, infoObj.salt)
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (response) {
    const { data, headers } = response;
    if (headers.authorization) {
      localStorage.setItem('token', headers.authorization);
    }
    if (data.code == CODE_LOGIN) {
      // 登录失效请重新登陆系统
      ElMessage.error(data.desc);
      // 清空token
      localStorage.removeItem('token');
      if (headers.authorization) {
        // 设置续约token
        localStorage.setItem('token', headers.authorization);
      } else {
        router.push({ path: '/' })
        throw new Error('登陆失效，请重新登陆!')
      }
      return;
    }
    if (data.code === CODE_SUCCESS) {
      return data.data;
    }
    if (data.code === CODE_UPDATE_PASSWORD) {
      return data;
    }
    if (data.code == 1 || data.code == 10109) {
      ElMessage.error(data.desc);
    }
    return Promise.reject(data.desc);
  },
  function (error) {
    console.log(error);

    console.error(error.response);
    const { data } = error.response;

    return Promise.reject(data.desc || data.message || data.error);
  },
);

export default instance;
