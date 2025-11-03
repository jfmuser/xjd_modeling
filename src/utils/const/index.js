import _ from 'lodash';

export class ProtocolType {
  static #data = [
    { value: 'http://', label: 'http' },
    { value: 'https://', label: 'https' },
  ];

  static options() {
    return ProtocolType.#data;
  }

  static getLabel(value) {
    return ProtocolType.#data.find((item) => item.value === value).label;
  }
}

export class ActiveStatus {
  static #data = [
    {
      value: 1,
      label: '未激活',
      canEdit: true,
      canReactive: false,
      canDelete: true,
    },
    {
      value: 2,
      label: '已激活',
      canEdit: false,
      canReactive: true,
      canDelete: true,
    },
    // FIXME
    {
      value: 20,
      label: '已激活',
      canEdit: false,
      canReactive: false,
      canDelete: false,
    },
  ];

  static get options() {
    return ActiveStatus.#data;
  }

  static getLabel(value) {
    if (_.isNil(value)) {
      return '';
    }
    return ActiveStatus.#data.find((item) => item.value === value).label;
  }

  static get(value) {
    if (_.isNil(value)) {
      return {};
    }
    return ActiveStatus.#data.find((item) => item.value === value);
  }
}

export class CertificateStatus {
  static #data = [
    { value: 'Valid', label: '有效的' },
    { value: 'Invalid', label: '无效的' },
    { value: 'Revoked', label: '被撤销' },
    { value: 'Unpublished', label: '未发布' },
  ];

  static options() {
    return CertificateStatus.#data;
  }

  static getLabel(value) {
    return CertificateStatus.#data.find((item) => item.value === value).label;
  }
}

export class SiteRole {
  static #data = [
    { value: 1, text: '应用方' },
    { value: 2, text: '数据源' },
  ];

  static get options() {
    return SiteRole.#data;
  }

  static getText(value) {
    return SiteRole.#data.find((item) => item.value === value).text;
  }
}

export class SiteStatus {
  static #data = [
    { value: 1, text: '未加入' },
    { value: 2, text: '已加入' },
    { value: 3, text: '已删除' },
  ];

  static get options() {
    return SiteStatus.#data;
  }

  static getText(value) {
    return SiteStatus.#data.find((item) => item.value === value).text;
  }
}

export class AuthorityStatus {
  static APPLY = 1;
  static AGREE = 2;
  static REJECT = 3;
  static CANCEL = 4;
}

export class InstitutionStatus {
  static USING = 2;
  static DELETED = 3;
  static #data = [
    { value: InstitutionStatus.USING, label: '使用中组织' },
    { value: InstitutionStatus.DELETED, label: '历史组织' },
  ];

  static get options() {
    return InstitutionStatus.#data;
  }
}

export function YES_NO(val) {
  return val === YES_NO.YES ? '是' : '否';
}

YES_NO.YES = 1;
YES_NO.NO = 2;
YES_NO.options = [
  { label: '是', value: YES_NO.YES },
  { label: '否', value: YES_NO.NO },
];

export function LOG_DEAL_STATUS(val) {
  // TODO chinese label
  switch (val) {
    case LOG_DEAL_STATUS.NO_DEAL:
      return 'no deal';
    case LOG_DEAL_STATUS.AGREED:
      return 'agreed';
    case LOG_DEAL_STATUS.REJECTED:
      return 'rejected';
    default:
      return 'unknown';
  }
}

LOG_DEAL_STATUS.NO_DEAL = 0;
LOG_DEAL_STATUS.AGREED = 1;
LOG_DEAL_STATUS.REJECTED = 2;

export const ROLE_TYPE = {
  管理员: 1,
  开发或运维: 2,
  市场人员或数据分析师: 3,
};

export const TASK_LEGEND = [
  {
    label: '等待中',
    name: 'waiting',
    type: 'warning',
  },
  {
    label: '运行中',
    name: 'running',
    type: 'info',
  },
  {
    label: '成功',
    name: 'success',
    type: 'success',
  },
  {
    label: '失败',
    name: 'failed',
    type: 'danger',
  },
];

export const MONITOR_TYPE = {
  交集任务: 'intersect',
  建模任务: 'modeling',
  上传任务: 'upload',
  下载任务: 'download',
};

export class AuthorizationDescription {
  static #data = [
    { value: '1', label: '同时支持纵向及横向联邦' },
    { value: '2', label: '仅支持横向联邦' },
    { value: '3', label: '仅支持纵向联邦' },
  ];

  static get options() {
    return AuthorizationDescription.#data;
  }
}

