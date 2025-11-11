import request from './secretflowRequest'

/**
 * @description 获取算子名称列表
*/
export function listComponents(data) {
    return request({
        url: '/v1alpha1/component/list',
        method: 'post',
        data
    })
}

/**
 * @description 获取项目列表
*/
export function listProject(data) {
    return request({
        url: '/v1alpha1/p2p/project/list',
        method: 'post',
        data
    })
}



/**
 * @description 获取画布列表
*/
export function listGraph(data) {
    return request({
        url: '/v1alpha1/graph/list',
        method: 'post',
        data
    })
}

/**
 * @description 查看主体内容
*/
export function listNode(data) {
    return request({
        url: '/v1alpha1/node/list',
        method: 'post',
        data
    })
}

/**
 * 创建项目
*/
export function createProject(data) {
    return request({
        url: '/v1alpha1/project/create',
        method: 'post',
        data
    })
}

/**
 * @description 创建训练流
*/
export function createGraph(data) {
    return request({
        url: '/v1alpha1/graph/create',
        method: 'post',
        data
    })
}


/**
 * @description 获取算子信息的中文翻译
*/
export function listComponentI18n(data) {
    return request({
        url: '/v1alpha1/component/i18n',
        method: 'post',
        data
    })
}

/**
 * @description 获取算子详细信息
*/
export function listComponentBatch(data) {
    return request({
        url: '/v1alpha1/component/batch',
        method: 'post',
        data
    })
}

/**
 * @description 登陆
*/
export function secretflowLogin(data) {
    return request({
        url: '/login',
        method: 'post',
        data
    })
}

/**
 * @description 将节点添加到项目
*/
export function addProjectNode(data) {
    return request({
        url: '/v1alpha1/project/node/add',
        method: 'post',
        data
    })
}


/**
 * @description 更新画布时调用
*/
export function fullUpdateGraph(data) {
    return request({
        url: '/v1alpha1/graph/update',
        method: 'post',
        data
    })
}

/**
 * @description 返回成功的SecretPadResponse项目数据视图对象
*/
export function getProjectDatatable(data) {
    return request({
        url: '/v1alpha1/project/datatable/get',
        method: 'post',
        data
    })
}

/**
 * @description 获取当前项目信息
*/
export function getProject(data) {
    return request({
        url: '/v1alpha1/project/get',
        method: 'post',
        data
    })
}

/**
 * @description 获取当前项目画布的详细信息
*/
export function getGraphDetail(data) {
    return request({
        url: '/v1alpha1/graph/detail',
        method: 'post',
        data
    })
}

/**
 * @description 授权项目
*/
export function addProjectDatatable(data) {
    return request({
        url: '/v1alpha1/project/datatable/add',
        method: 'post',
        data
    })
}

/**
 * @description 删除已授权的项目
*/
export function deleteProjectDatatable(data) {
    return request({
        url: '/v1alpha1/project/datatable/delete',
        method: 'post',
        data
    })
}

/**
 * @description 更新画布信息
*/
export function updateGraphNode(data) {
    return request({
        url: '/v1alpha1/graph/node/update',
        method: 'post',
        data
    })
}

/**
 * @description 开始运行项目
*/
export function startGraph(data) {
    return request({
        url: '/v1alpha1/graph/start',
        method: 'post',
        data
    })
}

/**
 * @description 删除画布
*/
export function deleteGraph(data) {
    return request({
        url: '/v1alpha1/graph/delete',
        method: 'post',
        data
    })
}

/**
 * @description 删除项目
*/
export function deleteSecretflowProject(data) {
    return request({
        url: '/v1alpha1/project/delete',
        method: 'post',
        data
    })
}

/**
 * @description 查询作业列表
*/
export function listJob(data) {
    return request({
        url: '/v1alpha1/project/job/list',
        method: 'post',
        data
    })
}

/**
 * @description 数据管理-上传数据
*/
export function secretflowCreateData(data) {
    return request({
        url: '/v1alpha1/data/create',
        method: 'post',
        data
    })
}

/**
 * @description 数据管理-获取隐语数据
*/
export function listDatatables(data) {
    return request({
        url: '/v1alpha1/datatable/list',
        method: 'post',
        data
    })
}

/**
 * @description 数据管理-获取隐语数据
*/
export function deleteDatatable(data) {
    return request({
        url: '/v1alpha1/datatable/delete',
        method: 'post',
        data
    })
}

/**
 * @description 数据管理-获取已授权项目
*/
export function getDatatable(data) {
    return request({
        url: '/v1alpha1/datatable/get',
        method: 'post',
        data
    })
}

/**
 * @description 获取隐语主体列表
*/
export function page(data) {
    return request({
        url: '/v1alpha1/node/page',
        method: 'post',
        data
    })
}

/**
 * @description 初始化节点
*/
export function initNode(data) {
    return request({
        url: '/v1alpha1/project/inst/add',
        method: 'post',
        data
    })
}
/**
 * @description 获取上一个节点传下来的特征值等
*/
export function getOutputData(data) {
    return request({
        url: '/v1alpha1/graph/node/output',
        method: 'post',
        data
    })
}
/**
 * @description 获取运行日志
*/
export function getLogs(data) {
    return request({
        url: '/v1alpha1/graph/node/logs',
        method: 'post',
        data
    })
}

/**
 * @description 获取状态
*/
export function getStatus(data) {
    return request({
        url: '/v1alpha1/graph/node/status',
        method: 'post',
        data
    })
}

/**
 * @description 获取节点的索引
*/
export function getNodeMaxIndex(data) {
    return request({
        url: '/v1alpha1/graph/node/max_index',
        method: 'post',
        data
    })
}

/**
 * 获取job详情
*/
export function getJobDetail(data) {
    return request({
        url: 'v1alpha1/project/job/get',
        method: 'post',
        data
    })
}