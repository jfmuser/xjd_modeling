import { createHeader, each } from '../fn/uitls';
import { uniqueArr, hh } from '../../utils';

const sum = (...args) => {
  let result = 0;
  while (args.length) {
    const i = args.shift();
    result += i;
  }
  return result;
};

function handler(confusionMat, f1Score) {
  const header = [
    createHeader('effect', ''),
    createHeader('dataset'),
    createHeader('f1score', 'F1-score'),
    createHeader('labels', 'true label/predict label', {
      renderHeader() {
        return hh(
          'p',
          {
            class: 'mult-title',
          },
          [
            hh(
              'span',
              {
                class: 'true-label',
              },
              'true label',
            ),
            hh('span', {
              class: 'split-inline',
            }),
            hh(
              'span',
              {
                class: 'predict-label',
              },
              'predict label',
            ),
          ],
        );
      },
    }),
    createHeader('0'),
    createHeader('1'),
  ];
  const confusionMatNamespaces = Object.keys(confusionMat);
  const f1ScoreNamespaces = Object.keys(f1Score);
  const namespaces = uniqueArr([
    ...confusionMatNamespaces,
    ...f1ScoreNamespaces,
  ]);

  const tableData = [];

  namespaces.forEach((namespace) => {
    each(confusionMat[namespace], ({ meta }, name) => {
      const effect = meta.name.replace(/(_confusion_mat|_f1_score)$/g, '');
      if (!tableData[effect]) {
        tableData[effect] = [];
      }

      const row = {
        effect,
        dataset: namespace,
      };

      const { fn, fp, tn, tp, thresholds } = meta;
      const originF1score =
        f1Score[namespace][effect + '_f1_score'].meta.f1_scores;
      const f1score = [];
      const arr0 = [];
      const arr1 = [];
      const arr2 = [];
      const arr3 = [];
      let step = 0;
      let i = thresholds.length - 1;
      while (step <= 100) {
        const key = step / 100;
        if (thresholds[i] >= key || i === 0) {
          const _fn = fn[i];
          const _fp = fp[i];
          const _tn = tn[i];
          const _tp = tp[i];
          f1score.push([key, originF1score[i]]);
          arr0.push([
            key,
            `${_tn}(${((_tn / sum(_fn, _fp, _tn, _tp)) * 100).toFixed(4)}%)`,
          ]);
          arr1.push([
            key,
            `${_fp}(${((_fp / sum(_fn, _fp, _tn, _tp)) * 100).toFixed(4)}%)`,
          ]);
          arr2.push([
            key,
            `${_fn}(${((_fn / sum(_fn, _fp, _tn, _tp)) * 100).toFixed(4)}%)`,
          ]);
          arr3.push([
            key,
            `${_tp}(${((_tp / sum(_fn, _fp, _tn, _tp)) * 100).toFixed(4)}%)`,
          ]);
        } else {
          i -= 1;
          continue;
        }
        step += 1;
      }

      tableData.push(
        Object.assign(
          {
            labels: '0',
            0: arr0,
            1: arr1,
            f1score,
          },
          row,
        ),
      );

      tableData.push(
        Object.assign(
          {
            labels: 1,
            0: arr2,
            1: arr3,
            f1score,
          },
          row,
        ),
      );
    });
  });

  const form = {
    type: 'form',
    props: {
      form: [
        {
          type: 'title',
          props: {
            title: '混淆矩阵',
          },
        },
        {
          type: 'f-range',
          props: {
            label: '分类阈值',
            max: 1,
            min: 0,
            step: 0.01,
            value: 0.5,
            tip: '更新新阈值条件下的混淆矩阵信息',
          },
        },
      ],
    },
  };

  const table = {
    type: 'table',
    props: {
      header,
      data: tableData,
      pageSize: 'all',
      zeroFormat: '0',
      export: 'confusion_matrix',
    },
  };

  const group = [form, table];

  return group;
}

export default handler;
