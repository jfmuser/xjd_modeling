import axios from 'axios';
import { CODE_SUCCESS, CODE_LOGIN } from '../../utils/const/responseCode';
import { ElMessage } from 'element-plus';
// 签名方法
import useGetConfig from "@/utils/changeParams"
import useAuthStore from '../../stores/auth.store'

import * as Base64 from 'js-base64'
const instance = axios.create({
    baseURL: '/manager-api',
});


instance.interceptors.request.use(
    (config) => {

        const authStore = useAuthStore()
        const Times = useGetConfig.getTime()
        // 把路由带到请求头里
        const path = window.location.href.split('/#/')[1]
        config.headers['FromRoute'] = path.includes('?') ? path.split('?')[0] : path
        config.headers['ref'] = `${Base64.encode(window.location.href.split('/#/')[0] + '/')}`
        // 把时间戳第一次请求放到请求头里
        config.headers.timestamp = Times;

        if (authStore.userInfo != null) {
            const infoObj = { ...authStore.userInfo }
            config.headers.sign = useGetConfig.getConfig(config, infoObj.salt)
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
        console.log(data.code, typeof (data.code));
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
