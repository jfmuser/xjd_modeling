import axios from 'axios';
const instance = axios.create({
    baseURL: '/secretflow-api/proxy/secretPad/api',
    timeout: 5000,
    // headers: {
    //     "Content-Type": "application/x-www-form-urlencoded;charset-utf-8"
    // }
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
        console.log(response, 'RESPONSESE');

        if (data.code ?? data.status.code !== 0) {
            return Promise.reject(data.status.msg);
        }
        return data.data;
    },
    function (error) {
        console.error(error.response);
        const { data } = error.response;

        return Promise.reject(data.desc || data.message || data.error || data.msg);
    },
);

export default instance;
