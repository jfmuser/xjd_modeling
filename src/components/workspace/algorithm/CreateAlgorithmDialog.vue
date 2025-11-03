<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createAlgorithm,
  updateAlgorithm,
} from '../../../apis/workspace/algorithm.api';
import ListContainer from '../../../layouts/ListContainer.vue';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import AlgorithmLibraryForm from './AlgorithmLibraryForm.vue';
import AlgorithmForm from './AlgorithmForm.vue';
import * as Base64 from 'js-base64'
import { FormType } from '../../../utils/const';

const AlgorithmLibraryFormRef = ref(null);
const AlgorithmFormRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  algorithmLibModel: {},
  algorithmModel: {},
  rules: {},
  formType: FormType.CREATE,
  title: '',
});
defineExpose({ show });

function show(data) {
  if (data) {
    state.algorithmModel = data;
    state.formType = FormType.EDIT;
  } else {
    state.algorithmModel = {};
    state.formType = FormType.CREATE;
  }
  state.title = state.formType + '算法';
  state.visible = true;
}

const emits = defineEmits(['done']);

function onClose() {
  AlgorithmLibraryFormRef.value.FormRef.resetFields();
  AlgorithmFormRef.value.FormRef.resetFields();
  state.visible = false;
}

// 保存添加方法
async function onConfirm() {
  try {
    let isValid =
    (await AlgorithmLibraryFormRef.value.FormRef.validate().catch(() => { })) ||
    (await AlgorithmFormRef.value.FormRef.validate().catch(() => { }));
    if (!isValid) {
      return;
    }
    const algorithmModel = AlgorithmFormRef.value.state.model;
    // const algorithmLibId = AlgorithmLibraryFormRef.value.state.model.id;
    state.loading = true;
    if (state.formType === FormType.CREATE) {
      algorithmModel.originConf = Base64.encode(algorithmModel.originConf)
      console.log(algorithmModel);
      await createAlgorithm(algorithmModel);
      ElMessage.success('新增成功');
    } else {
      algorithmModel.parameterConf = Base64.encode(algorithmModel.parameterConf)
      algorithmModel.parameterConfig = Base64.encode(algorithmModel.parameterConfig)
      await updateAlgorithm(algorithmModel);
      ElMessage.success('更新成功');
    }
    emits('done');
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
    // location.reload();
  }
}
</script>

<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" :title="state.title" width="800px">
    <ListContainer>
      <ListContainerItem v-show="JSON.stringify(state.algorithmLibModel) !== '{}'" title="算法库信息">
        <AlgorithmLibraryForm ref="AlgorithmLibraryFormRef" :defaultModel="state.algorithmLibModel"
          :formType="FormType.READ" />
      </ListContainerItem>
      <ListContainerItem title="算法信息">
        <AlgorithmForm ref="AlgorithmFormRef" :defaultModel="state.algorithmModel" :formType="state.formType"
          :inline="false" />
      </ListContainerItem>
    </ListContainer>

    <template #footer>
      <el-button type="primary" @click="onConfirm">确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
