import request from './fateManagerRequest';

export function getApprovalHistory(params) {
  return request.post('/approval/getAllMsg', params, { params });
}

export function getApprovalUnReadMsg(params) {
  return request.post('/approval/getUnReadMsg', params, { params });
}

export function approvalAgree(payload) {
  return request.post('/approval/agreed', payload);
}

export function approvalReject(payload) {
  return request.post('/approval/reject', payload);
}

export function updateApproval(payload) {
  return request.post('/approval/update', payload);
}

export function readMessage(payload) {
  return request.post('/approval/read', payload);
}