export const SWITCH_STATUS = {
  on: 1,
  off: 2,
};
export const FUNCTION_NAME = {
  'Site-Authorization': '功能授权',
  'Auto-Deploy': '自动化部署及部门升级',
};

/**
 * 0 wait activated, 1 publised, 2 modified, 3 to be deleted
 */
export const PARTY_STATUS = {
  unactivated: '未激活',
  published: '已发布',
  unpublished: '未发布',
  toDeleted: '待删除',
  0: '未激活',
  1: '已发布',
  2: '未发布',
  3: '待删除',
  未激活: 0,
  已发布: 1,
  未发布: 2,
  待删除: 3,
};

export class FormType {
  static CREATE = '添加';
  static EDIT = '编辑';
  static READ = '查看';
  static IMPORT = '导入';
  static BIND = '绑定';
  static PUBLISH = '发布';

  type = null;

  constructor(type = FormType.READ) {
    this.type = type;
  }

  edit() {
    this.type = FormType.EDIT;
  }

  read() {
    this.type = FormType.READ;
  }

  create() {
    this.type = FormType.CREATE;
  }

  import() {
    this.type = FormType.IMPORT;
  }

  bind() {
    this.type = FormType.BIND;
  }

  get label() {
    return this.type;
  }

  get isEdit() {
    return this.type === FormType.EDIT;
  }

  get isCreate() {
    return this.type === FormType.CREATE;
  }

  get isRead() {
    return this.type === FormType.READ;
  }

  get isImport() {
    return this.type === FormType.IMPORT;
  }

  get isBind() {
    return this.type === FormType.BIND;
  }
}

export const SITE_STATUS = {
  NOT_JOINED: 1,
  JOINED: 2,
  REMOVED: 3,
};

export class MessageStatus {
  static TODO = 1;
  static AGREED = 2;
  static REFUSE = 3;

  static canStored(val) {
    return MessageStatus.TODO === val;
  }

  static get options() {
    return [
      { value: MessageStatus.AGREED, label: '已同意' },
      { value: MessageStatus.REFUSE, label: '已拒绝' },
      { value: MessageStatus.TODO, label: '待处理' },
    ];
  }

  static getLabel(val) {
    const target = MessageStatus.options.find((item) => item.value === val);

    if (target) {
      return target.label;
    }
    return '';
  }
}

export class MessageReadStatus {
  static UNREAD = 1;
  static HAVE_READ = 2;

  static canRead(val) {
    return MessageReadStatus.UNREAD === val;
  }

  static get options() {
    return [
      { value: MessageReadStatus.UNREAD, label: '未读' },
      { value: MessageReadStatus.HAVE_READ, label: '已读' },
    ];
  }

  static getLabel(val) {
    const target = MessageReadStatus.options.find((item) => item.value === val);

    if (target) {
      return target.label;
    }
    return '';
  }
}

export class ApprovalStatus {
  static TODO = 1;
  static AGREED = 2;
  static REFUSE = 3;
  static READ_TODO = 4;

  static canEdit(val) {
    return [ApprovalStatus.READ_TODO, ApprovalStatus.TODO].includes(val);
  }

  static options(val) {
    let result = [
      { value: ApprovalStatus.TODO, label: '待处理' },
      { value: ApprovalStatus.READ_TODO, label: '已读未处理' },
      { value: ApprovalStatus.AGREED, label: '同意' },
      { value: ApprovalStatus.REFUSE, label: '拒绝' },
    ];
    // 待处理
    if (val === 1) {
      result = result.filter((item) =>
        [ApprovalStatus.TODO, ApprovalStatus.READ_TODO].includes(item.value),
      );
    } else if (val === 2) {
      result = result.filter((item) =>
        [ApprovalStatus.AGREED, ApprovalStatus.REFUSE].includes(item.value),
      );
    }
    return result;
  }

  static getLabel(val) {
    const target = ApprovalStatus.options().find((item) => item.value === val);

    if (target) {
      return target.label;
    }
    return '';
  }
}

export class MessageTopic {
  static OTHER = 0;
  static PROJECT = 1;
  static DATA = 2;
  static ALGORITHM = 3;

  static get options() {
    return [
      { value: MessageTopic.OTHER, label: '其他' },
      { value: MessageTopic.PROJECT, label: '项目' },
      { value: MessageTopic.DATA, label: '数据' },
      { value: MessageTopic.ALGORITHM, label: '算法' },
    ];
  }

