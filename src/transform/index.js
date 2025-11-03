import camelCase from 'lodash/camelCase';
import HeteroLRHandler from '../transform/fn/onlyMetrics';
import HomoLR from '../transform/fn/HomoLR';
import Reader from '../transform/fn/Reader';
import DataIO from '../transform/fn/DataIO';
import FeatureScale from '../transform/fn/FeatureScale';
import Evaluation from '../transform/fn/Evaluation';
import DataTransform from '../transform/fn/DataTransform';
import HeteroLR from '../transform/fn/HeteroLR';
import TextOutput from '../transform/fn/TextOutput';
import DataSplit from '../transform/fn/DataSplit';
import Secureboost from '../transform/fn/Secureboost';
import Pearson from '../transform/fn/Pearson';

import loss from '../transform/metricFn/loss';
import others from '../transform/metricFn/others';
import dataInfo from '../transform/metricFn/dataInfo';
import evaluationSummary from '../transform/metricFn/evaluationSummary';
import curves from '../transform/metricFn/curves';
import rocEvaluation from '../transform/metricFn/rocEvaluation';
import ksEvaluation from '../transform/metricFn/ksEvaluation';
import liftEvaluation from '../transform/metricFn/liftEvaluation';
import gainEvaluation from '../transform/metricFn/gainEvaluation';
import _binaryEvaluation from '../transform/metricFn/_binaryEvaluation';
import accuracyEvaluation from '../transform/metricFn/accuracyEvaluation';
import confusionMat from '../transform/metricFn/confusionMat';
import performanceSum from '../transform/metricFn/performanceSum';
import _multiEvaluation from '../transform/metricFn/_multiEvaluation';

export default function getTransformFn(modelType) {
  const textOutput = ['Intersection', 'Upload', 'Download'];
  const dataSplit = ['HomoDataSplit', 'HeteroDataSplit'];
  const secureBoost = [
    'HomoSecureBoost',
    'HeteroSecureBoost',
    'HomoSecureboost',
    'HeteroSecureboost',
    'HeteroFastSecureBoost',
    'HomoFastSecureBoost',
    'HeteroFastSecureboost',
    'HomoFastSecureboost',
  ];
  const pearson = ['HeteroPearson', 'HomoPearson'];
  if (textOutput.join('|').match(modelType)) {
    return TextOutput;
  } else if (dataSplit.join('|').match(modelType)) {
    return DataSplit;
  } else if (secureBoost.join('|').match(modelType)) {
    return Secureboost;
  } else if (pearson.join('|').match(modelType)) {
    return Pearson;
  } else {
    switch (modelType) {
      case 'HomoLR':
      case 'federated_training':
        return HomoLR;
      case 'Reader':
        return Reader;
      case 'DataIO':
        return DataIO;
      case 'FeatureScale':
        return FeatureScale;
      case 'Evaluation':
        return Evaluation;
      case 'DataTransform':
        return DataTransform;
      case 'HeteroLR':
        return HeteroLR;
      default:
        console.error('import getTransformFn error', modelType);
        return HeteroLRHandler;
    }
  }
}

export function getTransformMetricFn(metricType) {
  const file = metricType.startsWith('_') ? metricType : camelCase(metricType);
  switch (file) {
    case 'loss':
      return loss;
    case 'others':
      return others;
    case 'dataInfo':
      return dataInfo;
    case 'evaluationSummary':
      return evaluationSummary;
    case 'curves':
      return curves;
    case 'rocEvaluation':
      return rocEvaluation;
    case 'ksEvaluation':
      return ksEvaluation;
    case 'liftEvaluation':
      return liftEvaluation;
    case 'gainEvaluation':
      return gainEvaluation;
    case '_binaryEvaluation':
      return _binaryEvaluation;
    case 'accuracyEvaluation':
      return accuracyEvaluation;
    case 'confusionMat':
      return confusionMat;
    case 'performanceSum':
      return performanceSum;
    case '_multiEvaluation':
      return _multiEvaluation;
    default:
      console.error('import getTransformMetricFn error: ', file);
      return null;
  }
}
