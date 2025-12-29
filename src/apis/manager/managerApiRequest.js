import axios from 'axios';
import { CODE_SUCCESS, CODE_LOGIN } from '../../utils/const/responseCode';
import { ElMessage } from 'element-plus';
// 签名方法
import useGetConfig from '@/utils/changeParams';
import useAuthStore from '../../stores/auth.store';

import * as Base64 from 'js-base64';
const instance = axios.create({
  baseURL: '/manager-api/api',
});

instance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const Times = useGetConfig.getTime();
    // 把路由带到请求头里
    const path = window.location.href.split('/#/')[1];
    config.headers['FromRoute'] = path.includes('?')
      ? path.split('?')[0]
      : path;
    config.headers['ref'] = `${Base64.encode(
      window.location.href.split('/#/')[0] + '/',
    )}`;
    // 直接放行
    config.headers['pzToken'] = 'pzToken';
    // 把时间戳第一次请求放到请求头里
    config.headers.timestamp = Times;

    let dpToken = null;

    const hashIndex = window.location.href.indexOf('#/');
    let searchParams = '';

    // 获取哈希部分
    const hashPart = window.location.href.substring(hashIndex + 2); // 跳过 '#/'
    // 检查哈希部分是否有参数
    const questionIndex = hashPart.indexOf('?');
    if (questionIndex !== -1) {
      searchParams = '?' + hashPart.substring(questionIndex + 1);
    }

    // 从 URL 参数获取 dpToken
    const urlParams = new URLSearchParams(searchParams);
    const urlDpToken = urlParams.get('dpToken');

    if (urlDpToken) {
      // URL 中有 dpToken，存到 sessionStorage
      sessionStorage.setItem('dpToken', urlDpToken);
      dpToken = urlDpToken;
    } else {
      // URL 中没有，从 sessionStorage 获取
      dpToken = sessionStorage.getItem('dpToken');

      if (!dpToken) {
        // sessionStorage 中也没有，生成 mock token
        dpToken = '';
        const chars = '0123456789abcdef';
        for (let i = 0; i < 32; i++) {
          dpToken += chars.charAt(Math.floor(Math.random() * 16));
        }
        sessionStorage.setItem('dpToken', dpToken);
      }
    }

    // 将 dpToken 添加到请求头，字段名为 pzToken
    config.headers.pzToken = dpToken;

    if (authStore.userInfo != null) {
      const infoObj = { ...authStore.userInfo };
      config.headers.sign = useGetConfig.getConfig(config, infoObj.salt);
    }
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
    console.log(data.code, typeof data.code);
    if (data.code == CODE_SUCCESS) {
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
    console.log(error);

    console.error(error.response);
    const { data } = error.response;

    return Promise.reject(data.desc || data.message || data.error || data.msg);
  },
);

export default instance;
