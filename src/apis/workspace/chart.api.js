import fateBoardRequestPrefix from './fateBoardRequest';
// 算法调度日志获取id
export function getInstanceId() {
  return fateBoardRequestPrefix({
    url: '/v1/server/fateflow/info',
    method: 'post',
  });
}
export function getMetrics(data) {
  return fateBoardRequestPrefix({
    url: '/v1/tracking/component/metrics',
    method: 'post',
    data,
  });
}
export function getMetricData(data) {
  return fateBoardRequestPrefix({
    url: '/v1/tracking/component/metric_data',
    method: 'post',
    data,
  });
}

export function getMetricsData(data) {
  return fateBoardRequestPrefix({
    url: '/v1/tracking/component/metric_data/batch',
    method: 'post',
    data,
  });
}

export function getDataOutput(data) {
  return fateBoardRequestPrefix({
    url: '/v1/tracking/component/output/data',
    method: 'post',
    data,
  });
}
export function getModelOutput(data) {
  return fateBoardRequestPrefix({
    url: '/v1/tracking/component/output/model',
    method: 'post',
    data,
  });
}
