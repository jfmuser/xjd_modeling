import _ from 'lodash';
import { getMetricsData } from '@/apis/workspace/chart.api';
import { getTransformMetricFn } from '../index';
import { each, isEmpty } from '../fn/uitls';
import { wrapGroupComponent } from '../fn/common';
import { METRIC_TYPES } from '../fn/const';

const SORTLIST = [
  METRIC_TYPES.CLUSTERING_EVALUATION_SUMMARY,
  METRIC_TYPES.DISTANCE_MEASURE,
  METRIC_TYPES.CONTINGENCY_MATRIX,
];

async function handler(metricsData, params) {
  const response = await getMetricsData({
    metrics: metricsData.options,
    ...params,
  });

  const separateResult = (data) => {
    const result = {};
    each(data, (metrics, metric_namespace) => {
      each(metrics, (metric, metric_name) => {
        const type = metric.meta.metric_type;
        if (!result[type]) {
          result[type] = {};
        }
        if (!result[type][metric_namespace]) {
          result[type][metric_namespace] = {};
        }
        Object.assign(result[type][metric_namespace], {
          [metric_name]: metric,
        });
      });
    });
    return result;
  };

  const result = separateResult(response.data);
  let group = [];
  let summary = {};
  let quantilePR = {};
  const confusionMatrix = {};
  const others = [];
  const omits = [];
  if (result[METRIC_TYPES.EVALUATION_SUMMARY]) {
    summary = result[METRIC_TYPES.EVALUATION_SUMMARY];
    omits.push(METRIC_TYPES.EVALUATION_SUMMARY);
  }
  if (result[METRIC_TYPES.QUANTILE_PR]) {
    quantilePR = result[METRIC_TYPES.QUANTILE_PR];
    omits.push(METRIC_TYPES.QUANTILE_PR);
  }

  if (result[METRIC_TYPES.F1_SCORE]) {
    confusionMatrix[METRIC_TYPES.F1_SCORE] = result[METRIC_TYPES.F1_SCORE];
    omits.push(METRIC_TYPES.F1_SCORE);
  }

  if (result[METRIC_TYPES.CONFUSION_MAT]) {
    confusionMatrix[METRIC_TYPES.CONFUSION_MAT] =
      result[METRIC_TYPES.CONFUSION_MAT];
    omits.push(METRIC_TYPES.CONFUSION_MAT);
  }
  if (result[METRIC_TYPES.SAMPLE_TABLE]) {
    const fn = getTransformMetricFn(METRIC_TYPES.SAMPLE_TABLE);
    const component = fn(result[METRIC_TYPES.SAMPLE_TABLE]);
    others.push({
      title: METRIC_TYPES.SAMPLE_TABLE,
      content: wrapGroupComponent(component),
    });
    omits.push(METRIC_TYPES.SAMPLE_TABLE);
  }
  if (result[METRIC_TYPES.PSI]) {
    const fn = getTransformMetricFn(METRIC_TYPES.PSI);
    let mid = {};
    for (const key in result[METRIC_TYPES.PSI]) {
      mid = Object.assign(mid, result[METRIC_TYPES.PSI][key]);
    }
    const component = fn(mid);
    others.push({
      title: METRIC_TYPES.PSI,
      content: wrapGroupComponent(component),
    });
    omits.push(METRIC_TYPES.PSI);
  }
  if (result[METRIC_TYPES.OVR]) {
    const fn = getTransformMetricFn(METRIC_TYPES.OVR);
    const component = fn(result[METRIC_TYPES.OVR], METRIC_TYPES.OVR);
    others.push({
      title: 'One_vs_Rest Evaluation',
      content: wrapGroupComponent(component),
    });
    omits.push(METRIC_TYPES.OVR);
  }

  // FIXME
  each(_.omit(result, omits), async (res, metric_type) => {
    each(res, async (data) => {
      if (typeof data !== 'string') {
        const fn = getTransformMetricFn(metric_type);
        const component = fn(data, params);
        others.push({
          title: metric_type,
          content: wrapGroupComponent(component),
        });
      }
    });
  });
  if (!isEmpty(summary)) {
    const fn = getTransformMetricFn(METRIC_TYPES.EVALUATION_SUMMARY);
    const component = fn(
      summary,
      !isEmpty(quantilePR) ? quantilePR : undefined,
      params.isEvaluation,
    );
    group.push({
      title: METRIC_TYPES.EVALUATION_SUMMARY,
      content: wrapGroupComponent(component),
    });
  }

  if (!isEmpty(confusionMatrix)) {
    const fn = getTransformMetricFn(METRIC_TYPES.CONFUSION_MAT);
    const component = fn(
      confusionMatrix.CONFUSION_MAT,
      confusionMatrix.F1_SCORE,
    );
    group.push({
      title: METRIC_TYPES.CONFUSION_MAT,
      content: wrapGroupComponent(component),
    });
  }

  group.push(...others);
  group = group.sort((a, b) => {
    const aI = SORTLIST.indexOf(a.title);
    const bI = SORTLIST.indexOf(b.title);
    if (aI < 0 || bI < 0) {
      return 0;
    } else if (aI > bI) {
      return 1;
    } else {
      return -1;
    }
  });
  const resultList = [];
  for (const val of group) {
    resultList.push(val.content);
  }
  return resultList;
}

export default handler;
