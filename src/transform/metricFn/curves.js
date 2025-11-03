import { each, groupBy } from '../fn/uitls';
import { getTransformMetricFn } from '../index';
import { METRIC_TYPES } from '../fn/const';

const typeCurry = (arr) => (type) => arr.includes(type);

const isMultiType = typeCurry([
  METRIC_TYPES.RECALL_MULTI_EVALUATION,
  METRIC_TYPES.PRECISION_MULTI_EVALUATION,
]);

const isBinaryType = typeCurry([
  METRIC_TYPES.RECALL_BINARY_EVALUATION,
  METRIC_TYPES.PRECISION_BINARY_EVALUATION,
]);

const MULTI_EVALUATION = '_multiEvaluation';
const BINARY_EVALUATION = '_binaryEvaluation';

export default function (metricData) {
  const metricGroup = {};

  each(metricData.data, (list, namespace) => {
    const groupedList = groupBy(list, 'meta.metric_type');
    each(groupedList, ([metricType, gl]) => {
      let mType = metricType;
      if (isMultiType(metricType)) {
        mType = MULTI_EVALUATION;
      } else if (isBinaryType(metricType)) {
        mType = BINARY_EVALUATION;
      }
      if (!metricGroup[mType]) {
        metricGroup[mType] = {};
      }
      if (metricGroup[mType][namespace]) {
        metricGroup[mType][namespace] =
          metricGroup[mType][namespace].concat(gl);
      } else {
        metricGroup[mType][namespace] = gl;
      }
    });
  });

  const result = [];
  each(metricGroup, (data, metricType) => {
    const fn = getTransformMetricFn(metricType);
    result.push(fn(data));
  });

  return result;
}
