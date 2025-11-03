import request from './fateManagerRequest';

export function getTotal(data) {
  return request({
    url: '/monitor/total',
    method: 'post',
    data,
  });
}

export function getInstitution(data) {
  return request({
    url: '/monitor/institution',
    method: 'post',
    data,
  });
}

export function getSite(data) {
  return request({
    url: '/monitor/site',
    method: 'post',
    data,
  });
}

export function getMonitorDetail(data) {
  return request({
    url: '/monitor/detail',
    method: 'post',
    data,
  });
}
