import request from './cloudManagerRequest';
import dayjs from 'dayjs';

export function getJobSummary({ dateRange, institution, site }) {
  const data = {
    beginDate: dayjs(dateRange[0]).valueOf(),
    endDate: dayjs(dateRange[1]).valueOf(),
    institutions: institution,
    site,
  };
  return request({
    url: '/job/v3/find/summary/finished',
    method: 'post',
    data,
  });
}

export function getSiteOptions(data) {
  return request({
    url: '/job/v3/site/all',
    method: 'post',
    data,
  });
}

export function getDurationTable(data) {
  return request({
    url: '/job/v3/find/typed/table',
    method: 'post',
    data,
  });
}

export function getDuration(data) {
  return request({
    url: '/job/v3/find/typed/duration',
    method: 'post',
    data,
  });
}

export function getEachPeriod(data) {
  return request({
    url: '/job/v3/summary/institutions/each/period',
    method: 'post',
    data,
  });
}

export function getAllPeriod(data) {
  return request({
    url: '/job/v3/summary/institutions/all/period',
    method: 'post',
    data,
  });
}

export function getEachSitePeriod(data) {
  return request({
    url: '/job/v3/summary/site/each/period',
    method: 'post',
    data,
  });
}

export function getSitePeriod(data) {
  return request({
    url: '/job/v3/site/period',
    method: 'post',
    data,
  });
}
