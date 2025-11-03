import workspaceRequest from '../manager/managerApiRequest';

export function getVersionManagementList({
  currentPage = 1,
  size = 10,
  name = '',
} = {}) {
  return workspaceRequest.post(
    `/algorithm/version/list`,
    { name },
    { params: { currentPage, size } },
  );
}

export function getLibAndAlgList(data) {
  return workspaceRequest.post(
    `/algorithm/version/libAndAlgList`,
    data,
  );
}

export function getInEffectLibAndAlgList() {
  return workspaceRequest.post(`/algorithm/version/inEffectLibAndAlgList`);
}

export function getVersionManagementOptionsList() {
  return workspaceRequest.post(`/algorithm/version/optionsList`);
}

export function getVersionManagementById(versionId) {
  return workspaceRequest.post(`/algorithm/version/listById/${versionId}`);
}

export function createVersion(payload) {
  return workspaceRequest.post('/algorithm/version/create', { ...payload });
}

export function importVersion(payload) {
  return workspaceRequest.post('/algorithm/version/import', payload);
}

export function updateVersion(payload) {
  return workspaceRequest.post('/algorithm/version/update', payload);
}

export function publish(versionId) {
  return workspaceRequest.post(
    `/algorithm/version/publish`,
    {},
    { params: { versionId } },
  );
}

export function deleteVersion(versionId) {
  return workspaceRequest.post(`/algorithm/version/delete/${versionId}`);
}

export function copyAlgorithmLib(versionId) {
  return workspaceRequest.post(`/algorithm/version/copy/${versionId}`);
}

export function copyAlgorithm(algorithmId) {
  return workspaceRequest.post(`/algorithm/copy/${algorithmId}`);
}

export function getAlgorithmList({
  currentPage = 1,
  size = 10,
  verId = '',
} = {}) {
  return workspaceRequest.post(
    `/algorithm/list/${verId}`,
    { verId },
    { params: { currentPage, size } },
  );
}

export function getAlgorithmAllList({
  currentPage = 1,
  size = 10,
  name = '',
} = {}) {
  return workspaceRequest.post(
    `/algorithm/list`,
    { name },
    { params: { currentPage, size } },
  );
}

export function getAlgorithmTreeList({ name = '' } = {}) {
  return workspaceRequest.post(`/algorithm/treeList`, { name }, {});
}

export function getAlgorithmPageTreeList(data) {
  return workspaceRequest.post(
    `/algorithm/treePage`,
    data,
  );
}

export function createAlgorithm(data) {
  return workspaceRequest.post(
    '/algorithm/create',
    { ...data }
  );
}

export function updateAlgorithm(payload) {
  return workspaceRequest.post('/algorithm/update', payload);
}

export function deleteAlgorithm(algorithmId) {
  return workspaceRequest.post(`/algorithm/delete/${algorithmId}`);
}

export function bindAlgorithm(payload) {
  return workspaceRequest.post(`/algorithm/bind/create`, payload);
}

export function updateBind(payload) {
  return workspaceRequest.post('/algorithm/bind/update', payload);
}

export function deleteBind(id) {
  return workspaceRequest.post(`/algorithm/bind/delete/${id}`);
}

export function nameList() {
  return workspaceRequest.post(`/algorithm/nameList`);
}

export function algorithmVerList(name) {
  return workspaceRequest.post(
    `/algorithm/algorithmVerList`,
    {},
    { params: { name } },
  );
}

export function inEffectAlgorithmList(type) {
  return workspaceRequest.post(
    `/algorithm/inEffectAlgorithmList`,
    {},
    { params: { type } },
  );
}

export function inEffectAlgorithmParams(name) {
  return workspaceRequest.post(
    `/algorithm/inEffectAlgorithmParams`,
    {},
    { params: { name } },
  );
}

export function getAlgorithmParamsByVersionId(versionId) {
  return workspaceRequest.post(
    `/algorithm/getAlgorithmParams`,
    {},
    { params: { versionId } },
  );
}

export function getDetailById(id) {
  return workspaceRequest.post(`/algorithm/detailById`, {}, { params: { id } });
}
