import request from './fateManagerRequest';

export function getVersion() {
  return request({
    url: '/dropdown/version',
    method: 'get',
    params: { productType: 1 },
  });
}

export function getSiteOptions(data) {
  return request({
    url: '/dropdown/party_id',
    method: 'get',
    data,
  });
}
