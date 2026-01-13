<template>
  <el-drawer
    :model-value="true"
    :direction="direction"
    :before-close="handleClose"
    :size="500"
    custom-class="custom-drawer"
  >
    <template #title>
      <!-- 在没有中文翻译的情况下展示英文 -->
      <div class="title">
        {{
          (currentI18n && currentI18n[props.operator.name]) ??
          props.operator.name
        }}
      </div>
    </template>

    <template #default>
      <div>
        <span>组件类型:纵向</span>
      </div>
      <div
        v-if="props.operator?.attrs || props.operator?.inputs[0].attrs"
        style="margin-top: 20px"
      >
        <el-form label-width="150px">
          <el-form-item v-for="param in renderParam" :key="param.name">
            <template #label>
              <el-tooltip
                v-if="param.desc"
                effect="dark"
                placement="top-start"
                :content="
                  (currentI18n && currentI18n[param.desc]) ?? param.desc
                "
              >
                {{
                  param.name === 'key'
                    ? param.keyI18n
                    : (currentI18n && currentI18n[param.name]) ?? param.name
                }}
                <!-- ({{ param.name }}) -->
              </el-tooltip>
            </template>
            <el-button
              v-if="param.renderType === 'button'"
              type="info"
              @click="getSubjectInfo(param)"
              >{{
                JSON.stringify(fieldInfo) === '{}'
                  ? '未选择字段'
                  : `已选择${
                      fieldInfo[param.name]?.ss
                        ? fieldInfo[param.name].ss?.length
                        : 0
                    }个字段`
              }}</el-button
            >
            <el-select
              v-else-if="param.renderType === 'selected'"
              v-model="param.default"
              class="m-2"
              @change="changeParam(param.name, param.default)"
            >
              <el-option
                v-for="(item, i) in param.options"
                :key="item.datatableId"
                :label="item.datatableName"
                :value="item.datatableId"
              />
            </el-select>
            <el-select
              v-else-if="param.renderType === 'select'"
              v-model="param.default"
              class="m-2"
              @change="changeParam(param.name, param.default, param.keyI18n)"
            >
              <el-option
                v-for="(item, i) in param.options"
                :key="item.value"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-select
              v-else-if="param.renderType === 'selected_mult'"
              v-model="param.default"
              multiple
              class="m-2"
              @change="changeParam(param.name, param.default, param.keyI18n)"
            >
              <el-option
                v-for="(item, i) in param.options"
                :key="item.datatableId"
                :label="item.datatableName"
                :value="item.datatableId"
              />
            </el-select>
            <el-input
              v-else-if="param.renderType === 'input'"
              v-model="param.default"
              @change="changeParam(param.name, param.default)"
            />
            <el-switch
              v-else-if="param.renderType === 'switch'"
              v-model="param.default"
              @change="changeParam(param.name, param.default)"
            />
            <!-- <el-button
              @click="handleRandomNum(param)"
              v-if="param.name == 'random_state'"
              >生成随机种子数</el-button -->
          </el-form-item>
        </el-form>
      </div>
      <SetField
        v-if="isVisible"
        :projectInfo="projectInfo"
        :operatorName="props.currentGraphNodeName"
        :field="fieldInfo[specialParam.name]"
        @save="saveFieldInfo"
        @closeSetField="closeSetField"
      />
    </template>

    <template #footer>
      <div style="flex: auto">
        <el-button type="primary" @click="confirmClick">保存</el-button>
        <el-button type="primary" @click="deleteNode">删除</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { onBeforeMount, ref, computed, watch, nextTick } from 'vue';
import useSecretflowStore from '@/stores/secretflow/secretflowInfo.store.js';
import {
  getProject,
  updateGraphNode,
} from '@/apis/secretflow/secretflow.api.js';
import SetField from '@/components/secretflow/SetField.vue';
import dictionary from '../../utils/dictionary';
import PZarithmetic from '../../utils/PZarithmetic';
import { convertToNumberIfNeeded } from '../../utils';

