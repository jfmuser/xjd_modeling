import axios from 'axios';
import { CODE_SUCCESS, CODE_LOGIN } from '../../utils/const/responseCode';
import { ElMessage } from 'element-plus';
// 不做任何处理，只做最简单的请求
const instance = axios.create({
    baseURL: '/innovate-api',
    headers: {
      // 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      // 'x-requested-with': 'XMLHttpRequest',
      // 'x-ajax': 'json',
    },
});


instance.interceptors.request.use(
    (config) => {
      console.log({config})
      config.headers['pzToken'] = 'pzToken'
      return config;
    },
    (error) => {
        Promise.reject(error);
    },
);

instance.interceptors.response.use(
    function (response) {
        const { data, headers } = response;
        // console.log(data.code, typeof (data.code));
        return data;
        // if (data.code == CODE_SUCCESS) {
        //     return data.data;
        // }
        // if (data.code === Number(CODE_LOGIN)) {
        //     ElMessage.error(data.desc || data.msg);
        //     // 清空token
        //     localStorage.removeItem('token');
        //     // 设置最新续约token
        //     localStorage.setItem('token', headers.authorization);
        //     return;
        // }
        // if (data.code == 1) {
        //     ElMessage.error(data.desc);
        // }
        // return Promise.reject(data.desc || data.msg);
    },
    function (error) {
       
       return Promise.reject(error);
    },
   
);



export default instance;
