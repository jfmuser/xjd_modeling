<script setup>
import { reactive, ref } from 'vue';
import { createData } from '../../apis/workspace/data.api';
import { ElMessage } from 'element-plus';

const formRef = ref(null);
const emit = defineEmits(['done']);
const state = reactive({
  visible: false,
  rules: {
    file: [{ required: true, message: '请上传文件', trigger: 'change' }],
  },
  loading: false,
  model: {
    file: null,
    head: 1,
    partition: 2,
    table_name: 'test5_cluster',
    backend: 0,
    namespace: 'experiment',
  },
});

function onClose() {
  formRef.value.resetFields();
  state.visible = false;
}

function onUploadFile(fileList) {
  state.model.file = fileList[0];
  formRef.value.validateField('file');
}

function show() {
  state.visible = true;
}

async function onConfirm() {
  const isValid = await formRef.value.validate().catch(() => { });
  if (!isValid) {
    return;
  }

  try {
    state.loading = true;
    const formData = new FormData();
    const { file, ...params } = state.model;
    formData.set('file', file);
    const response = await createData(formData, {
      [JSON.stringify(params)]: true,
    });
    ElMessage.success(response.retmsg || '创建成功');
    emit('done');
    onClose();
  } catch (error) {
    ElMessage.error(error.retmsg);
  } finally {
    state.loading = false;
  }
}

defineExpose({ show });
</script>
<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" title="添加数据">
    <el-form ref="formRef" v-loading="state.loading" :model="state.model" label-width="100px" :rules="state.rules">
      <el-form-item label="文件路径" prop="file">
        <C2Upload accept=".csv" @upload-file="onUploadFile">
          <el-button type="primary">点击上传</el-button>
        </C2Upload>
        <span v-if="state.model.file" style="margin-left: 1rem">
          {{ state.model.file.name }}
        </span>
      </el-form-item>
      <el-form-item label="是否有表头" prop="head">
        <el-input v-model="state.model.head" />
      </el-form-item>
      <el-form-item label="分区数" prop="partition">
        <el-input v-model="state.model.partition" />
      </el-form-item>
      <el-form-item label="数据名称" prop="table_name">
        <el-input v-model="state.model.table_name" />
      </el-form-item>
      <el-form-item label="命名空间" prop="namespace">
        <el-input v-model="state.model.namespace" />
      </el-form-item>
      <el-form-item label="备注" prop="notes">
        <el-input v-model="state.model.notes" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm">确认</el-button>
      <el-button @click="onClose"> 取消 </el-button>
    </template>
  </el-dialog>
</template>
<style scoped></style>
