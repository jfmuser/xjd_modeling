<script setup>
import { reactive, computed, ref, toRaw } from 'vue';
import Operator from '../../utils/Operator';
import useOperatorStore from '../../stores/workspace/operator.store';

const operatorStore = useOperatorStore();
const modelFormRef = ref();
const props = defineProps({
  operatorType: { type: String, required: true },
  configInfo: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const checkHeteroScaling = (_rule, value, callback) => {
  if (value === '[]') {
    callback('不能输入[]');
    return;
  }
  callback();
};

const data = reactive({
  visible: false,
  currentEditForm: {},
  rules: {
    process_list: [{ validator: checkHeteroScaling, trigger: 'change' }],
  },
});

const currentOperator = computed(() => Operator.get(props.operatorType));
const category = computed(() => currentOperator.value.category);
const attrs = computed(() => currentOperator.value.attrs);
const filteredAttrs = computed(() =>
  attrs.value.filter((attr) =>
    attr.conditions
      ? attr.conditions.every((condition) =>
          condition.values.includes(data.currentEditForm[condition.key]),
        )
      : true,
  ),
);

function show() {
  data.visible = true;
}

function onClose() {
  data.visible = false;
}

async function onSaveNode() {
  await modelFormRef.value.validate();
  operatorStore.updateConfigInfo({
    [props.operatorType]: toRaw(data.currentEditForm),
  });
  onClose();
}

defineExpose({ show });
</script>

<template>
  <el-drawer v-model="data.visible" title="容器详情" :before-close="onClose">
    <el-tabs>
      <el-tab-pane label="参数配置">
        <el-form
          ref="modelFormRef"
          :model="data.currentEditForm"
          :rules="data.rules"
          label-width="120px"
        >
          <el-form-item
            v-for="{ name, label, type, placeholder, options } in filteredAttrs"
            :key="name"
            :label="label || name"
            :prop="name"
          >
            <el-input
              v-if="type === 'input'"
              v-model="data.currentEditForm[name]"
              :placeholder="placeholder"
            />

            <el-select
              v-else-if="type === 'select'"
              v-model="data.currentEditForm[name]"
            >
              <el-option
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
            <el-switch
              v-else-if="type === 'switch'"
              v-model="data.currentEditForm[name]"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
            <el-input
              v-else-if="type === 'textarea'"
              v-model="data.currentEditForm[name]"
              type="textarea"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSaveNode"> 保存 </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<style scoped></style>
