import request from './fateApiRequest';

export const login = (username, password, verificationCode, uniCode) => {
  return request.post('/user/login', {
    username,
    password,
    verificationCode,
    uniCode,
  });
};
export const getCode = () => {
  return request.post('/user/getCodeV2');
};
export const getlogin = () => {
  return request.post('/user/getBoardInfo');
};
export const logout = () => {
  return request.post('/user/logout');
};

export const getCurrentUser = () => {
  return request.post('/user/currentUser');
};
