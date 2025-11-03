<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { FormType, FieldType } from '../../../utils/const';
import {
  getHeaderData,
  updateData,
} from '../../../apis/workspace/dataHeaders.api';
import { ElMessage } from 'element-plus';
const TableDataRef = ref(null);
const props = defineProps({
  dataModel: { type: Object, required: true },
  formType: { type: String, required: true },
  changeShow: { type: Boolean },
});

const state = reactive({
  loading: false,
  tableData: [],
  selectedData: [],
  search: {},
});

watch(
  () => props.dataModel.id,
  () => {
    fetchTableData();
  },
);

onMounted(() => {
  fetchTableData();
});

async function fetchTableData() {
  try {
    state.loading = true;
    if (props.dataModel.id) {
      state.tableData = await getHeaderData(props.dataModel.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

function getRowKeys(row) {
  return row.id;
}

function getSelectedData() {
  return state.selectedData;
}

function getAllData() {
  return state.tableData;
}

function fieldTypeChange(val, id) {
  state.tableData.find((item) => item.id === id).fieldType = val;
}

function fieldInfoChange(val, id) {
  state.tableData.find((item) => item.id === id).fieldInfo = val;
}

defineExpose({
  TableDataRef,
  getSelectedData,
  getAllData,
  state,
  fetchTableData,
  onMounted,
});
/**
 * 批量修改
 */
// 选中之后回调数组
const handleSelectionChange = (val) => {
  state.selectedData = val;
};
// 全选是否显示
const checkShow = ref(false);

// 批量修改 显示全选框
const allEdit = async () => {
  await fetchTableData();
  checkShow.value = true;
};

// 确定 弹框显示
const onSave = () => {
  // 判断全选中的长度是否大于0
  if (state.selectedData.length > 0) {
    dialogVisible.value = true;
  } else {
    ElMessage({
      message: '请先选择要修改的字段',
      type: 'warning',
    });
  }
};
// 取消 让全选消失
const onCancel = () => {
  state.selectedData = [];
  checkShow.value = false;
};

/**
 * 弹框里面的内容
 */
// 弹框是否显示
const dialogVisible = ref(false);

// 弹框取消
const cancelUpate = async () => {
  dialogVisible.value = false;
  await fetchTableData();
};

// 弹框 最终保存
const saveUpdate = async () => {
  dialogVisible.value = false;
  checkShow.value = false;
  // 遍历全选数组添加字段属性
  state.selectedData.forEach((item) => {
    item['fieldType'] = filterForm.value.keyOnly;
  });
  // 修改接口
  await updateData(state.selectedData).then((res) => {
    if (res == '修改成功') {
      // 查询接口
      ElMessage({
        message: '修改成功',
        type: 'success',
      });
    } else {
      ElMessage({
        message: '保存失败',
        type: 'error',
      });
    }
  });
  await fetchTableData();
};
const filterForm = ref({
  keyOnly: '',
});
const fieldTypeList = ref([
  {
    keyOnly: 'Integer',
  },
  {
    keyOnly: 'Double',
  },
  {
    keyOnly: 'String',
  },
]);
</script>

<template>
  <span style="float: right" v-if="!changeShow">
    <el-button type="text" @click="allEdit" v-if="!checkShow">
      <el-icon>
        <Edit />
      </el-icon>
      批量修改
    </el-button>
    <template v-else>
      <el-button type="text" @click="onSave">下一步</el-button>
      <el-button type="text" @click="onCancel">取消</el-button>
    </template>
  </span>
  <el-table ref="TableDataRef" v-loading="state.loading" :data="state.tableData" :row-key="getRowKeys"
    @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" v-if="checkShow" />
    <el-table-column v-if="props.formType === FormType.PUBLISH" type="selection" width="55" :reserve-selection="true" />
    <el-table-column header-align="center" align="center" label="字段名称" prop="fieldName" />
    <el-table-column header-align="center" align="center" label="字段类型" prop="fieldType">
      <template #default="{ row }">
        <el-select :model-value="row.fieldType" :disabled="props.formType !== FormType.EDIT"
          @change="(value) => fieldTypeChange(value, row.id)">
          <el-option v-for="item in FieldType.options" :key="item.value" :label="item.value" :value="item.value" />
        </el-select>
      </template>
    </el-table-column>
    <el-table-column header-align="center" align="center" label="字段说明" prop="fieldInfo">
      <template #default="{ row }">
        <el-input :model-value="row.fieldInfo" :disabled="props.formType !== FormType.EDIT"
          @input="(value) => fieldInfoChange(value, row.id)" />
      </template>
    </el-table-column>
  </el-table>
  <!-- 弹出框 -->
  <el-dialog v-model="dialogVisible" title="批量修改字段类型" width="30%" :before-close="handleClose">
    <el-form ref="ruleFormRef" :model="ruleForm" label-width="120px" class="demo-ruleForm" :size="formSize" status-icon>
      <el-form-item label="字段类型" class="zindex">
        <el-select v-model="filterForm.keyOnly" placeholder="请选择字段类型" :popper-append-to-body="false">
          <el-option v-for="item in fieldTypeList" :key="item.id" :label="item.keyOnly" :value="item.keyOnly" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelUpate">取消</el-button>
        <el-button type="primary" @click="saveUpdate"> 保存 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.zindex {
  z-index: 999;
}
</style>
