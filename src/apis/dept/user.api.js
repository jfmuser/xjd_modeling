import request from './fateManagerRequest';

export function getAccessList(payload) {
  return request.post('/user/accesslist', payload);
}

export function getSiteList(payload) {
  return request.post('/user/sitelist', payload);
}

export function getUserList(payload) {
  return request.post('/user/list', payload);
}

export function addUser(data) {
  return request.post('/user/add', data);
}
export function editUser(data) {
  return request.post('/user/edit', data);
}
export function deleteUser(data) {
  return request.post('/user/delete', data);
}

export function getSiteInfoUsers(data) {
  return request({
    url: `/user/siteinfouserlist`,
    method: 'post',
    data,
  });
}
