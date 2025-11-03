<script setup>
import { reactive, ref, watch } from 'vue';
import { FormType, DataStatus, SourceType } from '../../../utils/const';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import HeaderDataTable from './HeaderDataTable.vue';
import { createData, updateData } from '../../../apis/workspace/data.api';

const FormRef = ref(null);
const HeaderDataTableRef = ref(null);
const router = useRouter();
const route = useRoute();
const state = reactive({
  model: {},
  tableData: [],
});

const props = defineProps({
  defaultModel: {
    type: Object,
    default: () => ({}),
  },
  formType: {
    type: String,
    default: FormType.READ,
  },
  inline: {
    type: Boolean,
    default: true,
  },
});

watch(
  () => props.defaultModel,
  () => {
    state.model = { ...props.defaultModel };
  },
  { immediate: true },
);

function refresh() {
  HeaderDataTableRef.value.fetchTableData();
}

async function save() {
  try {
    state.loading = true;
    const headerData = HeaderDataTableRef.value.getAllData();
    if (props.formType === FormType.CREATE) {
      await createData({ ...state.model, dataHeaders: headerData });
      ElMessage.success('新增成功');
      HeaderDataTableRef.value.fetchTableData();
    } else {
      await updateData({ ...state.model, dataHeaders: headerData });
      ElMessage.success('更新成功');
      HeaderDataTableRef.value.fetchTableData();
    }
  } catch (e) {
    cancel();
    ElMessage.error(e || '操作失败');
  } finally {
    state.loading = false;
  }
}

function cancel() {
  router.push({
    name: route.name,
    query: {
      dataName: state.model.dataName,
      id: state.model.id,
      action: FormType.READ,
    },
  });
  FormRef.value.resetFields();
  state.model = { ...props.defaultModel };
}

function validate() {
  return FormRef.value.validate().catch(() => { });
}

function getModel() {
  return state.model;
}

defineExpose({ save, cancel, validate, getModel, FormRef, state, refresh });
</script>

<template>
  <el-form ref="FormRef" :model="state.model" label-width="100px" :inline="props.inline">
    <el-form-item label="数据名称" prop="dataName">
      <el-input v-model="state.model.dataName" placeholder="数据名称" :disabled="true" />
    </el-form-item>
    <el-form-item label="命名空间" prop="namespace">
      <el-input v-model="state.model.namespace" placeholder="请输入命名空间" :disabled="true" />
    </el-form-item>
    <el-form-item label="分区数" prop="dataPartitions">
      <el-input v-model="state.model.dataPartitions" placeholder="请输入分区数" :disabled="true" />
    </el-form-item>
    <el-form-item label="行数" prop="dataRows">
      <el-input v-model="state.model.dataRows" placeholder="" :disabled="true" />
    </el-form-item>
    <el-form-item label="上传时间" prop="createdTime">
      <el-input v-model="state.model.createdTime" placeholder="" :disabled="true" />
    </el-form-item>
    <el-form-item label="更新时间" prop="updatedTime">
      <el-input v-model="state.model.updatedTime" placeholder="" :disabled="true" />
    </el-form-item>
    <el-form-item v-if="!SourceType.isSelf(state.model.dataSourceType)" label="接收主体" prop="subDeptManager">
      <el-input v-model="state.model.subDeptManager" placeholder="" :disabled="true" />
    </el-form-item>
    <el-form-item v-if="!SourceType.isSelf(state.model.dataSourceType)" label="接收部门" prop="subDept">
      <el-input v-model="state.model.subDept" placeholder="" :disabled="true" />
    </el-form-item>
    <el-form-item label="状态" prop="dataCheckState">
      <el-select v-model="state.model.dataCheckState" :disabled="true">
        <el-option v-for="item in DataStatus.options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="字段数量" prop="numberOfFileds">
      <el-input v-model="state.model.numberOfFileds" placeholder="字段数量" :disabled="true" />
    </el-form-item>
    <el-form-item label="备注" prop="remarks" class="entire-line">
      <el-input v-model="state.model.remarks" type="textarea" autosize placeholder=""
        :disabled="props.formType === FormType.READ" />
    </el-form-item>
  </el-form>
  <HeaderDataTable ref="HeaderDataTableRef" :dataModel="state.model" :formType="props.formType" @done="refresh" />
</template>

<style scoped lang="scss">
.alert-info {
  margin-bottom: 1rem;
}
</style>