const secretflowStore = useSecretflowStore();
const emit = defineEmits(['close']);

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
  operator: {
    type: Object,
    required: true,
  },
  graphInfo: {
    type: Object,
    required: true,
  },
  PrivacyExchangeData: {
    type: Object,
    default: { nodeList: [] },
  },
  currentGraphNodeName: {
    type: String,
    required: true,
  },
  currentNode: {
    type: Object,
    default: {},
  },
  graph: {
    type: Object,
    default: {},
  },
});
console.log({ operator: props.operator });
watch(
  () => props.graphInfo,
  (newVal) => {
    graphInfo.value = newVal;
  },
);

const graphInfo = ref(props.graphInfo);
const paramObj = computed(() => {
  return JSON.parse(localStorage.getItem('projectParams')) ?? {};
});

const renderParam = ref([]);
const projectInfo = ref(null);
const fieldInfo = ref({});
const isVisible = ref(false);
const specialParam = ref('');
const currentI18n = computed(() => {
  const keys = secretflowStore.i18n ? Object.keys(secretflowStore.i18n) : [];
  const key =
    keys.find((key) =>
      key.includes(
        props.operator.name
          .replace('_v1', '')
          .replace('_v2', '')
          .replace('_v3', ''),
      ),
    ) ??
    keys.find((key) =>
      key.includes(dictionary.algorithm_En[props.operator.name]),
    );

  return secretflowStore.i18n[key] ?? {};
});

onBeforeMount(async () => {
  await initParam();
  setDrawerMaskTransparent();
  console.log({
    paramObj: paramObj.value,
    currentGraphNodeName: props.currentGraphNodeName,
  });
  if (!paramObj.value || !paramObj.value[props.currentGraphNodeName]) return;
  backflowParam();
  console.log(renderParam, 'props.currentGraphNodeName');
});

/**
 * @description 获取设置的字段信息
 */
async function getSubjectInfo(param) {
  console.log(param);
  specialParam.value = param;
  fieldInfo.value[param.name] = fieldInfo.value[param.name]
    ? fieldInfo.value[param.name]
    : {};
  console.log(fieldInfo.value[param.name], 'fieldInfo.value[param.name]');
  isVisible.value = true;
}

function closeSetField() {
  isVisible.value = false;
}

/**
 * @description 保存
 */
