import axios from 'axios';
// 不做任何处理，只做最简单的请求
const instance = axios.create({
  baseURL: '/algorithm',
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    'x-ajax': 'json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const search = window.location.search;
    if (search) {
      const arr = search.split('&');
      arr.forEach((item) => {
        const kv = item.split('=');
        if (kv[0] === 'dpToken') {
          // 内嵌时使用，dpToken需要由父级传入
          config.headers['x-token'] = kv[1];
        }
      });
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

instance.interceptors.response.use(function (response) {
  const { data } = response;
  return data;
});

export default instance;
