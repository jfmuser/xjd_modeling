import axios from 'axios';

console.log(import.meta.env.DEV);
const instance = axios.create({
  // 开发环境
  // baseURL: import.meta.env.DEV ? '/fb' : '/fateboard',
  // 本地测试
  baseURL: import.meta.env.DEV ? '/fateboard' : '/fb',
  withCredentials: false,
  timeout: 20000,
});

instance.interceptors.request.use((config) => {
  config.headers.authorization = localStorage.getItem('token');
  return config;
});

instance.interceptors.response.use(
  async (response) => {
    const { data, headers } = response;

    if (data instanceof Blob) {
      const contentDisposition = headers['content-disposition'];
      let fileName = '';
      if (contentDisposition) {
        fileName = window.decodeURI(contentDisposition.split('=')[1], 'UTF-8');
      }
      const dom = document.createElement('a');
      const url = window.URL.createObjectURL(data);
      dom.href = url;
      dom.download = decodeURI(fileName);
      dom.style.display = 'none';
      document.body.appendChild(dom);
      dom.click();
      dom.parentNode.removeChild(dom);
      window.URL.revokeObjectURL(url);
      return;
    }
    const { code } = data;
    if (code !== 0) {
      return Promise.reject(data);
    }
    return data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
