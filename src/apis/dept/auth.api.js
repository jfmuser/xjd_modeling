import request from './authRequest';
import fateManagerRequest from './fateManagerRequest';
import { AuthCategory } from '../../utils/const';
import permissionData from '../../utils/permissionData';
// ,verificationCode,uniCode
export function login(username, password, verificationCode, uniCode) {
  return request({
    url: '/login',
    method: 'post',
    data: { username, password, verificationCode, uniCode },
  });
}
export const getCodes = () => {
  return request.post('/api/user/getCodeV2');
};
export const updataPassword = (data) => {
  return request.post('/api/user/updatePassword', data);
};
export function getCurrentUser(siteName = '') {
  return request.post(`/api/user/getDetail`, {});
}

export function activateAccount({ username, password, link, url }) {
  return fateManagerRequest({
    url: '/login/activate',
    method: 'post',
    data: {
      link,
      userName: username,
      passWord: password,
      url,
    },
  });
}

export function getUsers({ page = 1, size = 10, payload = {} } = {}) {
  return request.post(`/api/user/page/${page}/${size}`, payload);
}

export function createUser(payload = {}) {
  return request.post(`/api/user/add`, payload);
}

export function deleteUser(id, payload = {}) {
  return request.post(`/api/user/delete/${id}`, payload);
}

export function updateUser(payload = {}) {
  return request.post(`/api/user/update`, payload);
}

export function updateUserRole({ userId, payload = [] } = {}) {
  return request.post(`/api/user-role/update/${userId}`, { data: payload });
}

export function getUserRole(roleId) {
  return request.post(`/api/role/get/${roleId}`, {});
}

export function getUserRoleList(payload) {
  return request.post('/api/user-role/list', payload);
}

export function getRoles({ page = 1, size = 10, payload = {} } = {}) {
  return request.post(`/api/role/page/${page}/${size}`, payload);
}

export function deleteRole(roleId) {
  return request.post(`/api/role/delete/${roleId}`, {});
}

export function createRole(payload = {}) {
  return request.post(`/api/role/add`, payload);
}

export function updateRole(payload = {}) {
  return request.post(`/api/role/update`, payload);
}

export function updateRoleAuth({ roleId, payload }) {
  return request.post(`/api/role-menu/updateAll/${roleId}`, { data: payload });
}

export function getRoleAuth({ code, roleId, type } = {}) {
  return request.post('/api/role-menu/listByRole', { code, roleId, type });
}

export function getAllRole(payload = {}) {
  return request.post('/api/role/list', payload);
}

export function getAllAuth({ path, name, type = AuthCategory.FRONTEND } = {}) {
  return request.post('/api/menu/list', { path, name, type });
}

export function asyncAuth() {
  return request.post('/api/menu/sync/all', { "menus": permissionData });
}

export function getWorkspace() {
  return request.post('/api/user/getWorkspace');
}

export function getSystemConfig(data) {
  return request.post('/api/sys-config/list', data);
}

export function addSystemConfig(data) {
  return request.post('/api/sys-config/create', data);
}

export function updateUsername(data) {
  return request.post('/api/user/rename', data);
}