async function confirmClick() {
  let attrs = [];
  const attrPaths = [];

  // 为一些特殊的算子单独适配
  renderParam.value.forEach((param, i) => {
    if (!param.name || param === false) return;
    // if (param.name === 'join_type') return
    console.log(param, JSON.stringify(fieldInfo.value), 'PPPARAM');
    console.log(typeof param.default === 'string');
    if (fieldInfo.value[param.name]) attrs.push(fieldInfo.value[param.name]);

    // if (param.name === 'key' && !attrPaths.includes('input/input_table_1/key')) {
    //     attrPaths.push(`input/input_table_1/key`)
    // } else if (param.name === 'key' && !attrPaths.includes('input/input_table_2/key')) {
    //     attrPaths.push('input/input_table_2/key')
    // }
    if (param?.keyI18n?.includes('表')) {
      const tableNumber = param.keyI18n[param.keyI18n.length - 1];

      // 检查是否存在 input_ds3，以确定是哪种类型的算子
      const hasInputDs3 =
        props.PrivacyExchangeData &&
        (props.PrivacyExchangeData['input_ds3'] ||
          props.operator.inputs?.some((input) => input.name === 'input_ds3'));

      if (hasInputDs3) {
        // 对于 input_ds1-input_ds3 的算子
        attrPaths.push(`input/input_ds${tableNumber}/keys${tableNumber}`);
      } else {
        // 对于 input_ds1-input_ds2 的算子
        attrPaths.push(`input/input_ds${tableNumber}/keys`);
      }
    } else if (
      param.name === 'key' &&
      !attrPaths.includes('input/input_ds1/keys')
    ) {
      attrPaths.push('input/input_ds1/keys');
    } else if (
      param.name === 'key' &&
      !attrPaths.includes('input/input_ds2/keys')
    ) {
      attrPaths.push('input/input_ds2/keys');
    } else if (
      param.name === 'index_feature' ||
      param.name === 'uniqueness_features' ||
      param.name === 'allow_empty_features' ||
      param.name === 'label_feature'
    ) {
      attrPaths.push(
        param.renderType == 'input'
          ? param.name
          : `input/input_table/${param.name}`,
      );
    } else if (param.name === 'feature_selects') {
      attrPaths.push(`input/${param.attrPathName}/feature_selects`);
    } else if (param.name === 'feature_names') {
      attrPaths.push(`input/${param.attrPathName}/feature_names`);
    } else if (
      param.name === 'features_flag' ||
      param.name === 'features_encoder'
    ) {
      attrPaths.push(`input/${param.attrPathName}/${param.name}`);
    } else if (
      param.name === 'col' &&
      !attrPaths.includes('input/labels/col')
    ) {
      attrPaths.push('input/labels/col');
    } else if (
      param.name === 'col' &&
      !attrPaths.includes('input/predictions/col')
    ) {
      attrPaths.push('input/predictions/col');
    } else if (param.name === 'label') {
      attrPaths.push(`input/${param.attrPathName}/label`);
    } else if (param.name === 'prediction') {
      attrPaths.push(`input/${param.attrPathName}/prediction`);
    } else if (param.name === 'features_encoder') {
      attrPaths.push(`input/${param.attrPathName}/features_encoder`);
    } else if (param.name === 'f1' || param.name === 'f2') {
      attrPaths.push(`input/${param.attrPathName}/${param.name}`);
    } else if (param.name === 'features') {
      attrPaths.push(`input/${param.attrPathName}/features`);
    } else if (param.name === 'feature') {
      attrPaths.push(`input/input_table/${param.name}`);
    } else if (param.name === 'column') {
      attrPaths.push('input/input_table/column');
    } else if (param.name === 'skip_duplicates_check') {
      attrPaths.push('allow_duplicate_keys/no/skip_duplicates_check');
    } else if (param.name === 'saved_features') {
      attrPaths.push('input/input_ds/saved_features');
    } else if (param.name === 'offset') {
      attrPaths.push('input/input_ds/offset');
    } else if (param.name === 'weight') {
      attrPaths.push('input/input_ds/weight');
    } else if (
      param.name === 'receiver_parties' &&
      param.renderType == 'selected_mult'
    ) {
      attrPaths.push('receiver_parties');
    } else if (param.name === 'receiver_parties') {
      attrPaths.push('allow_duplicate_keys/no/receiver_parties');
    } else if (
      param.name === 'frac' ||
      (param.name === 'random_state' &&
        typeof renderParam.value[0].default == 'string') ||
      param.name === 'observe_feature' ||
      param.name === 'replacements' ||
      param.name === 'quantiles' ||
      param.name === 'weights'
    ) {
      attrPaths.push(
        `${renderParam.value[0].name}/${renderParam.value[0].default}/${param.name}`,
      );
    } else if (param.name === 'label_name') {
      attrPaths.push(
        param.renderType == 'input'
          ? 'label_name'
          : `input/${param.attrPathName}/label_name`,
      );
    } else if (param.name === 'drop_features') {
      attrPaths.push('input/input_ds/drop_features');
    } else {
      attrPaths.push(param.name);
    }
    param.default = param.default === '' ? null : param.default;

    console.log(param.type, 'param.type');

    switch (param.type) {
      case 'AT_INT':
        if (param.name === 'fill_value_int') {
          attrs.push({
            is_na: false,
          });
          break;
        }
        attrs.push({
          i64: Number(param.default),
          is_na: false,
        });
        break;
      case 'AT_FLOAT':
        attrs.push({
          f: convertToNumberIfNeeded(param.default),
          is_na: false,
        });
        break;
      case 'AT_STRING':
        attrs.push({
          s: param.default,
          is_na: false,
        });
        break;
      case 'AT_BOOL':
        attrs.push({
          b: param.default,
          is_na: false,
        });
        break;
      case 'Exchange':
        if (fieldInfo.value[param.name]) break;
        console.log(param.default, 'initParam');
        attrs.push({
          ss: param.default === null ? [] : [param.default],
          is_na: false,
        });
        break;
      case 'AT_PARTY':
        attrs[i] = {
          ss:
            typeof param.default === 'object' ? param.default : [param.default],
          is_na: false,
        };
        break;
      case 'AT_UNION_GROUP':
        attrs.push({
          s: param.default,
          is_na: false,
        });
        break;
      case 'AT_FLOATS':
        if (param.default == null) {
          attrs.push({
            fs: [],
            is_na: false,
          });
        } else {
          attrs.push({
            fs: [Number(param.default)],
            is_na: false,
          });
        }
        break;
      case 'AT_BOOLS':
        attrs.push({
          bs: [param.default, param.default],
          is_na: false,
        });
        break;
      case 'AT_INTS':
        console.log(param.default, 'param.default');
        let intValues;
        if (Array.isArray(param.default)) {
          // 如果已经是数组，检查是否需要进一步处理
          intValues = param.default.flatMap((item) =>
            typeof item === 'string' && item.includes(',')
              ? item
                  .split(',')
                  .map(Number)
                  .filter((num) => !isNaN(num))
              : [typeof item === 'string' ? Number(item) : item],
          );
        } else if (typeof param.default === 'string') {
          // 如果是字符串，分割并转换
          intValues = param.default
            .split(',')
            .map(Number)
            .filter((num) => !isNaN(num));
        } else {
          // 其他情况，保持原值
          intValues = Array.isArray(param.default)
            ? param.default
            : [param.default];
        }
        attrs.push({
          i64s: intValues,
          is_na: false,
        });
        break;
      default:
        if (param.name === 'allow_duplicate_keys') {
          attrs.push({
            s: param.default,
            is_na: false,
          });
          return;
        }
        // if (param.name === 'receiver') {
        //     attrs.push({
        //         ss: [param.default],
        //         is_na: false
        //     })
        // }

        if (fieldInfo.value[param.name]) break;
        attrs.push({
          ss:
            param.default === null || param.default === undefined
              ? []
              : [param.default],
          is_na: false,
        });
    }
  });
  console.log(renderParam, 'RENDER');
  const currentNode = graphInfo.value.nodes.find(
    (item) => item.label === props.currentGraphNodeName,
  );
  console.log(attrs);

  currentNode.nodeDef['attrs'] = attrs;
  currentNode.nodeDef['attrPaths'] = attrPaths;
  console.log(currentNode, 'currentNode');
  await updateGraphNode({
    projectId: props.info.projectId,
    isFinished: true,
    graphId: props.info.graphId,
    node: currentNode,
  });
  const dom = Array.from(
    document.querySelectorAll('.graph-area .graph-node-wrapper'),
  ).find((dom) => dom.innerText === props.currentGraphNodeName);
  dom.style.borderBottom = '6px solid #2a50ec';
  paramObj.value[props.currentGraphNodeName] = attrs;
  localStorage.setItem('projectParams', JSON.stringify(paramObj.value));
  handleClose();
}

