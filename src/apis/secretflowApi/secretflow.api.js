import request from './secretflowApiRequest'

/**
 * @description 隐语上传csv数据
*/
export const uploadScretflowCSVData = (data) => {
    return request.post('/api/domain-data/uploadToSecretPad', data);
};

/**
 * @description 获取隐语的账号密码
*/
export const getSecretflowInfo = (data) => {
    return request.post('/api/user/getSecretPadInfo', data);
};

/**
 * @description 后台解析csv
*/
export const getCsvHead = (data) => {
    return request.post('/api/domain-data/parseCsvMeta', data);
};

/**
 * @description 下载csv结果数据
*/
export const downloadCsvData = (data) => {
    return request.post(`/api/job/downloadTable/${data.projectId}/${data.jobId}/${data.taskId}`);
};

export const startJob = (data) => {
    return request.post('/sys/job/start', data);
};