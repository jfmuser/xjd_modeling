import axios from 'axios';
// 不做任何处理，只做最简单的请求
const instance = axios.create({
    baseURL: '/js/a',
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      'x-ajax': 'json',
    },
});


instance.interceptors.request.use(
    (config) => {
        const search = window.location.search;
        console.log("window url is: "+search)
        if(search){
          const arr = search.split('&');
          arr.forEach((item)=>{
            const kv = item.split('=');
            if(kv[0] === 'dpToken'){
              // 内嵌时使用，dpToken需要由父级传入
              config.headers['x-token'] = kv[1];
            }
          })
        }
        // const hash = window.location.hash;
        // console.log("window hash is: "+hash)
        // if (hash.includes('?')) {
        //     const searchParams = hash.split('?')[2];
        //     const params = new URLSearchParams(searchParams);
        //     console.log("params is: "+params)
        //     const dpToken = params.get('dpToken');
        //     if (dpToken) {
        //         // 内嵌时使用，dpToken需要由父级传入
        //         config.headers['x-token'] = dpToken;
        //     }
        // }
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
