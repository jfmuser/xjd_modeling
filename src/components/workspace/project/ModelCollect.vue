<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { collectFate } from '@/apis/prjModel/api';

const FormRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  model: {},
});
const emits = defineEmits(['done']);
const onClose = () => {
  FormRef.value.resetFields();
  state.visible = false;
};
const onConfirm = async () => {
  const isValid = await FormRef.value.validate().catch(() => { });
  if (!isValid) {
    return;
  }
  try {
    console.log({ model: state.model })
    state.loading = true;
    await collectFate(state.model);
    ElMessage.success('收藏成功');
    emits('done')
    onClose();
  } catch (error) {
    ElMessage.error(error || '收藏失败');
  } finally {
    state.loading = false;
  }
}

const show = (jobId, projectId, projectName) => {
  console.log({ jobId, projectId, projectName })
  state.visible = true;
  state.model = {
    jobId: jobId,
    projectId: projectId,
    modelName: projectName
  }
};
defineExpose({ show });
</script>

<template>
  <el-dialog v-model="state.visible"
             :before-close="onClose"
             title="收藏模型"
             width="500px">
    <el-form ref="FormRef"
             v-loading="state.loading"
             :model="state.model"
             label-width="120px"
             :rules="rules">
      <el-form-item prop="modelName"
                    label="模型名称">
        <el-input v-model.trim="state.model.modelName" />
      </el-form-item>
      <el-form-item prop="remarks"
                    label="备注">
        <el-input v-model.trim="state.model.remarks" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary"
                 @click="onConfirm">确认</el-button>
      <el-button @click="onClose"> 取消 </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>