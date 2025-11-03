import workspaceRequest from './fateApiRequest';
import request from './fateApiRequest';

export function getAllDataList({
  currentPage,
  size,
  dataName,
  dataSourceType,
}) {
  return workspaceRequest.post(
    '/data/getAllDataList',
    { dataName, dataSourceType },
    { params: { currentPage, size } },
  );
}

export function getDataById(dataId) {
  return request.post('/data/detail', {}, { params: { dataId } });
}

export function getHiveDbs() {
  return request.post('/hive/getHiveDbList', {}, {});
}
export function getHiveTables(id) {
  return request.post(`hive/getHiveTableList/${id}`);
}
export function createData(data) {
  return workspaceRequest({
    url: '/data/upload',
    method: 'post',
    data,
  });
}
export function createAddData(data) {
  return workspaceRequest({
    url: '/config/add',
    method: 'post',
    data,
  });
}
//导入查询接口
export function SearchData() {
  return workspaceRequest({
    url: '/config/page',
    method: 'post',
  });
}
//导入
export function importData(data) {
  return workspaceRequest({
    url: '/executive/execute',
    method: 'post',
    data,
  });
}
//导入记录
export function importHistoryData(configid) {
  return workspaceRequest({
    url: `/executive/log/${configid}`,
    method: 'post',
  });
}
//删除数据
export function DeleteData(id) {
  return workspaceRequest({
    url: `/config/delete/${id}`,
    method: 'post',
  });
}
//编辑数据
export function EditDatas(data) {
  return workspaceRequest({
    url: '/config/update/',
    method: 'post',
    data,
  });
}
export function updateData(data) {
  return workspaceRequest.post('/data/update', data);
}

export function deleteData(data) {
  return workspaceRequest.post('/data/delete', data);
}

export function getDataTypes() {
  return workspaceRequest.post('/data/dataType');
}
export function getAllDataName() {
  return workspaceRequest.post('/data/dataNameList');
}

export function getTableList(id, currentPage = 1, size = 10) {
  return workspaceRequest.post(
    `/dataTable/getDataTableList/${id}`,
    {},
    { params: { currentPage, size } },
  );
}
export function publishData(data) {
  return workspaceRequest.post(`/data/publish`, data);
}

export function getSelfDataNamespaceList() {
  return workspaceRequest.post(`/data/selfDataNamespaceList`);
}
export function getOtherDataNamespaceList() {
  return workspaceRequest.post(`/data/otherDataNamespaceList`);
}
export function getTableNames(namespace, type) {
  return workspaceRequest.post(
    `/data/getTableNames`,
    {},
    { params: { namespace, type } },
  );
}
