import request from './cloudManagerRequest';

export function getInstitutionList(data) {
  return request({
    url: '/site/institutions',
    method: 'post',
    data,
  });
}

export function getCloudManager(data) {
  return request({
    url: '/site/page/cloudManager',
    method: 'post',
    data,
  });
}

export function getInstitutionByStatus(data) {
  return request({
    url: '/site/institutions/status/dropdown',
    method: 'post',
    data,
  });
}

export function getAllInstitution(data) {
  return request({
    url: '/site/institutions/all/dropdown',
    method: 'post',
    data,
  });
}

export function getSiteInfo(data) {
  return request({
    url: '/site/find',
    method: 'post',
    data,
  });
}

export function getAllSite(data) {
  return request({
    url: '/site/find/all',
    method: 'post',
    data,
  });
}

export function resetNetwork(data) {
  return request({
    url: '/site/cloudManager/network',
    method: 'post',
    data,
  });
}

export function getIPHistory(data) {
  return request({
    url: '/site/ip/query/history',
    method: 'post',
    data,
  });
}

export function getIpList(data) {
  return request({
    url: '/site/ip/list',
    method: 'post',
    data,
  });
}

export function checkWeb(data) {
  return request({
    url: '/site/checkWeb',
    method: 'post',
    data,
  });
}

export function deal(data) {
  return request({
    url: '/site/ip/deal',
    method: 'post',
    data,
  });
}

export function getUsedPage(data) {
  return request({
    url: '/site/usedPage',
    method: 'post',
    data,
  });
}

export function getInstitutionsInGroup(data) {
  return request({
    url: '/site/institutionsInGroup',
    method: 'post',
    data,
  });
}

export function deleteInstitution(data) {
  return request({
    url: '/site/institutions/delete',
    method: 'post',
    data,
  });
}

export function deleteSite(data) {
  return request({
    url: '/site/delete',
    method: 'post',
    data,
  });
}

export function addSite(data) {
  return request({
    url: '/site/addNew',
    method: 'post',
    data,
  });
}

/**
 * mode for 1.4
 * @param {*} data
 * @returns
 */
export function updateSite(data) {
  return request({
    url: '/site/updateNew',
    method: 'post',
    data: {
      ...data,
      mode: 'short',
    },
  });
}
