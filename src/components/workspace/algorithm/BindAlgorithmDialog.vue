<script setup>

import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { bindAlgorithm } from '../../../apis/workspace/algorithm.api';
import ListContainer from '../../../layouts/ListContainer.vue';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import AlgorithmLibraryForm from './AlgorithmLibraryForm.vue'
import AlgorithmForm from './AlgorithmForm.vue'
import { FormType } from '../../../utils/const';
import { updatebind } from '../../../apis/manager/managerApi'

const AlgorithmLibraryFormRef = ref(null);
const AlgorithmFormRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  algorithmLibModel: {},
  algorithmModel: {},
  rules: {},
});
defineExpose({ show });
function show(data) {
  if (data) {
    state.algorithmLibModel = data;
    console.log(data, 'getArithmeticList');
  }
  state.visible = true;
}
const emits = defineEmits(['done']);

function onClose() {
  AlgorithmLibraryFormRef.value.FormRef.resetFields();
  // AlgorithmFormRef.value.FormRef.resetFields();
  state.visible = false;
}

async function onConfirm() {
  try {
    let isValid =
      (await AlgorithmLibraryFormRef.value.FormRef.validate().catch(() => { }))
    if (!isValid) {
      return;
    }
    state.loading = true;
    const algorithmIdList = []
    console.log(AlgorithmFormRef.value.state.algorithmTreeList);
    AlgorithmFormRef.value.state.algorithmTreeList.forEach(item => {
      console.log(item.children.find(algorithm => algorithm.bindState == 1),'LLL');
      if(!(item.children.find(algorithm => algorithm.bindState == 1)?.id)) return
      algorithmIdList.push({id:item.children.find(algorithm => algorithm.bindState == 1)?.id})
    })
    console.log(algorithmIdList);
    const response = await updatebind(
       AlgorithmLibraryFormRef.value.state.model.id,
      { algorithms: algorithmIdList })
    ElMessage.success('操作成功');
    emits('done', response);
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" title="绑定算法" width="600px">
    <ListContainer>
      <ListContainerItem title="算法库信息">
        <AlgorithmLibraryForm ref="AlgorithmLibraryFormRef" :defaultModel="state.algorithmLibModel"
          :formType="FormType.READ"></AlgorithmLibraryForm>
      </ListContainerItem>
      <ListContainerItem title="算法信息">
        <AlgorithmForm ref="AlgorithmFormRef" :defaultModel="state.algorithmModel" :formType="FormType.BIND"
          :inline="false" :algorithmLibId="state.algorithmLibModel.id"></AlgorithmForm>
      </ListContainerItem>
    </ListContainer>

    <template #footer>
      <el-button type="primary" @click="onConfirm">确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>


<style scoped></style>