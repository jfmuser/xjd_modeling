import request from './cloudManagerRequest';

// abandoned
export function getAuthorityHistory(data) {
  return request({
    url: '/authority/history',
    method: 'post',
    data,
  });
}

export function getCurrentAuthority(data) {
  return request({
    url: '/authority/currentAuthority',
    method: 'post',
    data,
  });
}

export function getCancelAuthority(data) {
  return request({
    url: '/authority/cancelList',
    method: 'post',
    data,
  });
}

export function cancelAuthority(data) {
  return request({
    url: '/authority/cancel',
    method: 'post',
    data,
  });
}

export function getAuthorityDetails(data) {
  return request({
    url: '/authority/details',
    method: 'post',
    data,
  });
}

export function getAuthorityStatus(data) {
  return request({
    url: '/authority/status',
    method: 'post',
    data,
  });
}

export function authorityReview(data) {
  return request({
    url: '/authority/review',
    method: 'post',
    data,
  });
}

export function currentAuthority(data) {
  return request({
    url: '/authority/currentAuthority',
    method: 'post',
    data,
  });
}

export function getAllCurrentAuthority(data) {
  return request({
    url: '/authority/all/currentAuthority',
    method: 'post',
    data,
  });
}

export function getAllAuthorityHistory(data) {
  return request({
    url: '/authority/all/history',
    method: 'post',
    data,
  });
}
