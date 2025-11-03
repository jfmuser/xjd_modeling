<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { checkUrl } from '../../apis/dept/site.api';

const formRef = ref(null);

const router = useRouter();
const state = reactive({
  visible: false,
  loading: false,
  model: {
    link: '',
  },
});

const rules = reactive({
  link: [{ required: true, message: '请输入激活链接' }],
});

function show() {
  state.visible = true;
}

defineExpose({ show });

function onClose() {
  formRef.value.resetFields();
  state.visible = false;
}

async function onConfirm() {
  try {
    const isValid = await formRef.value.validate().catch(() => { });
    if (!isValid) {
      return;
    }

    state.loading = true;
    const response = await checkUrl(state.model);
    localStorage.setItem('activateData', JSON.stringify(response));
    router.push({ name: 'activateSite' });
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '激活失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <el-dialog v-model="state.visible" :before-close="onClose" title="主体激活" width="550px">
    <el-form ref="formRef" label-width="80px" :model="state.model" :rules="rules">
      <el-form-item label="链接" prop="link">
        <el-input v-model.trim="state.model.link" placeholder="请输入联邦管理平台提供的管理员激活链接" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