  static getLabel(val) {
    const target = MessageTopic.options.find((item) => item.value === val);

    if (target) {
      return target.label;
    }
    return '';
  }
}

export class MessageType {
  static OTHER = 0;
  static PUBLISH = 1;
  static APPROVAL = 2;

  static get options() {
    return [
      { value: MessageType.OTHER, label: '未知' },
      { value: MessageType.PUBLISH, label: '发布' },
      { value: MessageType.APPROVAL, label: '审批' },
    ];
  }

  static getLabel(val) {
    const target = MessageType.options.find((item) => item.value === val);

    if (target) {
      return target.label;
    }
    return '';
  }
}

export class algAndLibType {
  static LIB = 'lib';
  static ALG = 'alg';

  static get options() {
    return [
      { value: algAndLibType.ALG, label: '算法' },
      { value: algAndLibType.LIB, label: '算法库' },
    ];
  }

  static getLabel(val) {
    const target = algAndLibType.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }

  static isLib(val) {
    return algAndLibType.LIB === val;
  }
}

export class AlgorithmLibPublishType {
  static IN_EFFECT = 2;
  static PUBLISHED = 1;
  static UNPUBLISH = 0;

  static get options() {
    return [
      // { value: AlgorithmLibPublishType.IN_EFFECT, label: '生效中' },
      { value: AlgorithmLibPublishType.PUBLISHED, label: '生效中' },
      { value: AlgorithmLibPublishType.UNPUBLISH, label: '未生效' },
    ];
  }

  static getLabel(val) {
    const target = AlgorithmLibPublishType.options.find(
      (item) => item.value === val,
    );
    if (target) {
      return target.label;
    }
    return '';
  }

  static canEdit(val) {
    return AlgorithmLibPublishType.UNPUBLISH === val;
  }

  static canDel(val) {
    return AlgorithmLibPublishType.PUBLISHED !== val;
  }

  static getType(val) {
    if (val === AlgorithmLibPublishType.IN_EFFECT) {
      return 'warning';
    } else if (val === AlgorithmLibPublishType.PUBLISHED) {
      return 'info';
    } else {
      return 'success';
    }
  }
}

export class AlgorithmCategory {
  static reader = 'reader';
  static data_transform = 'data_transform';
  static feature_engineering = 'feature_engineering';
  static information_retrieval = 'information_retrieval';
  static sample_intersection = 'sample_intersection';
  static federated_training = 'federated_training';
  static federated_inference = 'federated_inference';
  static hetero_data_split = 'hetero_data_split';
  static data_statistic = 'data_statistic';
  static post_quantum_cryptography = 'post_quantum_cryptography';
  static cn_securety = 'cn_securety';
  static model_eval = 'model_eval';

  static get options() {
    return [
      { value: AlgorithmCategory.reader, label: '数据读取' },
      { value: AlgorithmCategory.data_transform, label: '数据接入' },
      { value: AlgorithmCategory.hetero_data_split, label: '数据拆分' },
      { value: AlgorithmCategory.data_statistic, label: '数据统计' },
      { value: AlgorithmCategory.feature_engineering, label: '特征工程' },
      { value: AlgorithmCategory.information_retrieval, label: '信息检索' },
      { value: AlgorithmCategory.sample_intersection, label: '样本求交' },
      { value: AlgorithmCategory.federated_training, label: '联合训练' },
      { value: AlgorithmCategory.federated_inference, label: '联合推理' },
      { value: AlgorithmCategory.post_quantum_cryptography, label: '后量子加密' },
      { value: AlgorithmCategory.cn_securety, label: '国密密态加密' },
      { value: AlgorithmCategory.model_eval, label: '模型评估' },
    ];
  }

  static getLabel(val) {
    const target = AlgorithmCategory.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }
}

export class UsageStatus {
  static ON = 0;
  static OFF = 1;

  static get options() {
    return [
      { value: UsageStatus.ON, label: '启用' },
      { value: UsageStatus.OFF, label: '禁用' },
    ];
  }

  static getLabel(val) {
    const target = UsageStatus.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }
}

export class RoleCategory {
  static PLATFORM = 0;
  static DEPT = 1;
}

export class AuthCategory {
  static FRONTEND = 0;
  static BACKEND = 1;
}

