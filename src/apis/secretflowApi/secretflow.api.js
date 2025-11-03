import request from './secretflowApiRequest'

/**
 * @description 隐语上传csv数据
*/
export const uploadScretflowCSVData = (data) => {
    return request.post('/domain-data/uploadToSecretPad', data);
};

/**
 * @description 获取隐语的账号密码
*/
export const getSecretflowInfo = (data) => {
    return request.post('/user/getSecretPadInfo', data);
};

/**
 * @description 后台解析csv
*/
export const getCsvHead = (data) => {
    return request.post('/domain-data/parseCsvMeta', data);
};

/**
 * @description 下载csv结果数据
*/
export const downloadCsvData = (data) => {
    return request.post(`/job/downloadTable/${data.projectId}/${data.jobId}/${data.taskId}`);
};