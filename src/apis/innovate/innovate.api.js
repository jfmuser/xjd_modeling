import request from './innovateRequest'

/**
 * @description 自研上传csv数据
*/
export const uploadScretflowCSVData = (data) => {
    return request.post('/data/upload', data);
};

/**
 * @description 获取fateboard登陆信息
*/
export const getBoardInfo = (data) => {
    return request.post('/user/getBoardInfo', data);
};