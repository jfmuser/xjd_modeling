<script setup>
import _ from 'lodash';
import { reactive, watch, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import { FormType } from '../../utils/const';
import { updateSite } from '../../apis/dept/site.api';

const FormRef = ref(null);
const props = defineProps({
  siteInfo: {
    type: Object,
    required: true,
  },
  federatedId: {
    type: Number,
    required: true,
  },
  partyId: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    required: true,
  },
});
const state = reactive({
  formType: new FormType(),
  formModel: {},
  backup: {},
});
const rules = computed(() => ({
  fateFlowIp: [
    {
      required: state.formType.isEdit,
      message: '请输入链接',
    },
  ],
  workspaceBackendUrl: [
    {
      required: state.formType.isEdit,
      message: '请输入链接',
    },
  ],
  workspaceFrontUrl: [
    {
      required: state.formType.isEdit,
      message: '请输入链接',
    },
  ],
}));

const emits = defineEmits(['done']);
watch(
  () => props.siteInfo,
  (val) => {
    state.formModel = _.cloneDeep(val);
    state.backup = val;
  },
);

async function onSave() {
  const isValid = await FormRef.value.validate();
  if (!isValid) {
    return;
  }
  try {
    await updateSite({
      siteId: props.siteInfo.siteId,
      partyId: props.partyId,
      federatedId: props.federatedId,
      UpdateFateFlowInfo: state.formModel.fateFlowIp,
      UpdateWorkspaceInfo: state.formModel.workspaceBackendUrl,
      UpdateWorkspaceUIInfo: state.formModel.workspaceFrontUrl,
    });
    onCancelEdit();
    emits('done');

    ElMessage.success('更新成功');
  } catch (e) {
    ElMessage.error(e || '更新失败');
  }
}
function onCancelEdit() {
  state.formType.read();
  state.formModel = state.backup;
  FormRef.value.resetFields();
}
function onEdit() {
  state.formType.edit();
}
</script>

<template>
  <ListContainerItem title="集群网络配置">
    <template v-if="editable" #header-tool>
      <template v-if="state.formType.isEdit">
        <el-button type="text" @click="onSave">保存</el-button>
        <el-button type="text" @click="onCancelEdit">取消</el-button>
      </template>
      <template v-else>
        <el-button type="text" @click="onEdit">
          <el-icon><Edit></Edit></el-icon>
          编辑
        </el-button>
      </template>
    </template>
    <el-form
      ref="FormRef"
      label-width="140px"
      inline
      :rules="rules"
      :model="state.formModel"
      :validate-on-rule-change="false"
    >
      <el-form-item label="联邦训练地址" prop="fateFlowIp">
        <el-input
          v-model="state.formModel.fateFlowIp"
          :disabled="state.formType.isRead"
        ></el-input>
      </el-form-item>
      <el-form-item label="工作空间地址" prop="workspaceBackendUrl">
        <el-input
          v-model="state.formModel.workspaceBackendUrl"
          :disabled="state.formType.isRead"
        ></el-input>
      </el-form-item>
      <el-form-item label="工作空间页面地址" prop="workspaceFrontUrl">
        <el-input
          v-model="state.formModel.workspaceFrontUrl"
          :disabled="state.formType.isRead"
        ></el-input>
      </el-form-item>
    </el-form>
  </ListContainerItem>
</template>

<style scoped></style>
