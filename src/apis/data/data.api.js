import request from './dataRequest'

/**
 * @description 解析CSV
*/
export function parseCsv(data) {
    return request.post(`/parse/meta`, data);
}

/**
 * @description TEE数据授权
*/
export function createTeeDataProjectAuth(data) {
    return request.post(`/policy/create`, data);
}
