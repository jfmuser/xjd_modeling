import request from './fateBoardRequest';

export function jobDownload(data) {
  return request.post('/job/download', data, { responseType: 'blob' });
}

//fb 登录
export const fblogin = (username, password) => {
  return request.post('/user/login', { username, password });
};

//fb 获取cookie
export function security() {
  return request({
    url: '/user/getKey',
    method: 'post',
    params: {},
  });
}
export function getComponentPara(data) {
  return request({
    url: '/v1/tracking/component/parameters',
    method: 'post',
    data,
  });
}

export function killJob(data) {
  return request({
    url: '/job/v1/pipeline/job/stop',
    method: 'post',
    data,
  });
}

export function retryJob(data) {
  return request({
    url: '/job/v1/rerun',
    method: 'post',
    data,
  });
}

export function getComponentCommand(data) {
  return request({
    url: '/job/componentCommand',
    method: 'post',
    data,
  });
}
