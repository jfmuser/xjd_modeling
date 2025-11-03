import request from './fateApiRequest';

export function getConfigInfo() {
  return request.post('/getConfigInfo', {});
}
