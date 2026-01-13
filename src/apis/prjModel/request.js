import axios from 'axios';
import { ElMessage } from 'element-plus';
// 不做任何处理，只做最简单的请求
const instance = axios.create({
    baseURL: '/pir-model',
     headers: {
      'content-type': 'application/json',
      
    },
});


instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        Promise.reject(error);
    },
);



instance.interceptors.response.use(
    function (response) {
        const { data } = response;
       
        return data;
    }
);

export default instance;