// export const PERMISSION = {
//   VIEW_MANAGEMENT: 'deptManagement',
//   VIEW_APPROVAL: 'approval',
//   VIEW_USER: 'authUser',
//   VIEW_ROLE: 'authRole',
//   VIEW_COOPERATION: 'monitorCooperation',
//   VIEW_JOB_MONITOR: 'monitorJob',
//   VIEW_AUDIT_MANAGEMENT: 'auditManagement',
//   VIEW_ACTIVATE_SITE: 'activateSite',
//   VIEW_DATA: 'data',
//   VIEW_MODEL: 'model',
//   VIEW_ALGORITHM: 'algorithm',
//   VIEW_PROJECT: 'project',
//   VIEW_MESSAGE: 'message',
//   VIEW_JOB_DETAIL: 'jobDetail',
// VIEW_MONITOR: 'monitor',
// };

export class EditStatus {
  static EDITABLE = 1;
  static COMMITTABLE = 2;
  static PENDING_APPROVAL = 3;

  static getLabel(val) {
    switch (val) {
      case EditStatus.EDITABLE:
        return '可编辑';
      case EditStatus.COMMITTABLE:
        return '可提交';
      case EditStatus.PENDING_APPROVAL:
        return '待审批';
    }
  }
}

export class CollectType {
  static COLLECTED = true;
  static UNCOLLECT = false;

  static canCollect(val) {
    return CollectType.UNCOLLECT === val;
  }
}

export class SourceType {
  static SELF = '0';
  static OTHER = '1';

  static get options() {
    return [
      { value: SourceType.SELF, label: '本方' },
      { value: SourceType.OTHER, label: '非本方' },
    ];
  }

  static getLabel(val) {
    const target = SourceType.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }

  static isSelf(val) {
    return SourceType.SELF === val;
  }
}

export class DataStatus {
  static PENDING = 'pending';
  // static SUCCESS = 'success';
  static SUCCESS = 'succeeded';
  static UPLOAD_FAIL = 'fail';
  static QUERY_FAIL = 'fail';
  static UNKNOWN = 'unknown';

  static get options() {
    return [
      { value: DataStatus.PENDING, label: '处理中' },
      { value: DataStatus.SUCCESS, label: '成功' },
      { value: DataStatus.UPLOAD_FAIL, label: '失败' },
      { value: DataStatus.QUERY_FAIL, label: '失败' },
      { value: DataStatus.UNKNOWN, label: '未知' },
    ];
  }

  static getLabel(val) {
    const target = DataStatus.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }

  static canUpload(val) {
    return DataStatus.PENDING === val;
  }

  static canPublish(val) {
    return DataStatus.SUCCESS === val;
  }
}

export class Status {
  static SUCCESS = 'success';
  static SUCCEED = 'succeed';
  static SUCCEEDED = 'succeeded';
  static FAILED = 'failed';
  static RUNNING = 'running';
  static CANCELED = 'canceled';
  static WAITING = 'waiting';
  static STOPPED = 'stopped';
  static PENDING = 'pending';

  static get options() {
    return [
      { value: Status.WAITING, label: '等待中' },
      { value: Status.RUNNING, label: '运行中' },
      { value: Status.SUCCEED, label: '成功' },
      { value: Status.SUCCEEDED, label: '成功' },
      { value: Status.SUCCESS, label: '成功' },
      { value: Status.FAILED, label: '失败' },
      { value: Status.CANCELED, label: '取消' },
      { value: Status.STOPPED, label: '停止' },
      { value: Status.PENDING, label: '等待中' },
    ];
  }

  static getLabel(val) {
    const target = Status.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }

  static isRunning(val) {
    return [undefined, Status.WAITING, Status.RUNNING, Status.PENDING].includes(val);
  }
}

export class FieldType {
  static INTEGER = 'Integer';
  static DOUBLE = 'Double';
  static STRING = 'String';

  static get options() {
    return [
      { value: FieldType.INTEGER, label: 'Integer' },
      { value: FieldType.DOUBLE, label: 'Double' },
      { value: FieldType.STRING, label: 'String' },
    ];
  }
}

export class JobType {
  static TRAIN = 'train';
  static PREDICT = 'predict';

  static get options() {
    return [
      { value: JobType.TRAIN, label: '训练' },
      { value: JobType.PREDICT, label: '预测' },
    ];
  }

  static getLabel(val) {
    const target = JobType.options.find((item) => item.value === val);
    if (target) {
      return target.label;
    }
    return '';
  }
}

export const DEFAULT_NETWORK = '127.0.0.1:8080';