async function changeParam(name, val, keyI18n) {
  if (name === 'sample_algorithm' && val === 'system') {
    renderParam.value = PZarithmetic.sample_system;
    renderParam.value[0].default = val;
    return;
  } else if (name === 'sample_algorithm' && val === 'random') {
    renderParam.value = PZarithmetic.sample_random;
    renderParam.value[0].default = val;
    return;
  } else if (name === 'sample_algorithm' && val === 'stratify') {
    renderParam.value = PZarithmetic.sample_stratify;
    renderParam.value[0].default = val;
    return;
  }
  renderParam.value.forEach((item) => {
    if (keyI18n && item.keyI18n === keyI18n) {
      // 专门针对隐私求交做出的特殊处理
      item.default = val;
    } else if (!keyI18n && item.name === name) {
      item.default = val;
    }
  });
}

// 初始化参数
async function initParam() {
  try {
    if (!projectInfo.value)
      projectInfo.value = await getProject({ projectId: props.info.projectId });
    console.log(props.operator, 'props.operator');
    //采样比较特殊，定制化参数
    if (props.operator.name === 'sample') {
      renderParam.value = PZarithmetic.sample_random;
      return;
    }

    // 处理inputs里面的attrs
    props.operator.inputs?.forEach((item, i) => {
      console.log(item, '3333111');
      if (!item.attrs) return;
      // 情况实在太多，处理起来相当麻烦
      if (item.attrs[0].name === 'col') {
        renderParam.value.push({
          name: item.attrs[0].name,
          desc: item.attrs[0].desc,
          default: '',
          renderType: 'input',
          type: 'Exchange',
        });
        return;
      } else if (
        item.attrs[0].name === 'feature_selects' ||
        item.attrs[0].name === 'label' ||
        item.attrs[0].name === 'f1' ||
        item.attrs[0].name === 'index_feature' ||
        item.attrs[0].name === 'feature_names'
      ) {
        renderParam.value.push({
          name: item.attrs[0].name,
          desc: item.attrs[0].desc,
          renderType: 'button',
          default: '',
          type: '',
          attrPathName: item.name,
        });
        if (item.attrs[1]) {
          renderParam.value.push({
            name: item.attrs[1].name,
            desc: item.attrs[1].desc,
            renderType: 'button',
            default: '',
            type: '',
            attrPathName: item.name,
          });
        }
        if (item.attrs[2]) {
          renderParam.value.push({
            name: item.attrs[2].name,
            desc: item.attrs[2].desc,
            renderType: 'button',
            default: '',
            type: '',
            attrPathName: item.name,
          });
        }
        if (item.attrs[3]) {
          renderParam.value.push({
            name: item.attrs[3].name,
            desc: item.attrs[3].desc,
            renderType: 'button',
            default: '',
            type: '',
            attrPathName: item.name,
          });
        }
        return;
      } else if (item.attrs[0].name === 'features') {
        renderParam.value.push({
          name: item.attrs[0].name,
          desc: item.attrs[0].desc,
          renderType: 'button',
          default: '',
          type: '',
          attrPathName: item.name,
        });
        if (item.attrs[1]) {
          renderParam.value.push({
            name: item.attrs[1].name,
            desc: item.attrs[1].desc,
            renderType: 'button',
            default: '',
            type: '',
            attrPathName: item.name,
          });
        }
        if (item.attrs[2]) {
          renderParam.value.push({
            name: item.attrs[2].name,
            desc: item.attrs[2].desc,
            renderType: 'button',
            default: '',
            type: '',
            attrPathName: item.name,
          });
        }
        return;
      } else if (
        item.name === 'input_ds1' ||
        item.name === 'input_ds2' ||
        item.name === 'input_ds3'
      ) {
        console.log(
          props.PrivacyExchangeData,
          'props.PrivacyExchangeDataprops.PrivacyExchangeData',
        );
        const receiverInputData = props.PrivacyExchangeData['input_ds1']?.map(
          (item) => item.colName,
        );

        const senderInputData = props.PrivacyExchangeData['input_ds2']?.map(
          (item) => item.colName,
        );
        const thirdPartyInputData = props.PrivacyExchangeData['input_ds3']?.map(
          (item) => item.colName,
        );
        console.log({ PrivacyExchangeData: props.PrivacyExchangeData });
        let optionsData = [];
        let keyI18nText = '';

        if (item.name === 'input_ds1') {
          optionsData = receiverInputData;
          keyI18nText = '表1';
        } else if (item.name === 'input_ds2') {
          optionsData = senderInputData;
          keyI18nText = '表2';
        } else if (item.name === 'input_ds3') {
          optionsData = thirdPartyInputData;
          keyI18nText = '表3';
        }

        renderParam.value.push({
          name: `key`,
          desc: item.attrs[0].desc,
          options: optionsData,
          default: '',
          keyI18n: keyI18nText,
          renderType: 'select',
          type: 'Exchange',
        });
        return;
      } else if (item.name === 'receiver' || item.name === 'sender') {
        const receiverInputData = props.PrivacyExchangeData['receiver']?.map(
          (item) => item.colName,
        );

        const senderInputData = props.PrivacyExchangeData['sender']?.map(
          (item) => item.colName,
        );
        renderParam.value.push({
          name: `key`,
          desc: item.attrs[0].desc,
          options:
            item.name === 'receiver' ? receiverInputData : senderInputData,
          default: '',
          keyI18n: item.name === 'receiver' ? '接收方的输入:' : '发送方的输入:',
          renderType: 'select',
          type: 'Exchange',
        });
        return;
      }
      console.log(item.attrs[0].name, 'item.attrs[0].name');
      renderParam.value.push({
        name: item.attrs[0].name,
        desc: item.attrs[0].desc,
        keyI18n: i === 0 ? '接收方的输入:' : '发送方的输入:',
        renderType: item.attrs[0].name === 'key' ? 'select' : 'button',
        type: item.attrs[0].name === 'key' ? 'Exchange' : '',
      });
    });

    if (!props.operator.attrs) return;
    const prefixesParamList = [];
    // 处理自身的attrs
    const arr = props.operator.attrs.map((item) => {
      if (item.prefixes) {
        prefixesParamList.push(item);
        return false;
      }
      // if (item.name === 'check_hash_digest' || item.name === 'join_type') return false
      if (item.name === 'check_hash_digest') return false;
      if (item.atomic?.allowed_values) {
        return {
          name: item.name,
          options: item.atomic.allowed_values.ss,
          default: item.atomic.default_value?.s,
          desc: item.desc,
          renderType: 'select',
          type: item.type,
        };
      } else if (item.type === 'AT_BOOL') {
        return {
          name: item.name,
          default: item.atomic.default_value?.b ?? false,
          desc: item.desc,
          renderType: 'switch',
          type: item.type,
        };
      } else if (item.type === 'AT_UNION_GROUP') {
        return {
          name: item.name,
          options: ['no', 'yes'],
          default: item.union.default_selection,
          desc: item.desc,
          renderType: 'select',
          type: item.type,
        };
      } else if (item.name === 'receiver') {
        let options = [];
        const psiNode = props.graphInfo.nodes.find((node) =>
          node.codeName.includes('psi'),
        );
        if (psiNode) {
          console.log(
            props.PrivacyExchangeData['nodeList'],
            'props.PrivacyExchangeData',
          );
          if (props.PrivacyExchangeData['nodeList'].length > 0) {
            props.PrivacyExchangeData['nodeList'].forEach((node) => {
              options.push({
                datatableName: node.nodeName,
                datatableId: node.nodeId,
              });
            });
          }
        }

        return {
          name: item.name,
          renderType: 'selected',
          desc: item.desc,
          options: options,
          default: '',
          type: item.type,
        };
      } else if (item.name === 'receiver_parties') {
        // 样本表必须选择一个数据并保存,预测的算子才能有接收方的下拉数据，所以在此保存样本表里已经被保存的节点
        // const saveNode = graphInfo.value.nodes.map(node => {
        //   if (node.codeName === 'read_data/datatable' && node.nodeDef.attrs) {
        //     return node.nodeDef.attrs[0].s
        //   }
        // })
        // if (!saveNode[0]) return { name: item.name, desc: item.desc, renderType: 'selected' }
        const options = [];
        // console.log(props.PrivacyExchangeData.value["nodeList"],'props.PrivacyExchangeData.value["nodeList"]')
        if (props.PrivacyExchangeData['nodeList'].length > 0) {
          props.PrivacyExchangeData['nodeList'].forEach((node) =>
            options.push({
              datatableName: node.nodeName,
              datatableId: node.nodeId,
            }),
          );
        }
        // projectInfo.value.nodes.forEach(item => {
        //   console.log(item, 'OOOOOOOOOOOOOOOOOOOOOOOOOOOOO');

        //   if (item.datatables?.some(datatable => saveNode.includes(datatable.datatableId))) {
        //     options.push({ datatableName: item.nodeName, datatableId: item.nodeId })
        //   }
        // })
        return {
          name: item.name,
          renderType: 'selected_mult',
          desc: item.desc,
          options: options,
          default: '',
          type: item.type,
        };
      } else {
        if (item.prefixes) return false;
        if (item.name === 'datatable_partition') return false;
        if (item.name === 'datatable_selected') {
          const options = projectInfo.value.nodes.map((node) => {
            if (!node.datatables) return [];
            return node.datatables;
          });

          return {
            name: item.name,
            renderType: 'selected',
            desc: item.desc,
            options: options.flat(),
            default: '',
            type: item.type,
          };
        }

        const defaultKey = Object.keys(item.atomic?.default_value ?? {});
        if (defaultKey.length === 0) {
          return {
            name: item.name,
            default: '',
            desc: item.desc,
            renderType: 'input',
            type: item.type,
          };
        }

        return {
          name: item.name,
          default: item.atomic.default_value[defaultKey[0]] ?? '',
          desc: item.desc,
          renderType: 'input',
          type: item.type,
        };
      }
    });
    console.log(prefixesParamList, 'prefixesParamList');
    prefixesParamList.forEach((prefixesParam) => {
      arr.forEach((param) => {
        if (
          prefixesParam.prefixes[0] == param.name &&
          prefixesParam.prefixes.length == 1
        ) {
          if (param.options[0] == 'no' && param.options[1] == 'yes') {
            param.options = [];
          }
          param.options.push(prefixesParam.name);
        }
      });
    });
    renderParam.value.push(...arr);
    // 筛选掉false
    renderParam.value = renderParam.value.filter((param) => !!param);
  } catch (error) {
    console.log(error);
  }
  console.log(renderParam.value, 'renderParam');
}

