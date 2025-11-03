import request from '../../apis/manager/managerApiRequest';

export function getProjectList({
  currentPage = 1,
  size = 10,
  projectName = '',
  projectSourceType = '',
} = {}) {
  return request.post(
    `/project/select`,
    {
      projectName,
      projectSourceType,
    },
    { params: { currentPage, size } },
  );
}

export function getProjectById(projectId) {
  return request.post(`/project/detail/${projectId}`);
}

export function getProjectJobList(data) {
  return request.post(`/project/pageJobByProjectId`, data);
}

export function createProject(payload) {
  return request.post('/project/createProject', payload);
}

/**
 * @description 修改画布创建的项目
*/
export function updateProject(payload) {
  return request.post('/project/updateProjectByAlg', payload);
}

export function updateProjectJson(payload) {
  return request.post('/project/updateProjectByJson', payload);
}

export function deleteProject(projectId) {
  return request.post(`/project/delete/${projectId}`);
}

export function createJob(projectId) {
  return request.post(`/project/startJob/${projectId}`);
}

export function getJobStatus(jobIds) {
  return request.post('/project/JobStatus', { data: jobIds });
}

export function getProjectAlgorithms(projectId) {
  return request.post(
    `/project/getProjectAlgorithms`,
    {},
    { params: { projectId } },
  );
}

export function getAlgorithmParams(projectId) {
  return request.post(
    `/project/getAlgorithmParams`,
    {},
    { params: { projectId } },
  );
}

export function publishProject(data) {
  return request.post(`/project/publish`, data);
}

export function getOtherProject({
  currentPage = 1,
  size = 10,
  projectName = '',
} = {}) {
  return request.post(
    `/project/selectOther`,
    {
      projectName,
    },
    { params: { currentPage, size } },
  );
}

export function getProjectDependencyData(projectId) {
  return request.post(
    `/project/getDependencyData`,
    {},
    { params: { projectId } },
  );
}

export function getProjectAlgorithmsList(projectId) {
  return request.post(
    `/project/getOperator/${projectId}`,
  );
}
