import request from './managerRequest'

/**
 * 获取威胁项库信息 
*/
export const getThreatTermInfo = () => {
    return request.post(`/open/dict/menace`)
}