
import request from './request'
/**
 * 保存fate数据到数据库
 * @param params 请求参数
 * @param params.projectId 项目id
 * @param params.jobId 作业id
 */
export const saveFateData = ({ projectId, jobId }) => {
   return request.post('/fate/job/save',{projectId, jobId});
};

/**
 * 根据projectId查询fate数据
 * @param params 请求参数
 * @param params.projectId 项目id
 */
export const queryFateData = ({ projectId }) => {
   return request.get('/fate/job/listJobsByProjectId', {
         params:{projectId}
    });
};

/**
 * 收藏模型
 * @param params 请求参数
 * @param params.fateId fateId
 * @param params.isCollect 收藏或取消收藏的标记
 */
export const collectFate = ({ projectId,jobId,modelName,remarks }) => {
  return request.post('/fate/model/collectModel',{projectId,jobId,modelName,remarks});
};

/**
 * 删除模型
 * @param params 请求参数
 * @param params.fateId fateId
 * @param params.isCollect 收藏或取消收藏的标记
 */
export const deleteModel = ({ modelId }) => {
  return request.post('/fate/model/deleteModel',{params:{modelId}});
};