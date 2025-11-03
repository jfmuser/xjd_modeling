<script setup>
import { reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { FormType } from '../../utils/const';
import { createRole, updateRole } from '../../apis/dept/auth.api';

const defaultModel = { status: 0, username: '' };
const formRef = ref();
const state = reactive({
  visible: false,
  loading: false,
  formModel: { ...defaultModel },
  formType: new FormType(FormType.CREATE),
});
const rules = computed(() => ({
  code: [
    {
      required: true,
      message: '不能为空',
    },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' },
        { pattern: /^[0-9a-zA-Z_]*$/g, message: '角色编码只能为英文格式', trigger: 'change' },
  ],
  name: [
    {
      required: true,
      message: '不能为空',
    },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  type: [
    {
      required: true,
      message: '不能为空',
    }
  ],
  remarks: [
    {max:50,message:'最多只能输入16个字符',trigger:'change'}
  ]
}));

function show(data) {
  if (data) {
    state.formModel = { ...data };
    state.formType = new FormType(FormType.EDIT);
  } else {
    state.formModel = { ...defaultModel };
    state.formType = new FormType(FormType.CREATE);
  }
  state.visible = true;
}

defineExpose({ show });
const emits = defineEmits(['done']);

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
    if (state.formType.isCreate) {
      await createRole(state.formModel);
    } else {
      await updateRole(state.formModel);
    }

    ElMessage.success('操作成功');
    emits('done');
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
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" :title="`${state.formType.label}角色`"
    :show-close="false">
    <el-form ref="formRef" label-width="80px" :model="state.formModel" :rules="rules" :validate-on-rule-change="false">
      <el-form-item label="角色编码" prop="code">
        <el-input v-model="state.formModel.code" :disabled="state.formType.isEdit"></el-input>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="state.formModel.name"></el-input>
      </el-form-item>
      <el-form-item label="角色类型" prop="type">
        <el-select v-model="state.formModel.type" style="width: 100%" :disabled="state.formType.isEdit">
          <el-option label="部门管理平台角色" :value="0"></el-option>
          <el-option label="部门角色" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="state.formModel.remarks" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>
<style scoped></style>
