<script setup>
import _ from 'lodash';
import { watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref } from '@vue/reactivity';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import { FormType } from '../../utils/const';
import { updateSite } from '../../apis/dept/site.api';
import NetworkDialog from './NetworkDialog.vue';

const NetworkDialogRef = ref(null);
const FormRef = ref(null);
const props = defineProps({
  siteInfo: {
    type: Object,
    required: true,
  },
  cloudManagerExchange: {
    type: Object,
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
const editStatusCode = computed(() => props.siteInfo?.editStatus?.code);
const emits = defineEmits(['done']);

watch(
  () => props.siteInfo,
  (val) => {
    state.formModel = _.cloneDeep({
      ...props.siteInfo.ExchangeInfo,
      ...props.cloudManagerExchange,
    });
    state.backup = val.ExchangeInfo;
  },
  { immediate: true },
);

async function onSave() {
  const isValid = await FormRef.value.validate();
  if (!isValid) {
    return;
  }
  const confirmed = await ElMessageBox.confirm(
    '确定要保存这些改动吗?',
    '联邦管理平台审核后，您将获得更改结果。',
    {
      type: 'warning',
    },
  ).catch(() => { });

  if (confirmed !== 'confirm') {
    return;
  }
  try {
    const { fmRollSiteNetworkAccessExitsList } = state.formModel;
    await updateSite({
      ...props.siteInfo,
      ...state.formModel,
      networkAccessExits: fmRollSiteNetworkAccessExitsList,
      // F**K why
      role: props.siteInfo.role.code,
      UpdateRollSiteInfo: 1,
    });
    onCancelEdit();
    emits('done');

    ElMessage.success('更新成功');
  } catch (e) {
    ElMessage.error(e || '更新失败');
  }
}

function onEdit() {
  state.formType.edit();
}
function onCancelEdit() {
  state.formType.read();
  state.formModel = state.backup;
}
function onUpdateNetwork({ networkAccessType, data }) {
  state.formModel[networkAccessType] = data;
}
</script>

<template>
  <ListContainerItem title="消息队列网关设置">
    <template v-if="editable" #header-tool>
      <template v-if="editStatusCode === 1 || editStatusCode === -1">
        <el-tag> 审核中 </el-tag>
      </template>
      <template v-else>
        <template v-if="state.formType.isEdit">
          <el-button type="text" @click="onSave">保存</el-button>
          <el-button type="text" @click="onCancelEdit">取消</el-button>
        </template>
        <template v-else>
          <el-button type="text" @click="onEdit">
            <el-icon>
              <Edit></Edit>
            </el-icon>
            编辑
          </el-button>
        </template>
      </template>
    </template>
    <el-form ref="FormRef" :model="state.formModel" label-width="180px" inline>
      <el-form-item label="部门消息队列入口" prop="networkAccessEntrances">
        {{ state.formModel.networkAccessEntrances }}
        <el-button v-show="state.formType.isEdit" type="text" @click="() =>
            NetworkDialogRef.show(
              state.formModel.networkAccessEntrances,
              'networkAccessEntrances',
            )
          ">
          <el-icon>
            <Plus></Plus>
          </el-icon>
        </el-button>
      </el-form-item>
      <el-form-item label="默认消息队列网关入口" prop="fmRollSiteNetworkAccess">
        {{ state.formModel.fmRollSiteNetworkAccess }}
        <el-button v-show="state.formType.isEdit" type="text" @click="() =>
            NetworkDialogRef.show(
              state.formModel.fmRollSiteNetworkAccess,
              'fmRollSiteNetworkAccess',
            )
          ">
          <el-icon>
            <Plus></Plus>
          </el-icon>
        </el-button>
      </el-form-item>
      <el-form-item label="默认消息队列网关出口">
        {{ state.formModel.fmRollSiteNetworkAccessExitsList }}
        <el-button v-show="state.formType.isEdit" type="text" @click="() =>
            NetworkDialogRef.show(
              state.formModel.fmRollSiteNetworkAccessExitsList,
              'fmRollSiteNetworkAccessExitsList',
            )
          ">
          <el-icon>
            <Plus></Plus>
          </el-icon>
        </el-button>
      </el-form-item>
      <el-form-item label="加密传输">
        <el-radio-group v-model="state.formModel.secureStatus" :disabled="state.formType.isRead">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="2">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="单向传输">
        <el-radio-group v-model="state.formModel.pollingStatus" :disabled="state.formType.isRead">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="2">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </ListContainerItem>
  <NetworkDialog ref="NetworkDialogRef" @done="onUpdateNetwork"></NetworkDialog>
</template>

<style scoped></style>
