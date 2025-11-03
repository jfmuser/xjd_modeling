import request from './fateApiRequest';

export function getHeaderData(dataId) {
  return request.post('/dataHeader/getDataHeaders', {}, { params: { dataId } });
}

//批量修改
export function updateData(data) {
  return request.post('/dataHeader/updateDataHeaders', data);
}
