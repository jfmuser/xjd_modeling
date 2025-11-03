<script setup>
import _ from 'lodash';
import { FormType } from '../../../utils/const';
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { publishData } from '../../../apis/workspace/data.api';
import HeaderDataTable from './HeaderDataTable.vue';
import useConfigStore from '../../../stores/workspace/config.store';

const configInfo = useConfigStore().configInfo;
const HeaderDataTableRef = ref(null);
const FormRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  model: {},
});
const otherOrgs = computed(() => {
  if (configInfo) {
    return configInfo.otherOrgList;
  }
  return [];
});
const otherSites = computed(() => {
  if (configInfo) {
    return configInfo.otherSiteList;
  }
  return [];
});
const rules = reactive({
  msgName: [{ required: true, message: '请填写消息名称' }],
  subDeptManager: [{ required: true, message: '请选择接收主体' }],
  subDept: [{ required: true, message: '请选择接收部门' }],
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
    state.loading = true;
    const dataHeaders = HeaderDataTableRef.value.getSelectedData();
    if (dataHeaders.length <= 0) {
      throw '发布的数据字段为空，请选择需要发布的数据字段';
    }
    const publishDataHeaders = [];
    dataHeaders.forEach((dataHeader) => {
      publishDataHeaders.push(
        _.pick(dataHeader, [
          'id',
          'dataId',
          'fieldName',
          'fieldType',
          'fieldInfo',
        ]),
      );
    });
    await publishData({ ...state.model, dataHeaders: publishDataHeaders });
    ElMessage.success('发布成功');
    emits('done');
    onClose();
  } catch (error) {
    ElMessage.error(error || '发布失败');
  } finally {
    state.loading = false;
  }
};

const show = (data) => {
  state.visible = true;
  state.model = data;
};
defineExpose({ show });
// 发布时候让编辑按钮消失 父组件传值
const changeShow = ref(true);
const props = defineProps({
  titlemodel: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" :title="`数据发布`" width="1000px">
    <el-form ref="FormRef" v-loading="state.loading" :model="state.model" label-width="120px" :rules="rules">
      <el-form-item label="消息名称" prop="msgName">
        <el-input v-model="state.model.msgName" placeholder="" />
      </el-form-item>
      <el-row>
        <el-form-item prop="subDeptManager" label="接收组织">
          <el-select v-model="state.model.subDeptManager">
            <el-option v-for="item in otherOrgs" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item prop="subDept" label="接收部门">
          <el-select v-model="state.model.subDept">
            <el-option v-for="item in otherSites" :key="item.label" :label="item.siteName" :value="item.siteName" />
          </el-select>
        </el-form-item>
      </el-row>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="state.model.remarks" type="textarea" autosize placeholder="" />
      </el-form-item>
    </el-form>
    <HeaderDataTable ref="HeaderDataTableRef" :changeShow="changeShow" :dataModel="state.model"
      :formType="FormType.PUBLISH" />
    <template #footer>
      <el-button type="primary" @click="onConfirm">确认</el-button>
      <el-button @click="onClose"> 取消 </el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
