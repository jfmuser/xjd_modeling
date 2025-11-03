<script setup>
import { reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getInstitutions, applySite } from '../../apis/dept/site.api';

const formRef = ref(null);

const state = reactive({
  visible: false,
  loading: false,
  model: { selectedCheckbox: [] },
  institutionList: [],
});

const confirmDisabled = computed(
  () => state.model.selectedCheckbox.length === 0,
);

function show() {
  state.visible = true;
  fetchInstitutionList();
}

defineExpose({ show });

async function fetchInstitutionList() {
  try {
    state.loading = true;
    const response = await getInstitutions();
    state.institutionList = response.map((item) => ({
      ...item,
      // FIXME: magic number
      disabled: item.status.code === 2,
    }));
  } finally {
    state.loading = false;
  }
}

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
    await applySite({
      authorityInstitutions: state.model.selectedCheckbox,
    });
    onClose();
  } catch (error) {
    ElMessage.error(error || '申请失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <el-dialog v-model="state.visible" :before-close="onClose" title="主体申请" width="550px">
    <el-alert title="请选择您要查看的隐私计算平台。提交申请后，请等待管理平台的批准。" type="info" :closable="false" />
    <el-alert title="申请查看其他隐私计算平台的数据源主体，他们可以查看您的应用方主体。" type="info" :closable="false" />
    <el-form ref="formRef" v-loading="state.loading" label-width="80px" :model="state.model">
      <el-form-item label="主体" prop="selectedCheckbox">
        <el-checkbox-group v-model="state.model.selectedCheckbox">
          <el-checkbox v-for="(item, index) in state.institutionList" :key="index" :disabled="item.disabled"
            :label="item.institutions" />
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="confirmDisabled" type="primary" @click="onConfirm">确定
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
