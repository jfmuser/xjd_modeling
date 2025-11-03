import fateManagerRequest from './fateManagerRequest';

/**
 * 
 * @description 获取本方组织部门信息
 */
export function getMySite({ page, pageSize }) {
  return fateManagerRequest({
    url: '/site/getsite',
    method: 'post',
    data: {
      pageNum: page,
      pageSize,
    },
  });
}

/**
 * 
 * @description 获取授权组织部门信息
 */
export function getOtherSite({ page, pageSize }) {
  return fateManagerRequest({
    url: '/site/other',
    method: 'post',
    data: {
      pageNum: page,
      pageSize,
    },
  });
}

export function checkUrl(data) {
  return fateManagerRequest({
    url: '/site/checkUrl',
    method: 'post',
    data,
  });
}

export function getInstitutions(params) {
  return fateManagerRequest({
    url: '/site/institutions',
    method: 'get',
    params,
  });
}

export function applySite(data) {
  return fateManagerRequest({
    url: '/site/applysite',
    method: 'post',
    data,
  });
}

export function getApplyLog(data) {
  return fateManagerRequest({
    url: '/site/applylog',
    method: 'post',
    data,
  });
}

export function getSiteFunction(data) {
  return fateManagerRequest({
    url: '/site/function',
    method: 'post',
    data,
  });
}

export function getSiteApplyState(params) {
  return fateManagerRequest({
    url: '/site/queryapply',
    method: 'get',
    params,
  });
}

export function getNoticeApplySite(data) {
  return fateManagerRequest({
    url: `/site/noticeapplysite`,
    method: 'post',
    data,
  });
}

export function setReadState(data) {
  return fateManagerRequest({
    url: `/site/readapplysite`,
    method: 'post',
    data,
  });
}

export function getSiteInfo(data) {
  return fateManagerRequest({
    url: '/site/info',
    method: 'post',
    data,
  });
}

export function checkNet(data) {
  return fateManagerRequest({
    url: '/site/telnet',
    method: 'post',
    data,
  });
}

export function updateSite(data) {
  return fateManagerRequest({
    url: '/site/update',
    method: 'post',
    data,
  });
}

export function getSiteMsg(data) {
  return fateManagerRequest({
    url: '/site/getmsg',
    method: 'post',
    data,
  });
}

export function readMsg(data) {
  return fateManagerRequest({
    url: '/site/readmsg',
    method: 'post',
    data,
  });
}

export function registerSite(data) {
  return fateManagerRequest({
    url: '/site/register',
    method: 'post',
    data,
  });
}
