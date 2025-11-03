import request from '../manager/managerApiRequest'

export function getModelList({
  currentPage = 1,
  size = 10,
  modelName = '',
} = {}) {
  return request.post(
    `/model/modelList`,
    { modelName },
    { params: { currentPage, size } },
  );
}

export function deleteModel(modelVersion) {
  return request.post(`/model/delete/${modelVersion}`);
}

export function deployModel(data) {
  return request.post(`/model/deploy`, { ...data });
}

export function findModelInfo(id) {
  return request.post('/model/findModelInfo', {}, { params: { id } });
}

export function getDeployModels(modelVersion, currentPage = 1, size = 10) {
  return request.post(
    `/model/deploy/history/${modelVersion}`,
    {},
    { params: { currentPage, size } },
  );
}

export function onLineReasoning(data) {
  return request.post('/model/onlineReasoning', data);
}

export function offlineReasoning(data) {
  return request.post('/model/offlineReasoning', data);
}

export function cancelCollect(jobId) {
  return request.post('/model/cancelCollect', { jobId });
}

export function addCollect(payload) {
  return request.post('/model/collect', payload);
}

/**
 * 获取job列表(根据模型名称分类)
*/
export function getJobList() {
  return request.post('/model/listModel');
}