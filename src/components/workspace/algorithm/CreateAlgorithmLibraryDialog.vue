<script setup>
import { reactive, ref } from 'vue';
import ListContainer from '../../../layouts/ListContainer.vue';
import AlgorithmLibraryForm from './AlgorithmLibraryForm.vue';
import { FormType } from '../../../utils/const';
import { useRoute, useRouter } from 'vue-router';
import {
  createVersion,
  importVersion,
  updateVersion,
} from '../../../apis/workspace/algorithm.api';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const AlgorithmLibraryFormRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  formModel: { publishState: 0, minVerNo: 10000 },
  formType: FormType.CREATE,
  title: '',
  rules: {},
});
defineExpose({ show });

const emits = defineEmits(['done']);

function show(data) {
  if (data) {
    state.formModel = data;
    state.formModel.title = '修改算法库';
    state.formType = FormType.EDIT;
  } else {
    state.formType = FormType.CREATE;
    state.formModel = { publishState: 0, minVerNo: 10000, title: '新增算法库' };
  }
  state.title = state.formType + '算法库';
  state.visible = true;
}

function onClose() {
  AlgorithmLibraryFormRef.value.FormRef.resetFields();
  state.visible = false;
}

async function onConfirm() {
  // AlgorithmLibraryFormRef.value.save();
  // onClose();
  // emits('done');

  try {
    let isValid = await AlgorithmLibraryFormRef.value.FormRef.validate().catch(
      () => { },
    );
    if (!isValid) {
      return;
    }
    const algorithmLibModel = AlgorithmLibraryFormRef.value.state.model;
    if (!algorithmLibModel.innerVerNo) {
      algorithmLibModel.innerVerNo = parseInt(
        algorithmLibModel.outerVerNo.replaceAll('.', '0'),
      );
    }
    console.log(algorithmLibModel);
    state.loading = true;
    if (state.formType === FormType.CREATE) {
      await createVersion(algorithmLibModel);
      ElMessage.success('新增成功');
    } else if (state.formType === FormType.IMPORT) {
      await importVersion(algorithmLibModel);
      ElMessage.success('导入成功');
    } else {
      await updateVersion(algorithmLibModel);
      ElMessage.success('更新成功');
    }
    emits('done');
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  } finally {
    state.loading = false;
    // location.reload();
  }
}

function afterConfirm() {
  emits('done');
}
</script>

<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" :title="state.title" width="600px">
    <ListContainer>
      <AlgorithmLibraryForm ref="AlgorithmLibraryFormRef" :defaultModel="state.formModel" :formType="state.formType"
        :inline="false" @done="afterConfirm" />
    </ListContainer>

    <template #footer>
      <el-button type="primary" @click="onConfirm">确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
