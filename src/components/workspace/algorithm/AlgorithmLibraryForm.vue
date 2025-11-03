<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { FormType, AlgorithmLibPublishType } from '../../../utils/const';
import { useRoute, useRouter } from 'vue-router';
import {
  createVersion,
  importVersion,
  updateVersion,
  getVersionManagementOptionsList,
} from '../../../apis/workspace/algorithm.api';
import { ElMessage } from 'element-plus';
import * as Base64 from 'base-64'

const FormRef = ref(null);
const RefFile = ref(null);
const router = useRouter();
const route = useRoute();
const state = reactive({
  model: {},
  verList: [],
  loading: false,
});
const rules = reactive({
  name: [
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  outerVerNo: [
    { required: true, message: '请填写版本号', trigger: 'blur' },
    { max: 8, message: '最多只能输入8个字符', trigger: 'change' }
  ],
  description: [
    { max: 100, message: '最多只能输入100个字符', triggr: 'change' }
  ]
})
// const emits = defineEmits(['done']);
const props = defineProps({
  defaultModel: {
    type: Object,
    default: () => ({}),
  },
  formType: {
    type: String,
    default: FormType.READ,
  },
  inline: {
    type: Boolean,
    default: true,
  },
});
watch(
  () => props.defaultModel,
  () => {
    state.model = { ...props.defaultModel };
  },
  { immediate: true },
);

const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))

onMounted(() => {
  getVersionManagementList();
});

async function getVersionManagementList() {
  // state.verList = await getVersionManagementOptionsList();
  if (state.verList.length === 0) {
    state.verList.push({ innerVerNo: 1, outerVerNo: '0.0.1' });
  }
}

function cancel() {
  router.push({
    name: route.name,
    query: {
      ...route.query,
      action: FormType.READ,
    },
  });
  FormRef.value.resetFields();
  state.model = { ...props.defaultModel };
}

function validate() {
  return FormRef.value.validate().catch(() => { });
}

function getModel() {
  return state.model;
}

const emits = defineEmits(['done']);

async function save() {
  state.model.innerVerNo = parseInt(
    state.model.outerVerNo.replaceAll('.', '0'),
  );
  try {
    state.loading = true;
    if (props.formType === FormType.CREATE) {
      await createVersion(state.model);
      ElMessage.success('新增成功');
    } else if (props.formType === FormType.IMPORT) {
      state.model.config = Base64(state.model.config)
      await importVersion(state.model);
      ElMessage.success('导入成功');
    } else {
      await updateVersion(state.model);
      ElMessage.success('更新成功');
    }
    // emits('done');
  } catch (e) {
    cancel();
    ElMessage.error(e || '操作失败');
  } finally {
    state.loading = false;
  }
}

function fileLoad() {
  const selectedFile = RefFile.value.files[0];
  state.model.file = selectedFile;
  const reader = new FileReader();
  reader.readAsText(selectedFile);
  reader.onload = (e) => {
    state.model.config = e.target.result;
  };
}

function clickLoad() {
  RefFile.value.dispatchEvent(new MouseEvent('click'));
}

defineExpose({ cancel, validate, getModel, save, FormRef, state });
</script>

<template>
  <el-form ref="FormRef" :rules="rules" :model="state.model" label-width="130px" :inline="props.inline"
    :class="{ inline: props.inline }">
    <el-form-item v-show="false" label="ID">
      <el-input v-model="state.model.id" placeholder="" :disabled="props.formType === FormType.READ"></el-input>
    </el-form-item>
    <el-form-item label="算法库名称" prop="name">
      <el-input v-model="state.model.name" placeholder="请输入算法库名称"
        :disabled="props.formType === FormType.READ"></el-input>
    </el-form-item>
    <el-form-item label="版本号" prop="outerVerNo">
      <el-input v-model="state.model.outerVerNo" placeholder="请输入版本号，格式为x.x.x"
        :disabled="props.formType === FormType.READ"></el-input>
    </el-form-item>
    <el-form-item v-show="false" label="最低版本号" prop="minVerNo">
      <el-select v-model="state.model.minVerNo" placeholder="请选择最低版本号" :disabled="props.formType === FormType.READ">
        <el-option v-for="item in state.verList" :key="item.innerVerNo" :label="item.outerVerNo"
          :value="item.innerVerNo" />
      </el-select>
    </el-form-item>
    <el-form-item label="发布状态" prop="publishState">
      <el-select v-model="state.model.publishState" :disabled="true">
        <el-option v-for="item in AlgorithmLibPublishType.options" :key="item.value" :label="item.label"
          :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="版本描述" prop="description" class="entire-line">
      <el-input v-model="state.model.description" type="textarea" placeholder=""
        :disabled="props.formType === FormType.READ" />
    </el-form-item>

    <el-form-item v-if="props.formType === FormType.IMPORT" label="配置文件">
      <el-button type="success" @click="clickLoad">点击选择</el-button>
      <input ref="RefFile" type="file" accept=".json" style="display: none" @change="fileLoad" />
      <span v-if="state.model.file" style="margin-left: 10px">
        {{ state.model.file.name }}
      </span>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.alert-info {
  margin-bottom: 10px;
}
</style>
