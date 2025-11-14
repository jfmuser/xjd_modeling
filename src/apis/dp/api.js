import request from './request'
import algorithmRequest from './algorithmRequest'

/**
 * @description 查询所有参与方
*/
export const getAllParties = () => {
    return request.post('/dpparty/dpParty/listData3');
};

export const dpProjectForm = (params) => {
    return request.get('/project/dpProject/form', {
        params: params
    });
};


export const dpProjectTasks05Form = (params) => {
    return request.get('/task05/dpProjectTasks05/form', {
        params: params
    });
};

/**
 * @description 查询本参与方
*/
export const getSelfParties = () => {
    return request.post('/domain/self');
};

export const refreshDatas = (data) => {
    return algorithmRequest.post('/psi/dataenhance/refreshDatas', data);
};