// 回写参数
function backflowParam() {
  console.log(paramObj.value);
  console.log();
  console.log(paramObj.value[props.currentGraphNodeName], renderParam);
  //根据采样的不同模式切换参数
  if (
    renderParam.value[0]?.name === 'sample_algorithm' &&
    paramObj.value[props.currentGraphNodeName][0]?.s === 'system'
  ) {
    renderParam.value = PZarithmetic.sample_system;
  } else if (
    renderParam.value[0]?.name === 'sample_algorithm' &&
    paramObj.value[props.currentGraphNodeName][0]?.s === 'stratify'
  ) {
    renderParam.value = PZarithmetic.sample_stratify;
  }

  paramObj.value[props.currentGraphNodeName].forEach((item, i) => {
    if (renderParam.value[i] === false) return;
    console.log(item, renderParam.value[i], 'DDDAAPPPPAAPPPPAAAAPPP');

    switch (renderParam.value[i].type) {
      case 'AT_INT':
        renderParam.value[i].default = item.i64;
        break;
      case 'AT_FLOAT':
        renderParam.value[i].default = item.f;
        break;
      case 'AT_STRING':
        renderParam.value[i].default = item.s;
        break;
      case 'AT_BOOL':
        renderParam.value[i].default = item.b ?? item.ss;
        break;
      case 'Exchange':
        renderParam.value[i].default = item.ss[0] ?? '';
        break;
      case 'AT_UNION_GROUP':
        renderParam.value[i].default = item.s;
        break;
      case 'AT_INTS':
        renderParam.value[i].default = item.i64s;
        break;
      default:
        renderParam.value[i].default = item.ss;
        if (typeof item.ss === 'object')
          fieldInfo.value[renderParam.value[i].name] = {
            ss: item.ss,
            is_na: false,
          };
    }
  });
}

