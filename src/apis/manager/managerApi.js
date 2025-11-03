import request from './managerApiRequest'

/**
 * @description 查询所有参与方
*/
export const getAllParties = () => {
    return request.post('/domain/list');
};

/**
 * @description 查询本参与方
*/
export const getSelfParties = () => {
    return request.post('/domain/self');
};

/**
 * @description 注册本参与方
*/
export const registerSelfParties = (data) => {
    return request.post('/domain/register', data);
};

/**
 * @description 添加引擎
*/
export const addEngine = (data) => {
    return request.post('/domain/syncEngine', data)
}

/**
 * 同步引擎信息
*/
export const syncEngineInfo = (engineId) => {
    return request.post(`/domain/syncEngineInfo/${engineId}`)
}

/**
 * @description 分页查询数据
*/
export const getData = (data) => {
    return request.post('/data/page', data);
};

/**
 * @description 分页查询数据源配置列表
*/
export const getDataSource = (data) => {
    return request.post('/data-source-config/page', data);
};

/**
 * @description 获取执行配置记录
*/
export const getRunConfigLog = (configId) => {
    return request.post(`/data-transfer-record/log/${configId}`);
};

/**
 * @description 创建节点数据
*/
export const creationData = (data) => {
    return request.post('/data/create', data);
};

/**
 * @description 删除数据
*/
export const delData = (dataId) => {
    return request.post(`/data/delete/${dataId}`);
};

/**
 * @description 查询数据授权
*/
export const queryDataAuth = (dataId) => {
    return request.post(`/data/listGrant/${dataId}`);
};

/**
 * @description 分页查询所有项目
*/
export const queryAllProject = (data) => {
    return request.post(`/project/page`, data);
};

/**
 * @description 使用画布创建项目
*/
export const createCanvasProject = (data) => {
    return request.post(`/project/createProjectWithAlg`, data);
};

/**
 * @description 获取数据类型列表
*/
export function getDataTypes() {
    return request.post('/data/dataType');
}

/**
 * @description 获取数据类型列表
*/
export function createDataSource(data) {
    return request.post('/data-source-config/add', data);
}

/**
 * @description 删除数据源数据
*/
export function delDataSource(id) {
    return request.post(`/data-source-config/delete/${id}`);
}

/**
 * @description 执行数据源配置
*/
export function runDataSourceConfig(data) {
    return request.post(`/data-transfer-record/execute`, data);
}

/**
 * @description 模型部署
*/
export function deployModel(data) {
    return request.post(`/model/deploy`, { ...data });
}

/**
 * @description 查询模型列表
*/
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

/**
 * @description 收藏模型
*/
export function addCollect(payload) {
    return request.post('/model/collect', payload);
}

/**
 * @description 通过JOBID取消收藏
*/
export function cancelCollect(jobId) {
    return request.post('/model/cancelCollect', { jobId });
}

/**
 * @description 创建项目授权
*/
export function createProjectAuth(data) {
    return request.post('/data/createGrant', data);
}

/**
 * @description 取消项目授权
*/
export function delDataAuth(data) {
    return request.post(`/data/removeGrant`, data);
}

/**
 * @description 根据项目ID查询算子参数
*/
export function getSelectAlgorithmParams(id) {
    return request.post(`/project-alg-conf/getSelectAlgorithmParams?projectId=${id}`);
}

/**
 * @description 根据项目ID获取算子列表
*/
export function getOperator(id) {
    return request.post(`/project-alg-conf/getOperator/${id}`);
}

/**
 * @description 根据项目ID查询已授权的数据
*/
export function getAuthData(projectId) {
    return request.post(`/data/listByProjectId/${projectId}`);
}

/**
 * @description 根据算法库Id查询该版本绑定的算法(树结构)
*/
export function getArithmeticList(libId) {
    return request.post(`/algorithm/treeListByLibId/${libId}`);
}

/**
 * @description 根据算法库Id查询该版本绑定的算法(树结构)
*/
export function updatebind(libId, data) {
    return request.post(`/algorithm/bind/batchCreate/${libId}`, data);
}

/**
 * @description 获取项目列表(树状数据，根据项目分组)
*/
export function getTreeProject() {
    return request.post(`/project/treeProject`);
}

/**
 * @description 上传GO语言数据
*/
export function uploadGoData(data) {
    return request.post(`/data/uploadFile`, data);
}

/**
 * @description 通过平台获取数据列表
*/
export function getListByPlatform(data) {
    return request.post(`/data/listByPlatform?platform=${data.platform}`);
}

/**
 * @description 获取算法库详情
*/
export function getAlglibraryInfo(versionId) {
    return request.post(`/algorithm/version/detail/${versionId}`);
}

/**
 * 查询配置信息列表
*/
export const getConfigList = (data = {}) => {
    return request.post('/sys-config/list', data)
}

/**
 * 添加配置信息
 */
export const addConfigInfo = (data = {}) => {
    return request.post('/sys-config/create', data)
}

/**
 * 删除配置信息
*/
export const delConfigInfo = (id) => {
    return request.post(`/sys-config/delete/${id}`)
}

/**
 * 更改配置信息 
*/
export const updateConfigInfo = (data = {}) => {
    return request.post(`/sys-config/update/${data.id}`, data)
}

/**
 * 获取任务统计信息 
*/
export const getJobStatisticsInfo = () => {
    return request.post(`/project-job/getStatisticsByStatus`)
}

/**
 * 查询数据对象 
*/
export const queryDataObject = (dataId) => {
    return request.post(`/data/get/${dataId}`)
}

