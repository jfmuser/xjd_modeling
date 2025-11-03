<script setup>
import { reactive, ref, computed,onMounted } from 'vue';
import { approvalAgree } from '../../apis/dept/approval.api';
import { ElMessage } from 'element-plus';
import {getUsers} from "../../apis/dept/auth.api";

const formRef = ref(null);
const state = reactive({
  formModel: {},
  visible: false,
  loading: false,
  row: {},
  subUsers: [],
  rules: {
    subUserId: [
      { required: true, message: '请选择消息接收人', trigger: 'change' },
    ],
  },
});

onMounted(() => {
  getSubUsers();
});
const title = computed(() => `消息审批`);
const onClose = () => {
  formRef.value.resetFields();
  state.visible = false;
};

const onConfirm = async () => {
  const isValid = await formRef.value.validate().catch(() => {
  });
  if (!isValid) {
    return;
  }
  try {
    await approvalAgree(state.formModel);
    ElMessage.success('审批通过');
  } catch (e) {
    console.error(e);
    ElMessage.error(e || '审批失败');
  } finally {
    onClose();
  }
};

async function getSubUsers() {
  try{
    const response = await getUsers();
    const { records } = response;
    state.subUsers = records;
  }catch (e) {
    console.error(e)
  } finally {
    state.loading = false;
  }
}

function show(data) {
  console.log(data)
  state.formModel = {
   id:data.id};
  state.visible = true;
}

defineExpose({ show });
</script>
<template>
  <el-dialog
      v-if='state.visible'
      :model-value='true'
      width='500px'
      :before-close='onClose'
      :title='title'>
    <el-form
        ref='formRef'
        v-loading='state.loading'
        :model='state.formModel'
        label-width='100px'
        :rules='state.rules'
    >
      <el-form-item prop='subUserId' label='接收人' style="size: auto">
        <el-select v-model='state.formModel.subUserId' size='big' type='textarea' autosize maxlength='180px' >
          <el-option
              v-for="subUser in state.subUsers"
          :value="subUser.id"
          :label="subUser.nickname"
          :key="subUser.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type='primary' @click='onConfirm'>确认</el-button>
      <el-button @click='onClose'> 取消</el-button>
    </template>
  </el-dialog>
</template>
<style scoped></style>
