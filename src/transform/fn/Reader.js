import metricsArrange from './metricsArrange';
import { getTransformMetricFn } from '../index';

const fn = async (
  modelData,
  metricsData,
  partyId,
  role,
  componentName,
  jobId,
) => {
  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId,
  };
  const group = [];
  let othersHandler;
  if (metricsData && !metricsData.msg.match('no data')) {
    metricsData = metricsArrange(metricsData.data);
    const othersMetricsData = metricsData.find(
      (item) => item.name === 'others',
    );
    othersHandler = getTransformMetricFn('others');
    othersHandler = othersHandler.bind(null, othersMetricsData, params);
  }
  if (othersHandler) {
    const others = await othersHandler();
    group.push(...others);
  }
  return group;
};

export default fn;
