<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { importVersion } from '../../../apis/workspace/algorithm.api';
import ListContainer from '../../../layouts/ListContainer.vue';
import AlgorithmLibraryForm from './AlgorithmLibraryForm.vue'
import { FormType } from '../../../utils/const';
import  * as Base64  from 'js-base64';

const AlgorithmLibraryFormRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  formModel: { publishState: 0, minVerNo: 10000 },
  rules: {},
});
defineExpose({ show });
function show(data) {
  if (data) {
    state.formModel = data;
  }
  state.visible = true;
}
const emits = defineEmits(['done']);

function onClose() {
  AlgorithmLibraryFormRef.value.FormRef.resetFields();
  state.visible = false;
}

async function onConfirm() {
  try {
    let isValid =
      (await AlgorithmLibraryFormRef.value.FormRef.validate().catch(() => { }))
    if (!isValid) {
      return;
    }
    const innerVerNo = parseInt(AlgorithmLibraryFormRef.value.state.model.outerVerNo?.replaceAll(".", "0"))
    const values = {
      ...AlgorithmLibraryFormRef.value.state.model,
      innerVerNo: innerVerNo
    };
    state.loading = true;
    values.config = Base64.encode(values.config)
    const response = await importVersion(values);
    ElMessage.success('操作成功');
    emits('done', response);
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" title="导入算法库" width="600px">
    <ListContainer>
      <AlgorithmLibraryForm ref="AlgorithmLibraryFormRef" :defaultModel="state.formModel" :formType="FormType.IMPORT"
        :inline="false" />
    </ListContainer>

    <template #footer>
      <el-button type="primary" @click="onConfirm">确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>


<style scoped></style>