function saveFieldInfo(data) {
  fieldInfo.value[specialParam.value.name] = { ss: data, is_na: false };
  console.log(
    fieldInfo.value[specialParam.value.name],
    specialParam.value.name,
    'HHH',
  );
  isVisible.value = false;
  specialParam.value = '';
}

function handleClose() {
  emit('close');
}

function deleteNode() {
  if (props.currentNode.id) {
    console.log(props.graph, '画布实例');
    //    获取所有连接到该节点的边
    const edges = props.graph.getConnectedEdges(props.currentNode);
    // 删除节点和所有关联边
    props.graph.removeCells([props.currentNode, ...edges]);
    handleClose();
  }
}

//JS 动态修改当前遮罩层样式
function setDrawerMaskTransparent() {
  nextTick(() => {
    const masks = document.querySelectorAll('.el-overlay');
    const drawers = document.querySelectorAll('.el-drawer');
    masks.forEach((mask) => {
      // 这里可以加判断，比如根据遮罩层是否与当前抽屉关联，或者遮罩层是否可见
      // if (mask.style.zIndex === '抽屉遮罩层zIndex') {
      mask.style.backgroundColor = 'transparent';
      // mask.style.pointerEvents = 'auto';
      mask.style.pointerEvents = 'none';
      // }
    });
    drawers.forEach((drawer) => {
      drawer.style.pointerEvents = 'auto';
    });

    const x6Svgs = document.querySelectorAll('.x6-graph-svg');
    console.log(x6Svgs, 'x6Svgx6Svg');
    x6Svgs[x6Svgs.length - 1].addEventListener('click', handleClose);
  });
}
</script>

<style lang="scss">
.title {
  color: #000;
  margin: 0 !important;
}
.custom-drawer {
  .el-drawer__header {
    margin: 0 !important;
  }
}
::deep el-drawer.rtl {
  pointer-events: auto;
}
</style>
