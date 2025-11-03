const dataIns = [
  {
    name: 'dataio',
    belong: ['vertical'],
    category: 'dataIn',
    description: '',
    attrs: [
      { name: 'with_label', default: false, type: 'switch' },
      { name: 'label_name', default: 'y', type: 'input' },
      { name: 'label_type', default: 'int', type: 'input' },
      { name: 'output_format', default: 'dense', type: 'input' },
      { name: 'missing_fill', default: true, type: 'switch' },
      { name: 'outlier_replace', default: true, type: 'switch' },
    ],
  },
];

const featureEngineerings = [
  {
    name: 'hetero_scaling',
    belong: ['vertical'],
    category: 'feature_engineering',
    description: '',
    attrs: [
      {
        name: 'process_list',
        label: '特征列表',
        placeholder: `ALL`,
        default: 'ALL',
        type: 'input',
      },
      {
        name: 'scaling_method',
        label: '缩放规则',
        default: 'normalization',
        type: 'select',
        options: [
          { value: 'normalization', label: '归一化' },
          { value: 'standardization', label: '标准化' },
        ],
      },
    ],
  },
];

const algorithms = [
  {
    name: 'intersect_0',
    belong: ['vertical'],
    category: 'algorithm',
    description: '',
    attrs: [
      { name: 'intersect_method', default: 'rsa', type: 'input' },
      { name: 'sync_intersect_ids', default: true, type: 'switch' },
      { name: 'only_output_key', default: false, type: 'switch' },
    ],
  },
  {
    name: 'evaluation_0',
    belong: ['vertical'],
    category: 'algorithm',
    description: '',
    attrs: [{ name: 'eval_type', default: 'binary', type: 'input' }],
  },
  {
    name: 'secureboost_0',
    belong: ['vertical'],
    category: 'algorithm',
    description: '',
    attrs: [
      { name: 'task_type', default: 'classification', type: 'input' },
      { name: 'learning_rate', default: 0.1, type: 'input' },
      { name: 'num_trees', default: 5, type: 'input' },
      { name: 'subsample_feature_rate', default: 1, type: 'input' },
      { name: 'n_iter_no_change', default: false, type: 'switch' },
      { name: 'tol', default: 0.0001, type: 'input' },
      { name: 'bin_num', default: 50, type: 'input' },
      {
        name: 'objective_param',
        default: JSON.stringify({
          objective: 'cross_entropy',
        }),
        type: 'textarea',
      },
      {
        name: 'encrypt_param',
        default: JSON.stringify({
          method: 'paillier',
        }),
        type: 'textarea',
      },
      {
        name: 'predict_param',
        default: JSON.stringify({
          threshold: 0.5,
        }),
        type: 'textarea',
      },
      {
        name: 'cv_param',
        default: JSON.stringify({
          n_splits: 5,
          shuffle: false,
          random_seed: 103,
          need_cv: false,
        }),
        type: 'textarea',
      },
      { name: 'validation_freqs', default: 1, type: 'input' },
    ],
  },
  {
    name: 'hetero_lr_0',
    belong: ['vertical'],
    category: 'algorithm',
    description: '',
    attrs: [
      { name: 'penalty', default: 'L2', type: 'input' },
      {
        name: 'optimizer',
        default: 'nesterov_momentum_sgd',
        type: 'input',
      },
      { name: 'tol', default: 0.0001, type: 'input' },
      { name: 'alpha', default: 0.01, type: 'input' },
      { name: 'max_iter', default: 30, type: 'input' },
      { name: 'early_stop', default: 'weight_diff', type: 'input' },
      { name: 'batch_size', default: -1, type: 'input' },
      { name: 'learning_rate', default: 0.15, type: 'input' },
      {
        name: 'init_param',
        default: JSON.stringify({
          init_method: 'random_uniform',
        }),
        type: 'textarea',
      },
      {
        name: 'sqn_param',
        default: JSON.stringify({
          update_interval_L: 3,
          memory_M: 5,
          sample_size: 5000,
          random_seed: null,
        }),
        type: 'textarea',
      },
      {
        name: 'cv_param',
        default: JSON.stringify({
          n_splits: 5,
          shuffle: false,
          random_seed: 103,
          need_cv: false,
        }),
        type: 'textarea',
      },
    ],
  },
];

const evaluations = [
  {
    name: 'evaluation',
    belong: ['vertical'],
    category: 'evaluation',
    description: '',
    attrs: [{ name: 'need_run', default: false, type: 'switch' }],
  },
];

export default class Operator {
  static get dict() {
    return {
      dataIn: '数据接入',
      data_statistic: '数据统计',
      feature_engineering: '特征工程',
      algorithm: '算法',
      evaluation: '评估',
      hetero_data_split: '数据拆分'
    };
  }

  static #data = [
    ...dataIns,
    ...featureEngineerings,
    ...algorithms,
    ...evaluations,
  ];

  static categories(belong) {
    const operators = this.#data.filter((item) => item.belong.includes(belong));
    const res = operators.reduce((result, current) => {
      if (!result.find((item) => item.key === current.category)) {
        result.push({
          name: this.dict[current.category],
          key: current.category,
          operators: [],
        });
      }
      result
        .find((item) => item.key === current.category)
        .operators.push(current);
      return result;
    }, []);

    return res;
  }

  static get(name) {
    const target = this.#data.find((item) => item.name === name);
    return target || {};
  }
}
