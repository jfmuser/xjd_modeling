<script setup>
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import userStore from '../../stores/auth.store';
import {
  getAlgorithmPageTreeList,
  deleteAlgorithm,
  copyAlgorithm,
} from '../../apis/workspace/algorithm.api';
import { AlgorithmCategory, AlgorithmLibPublishType } from '../../utils/const';
import CreateAlgorithmDialog from '../../components/workspace/algorithm/CreateAlgorithmDialog.vue';
import { useRouter, useRoute } from 'vue-router';
import { FormType } from '../../utils/const';

const router = useRouter()
const route = useRoute()
const userInfo = userStore().userInfo;
const TableContainerRef = ref(null);
const CreateAlgorithmDialogRef = ref(null);
const defaultProps = {
  children: 'children',
  hasChildren: 'hasChildren',
};
const state = reactive({
  loading: false,
  defaultExpand: false,
  tableData: [],
  search: {},
  userRole: [],
  canEdit: false,
});

onMounted(() => {
  // if (userInfo && userInfo.roleCodeList) {
  //   state.userRole = userInfo.roleCodeList;
  // }
  // if (
  //   'ADMIN'.includes(state.userRole) ||
  //   'DEPT_ADMIN'.includes(state.userRole) ||
  //   'SUPER_ADMIN'.includes(state.userRole)
  // ) {
  //   state.canEdit = true;
  // }
  state.canEdit = userInfo.admin
  fetchTableData(1);
});

async function fetchTableData(page) {
  try {
    state.loading = true;
    const pager = TableContainerRef.value.pager;
    const params = {
      "pageRequest": {
        "pageNumber": page || pager.page,
        "pageSize": pager.size
      },
    };
    const response = await getAlgorithmPageTreeList(params);
    const { records, current, size, total } = response;

    state.tableData = records;
    pager.size = size;
    pager.page = current;
    pager.total = total;
  } finally {
    state.loading = false;
  }
}

function onPageChange(page) {
  fetchTableData(page);
}

function onSearch(reset = false) {
  if (reset) {
    state.search = {};
  }
  fetchTableData(1);
}

function onUpdateDataTable() {
  console.log('done onUpdateDataTable');
  fetchTableData(1);
}

// function toDetail(row) {
//   router.push({
//     name: route.name,
//     query: {
//       algorithmName: row.name,
//       id: row.id,
//       action: FormType.READ,
//     },
//   });
// }

async function onDelete(data) {
  const confirm = await ElMessageBox.confirm(
    '此操作将永久删除, 是否继续?',
    '提示',
    {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning',
    },
  ).catch(() => { });

  if (confirm !== 'confirm') {
    return;
  }
  try {
    state.loading = true;
    await deleteAlgorithm(data.id);
    ElMessage.success('删除成功');
    await fetchTableData(1);
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '删除失败');
  } finally {
    state.loading = false;
  }
}

function onEdit(row) {
  // router.push({
  //   name: route.name,
  //   query: {
  //     algorithmName: row.name,
  //     id: row.id,
  //     action: FormType.EDIT,
  //   },
  // });
  CreateAlgorithmDialogRef.value.show(row);
}

async function onCopy(data) {
  try {
    state.loading = true;
    await copyAlgorithm(data.id);
    ElMessage.success('复制成功');
    // emits('done');
    await fetchTableData(1);
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '复制失败');
  } finally {
    state.loading = false;
  }
}

function onAdd() {
  CreateAlgorithmDialogRef.value.show();
}
</script>

<template>
  <TableContainer ref="TableContainerRef" class="table-container__table" loading="state.loading" title="算法列表"
    :showAdd="state.canEdit" :showPagination="true" @add="onAdd" :showImport="false"  @page-change="onPageChange" @search="onSearch">
    <template #filter>
      <FilterItem>
        <el-input v-model.trim="state.search.name" placeholder="算法名称/别名" style="width: 276px" />
      </FilterItem>
    </template>

    <el-table :data="state.tableData" row-key="id" :tree-props="defaultProps" :default-expand-all="state.defaultExpand">
      <el-table-column fixed align="left" label="算法名称" width="400px">
        <template #default="{ row }">
          <span v-if="!row.algorithmVersion">
            {{ row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="算法别名" eader-align="center" align="center" prop="labelName" width="200px" />
      <el-table-column header-align="center" align="center" label="版本" prop="algorithmVersion" width="200px" />
      <el-table-column header-align="center" align="center" label="类型" prop="category" width="200px">
        <template #default="{ row }">{{ AlgorithmCategory.getLabel(row.category) }}
        </template>
      </el-table-column>

      <el-table-column header-align="center" align="center" label="模块" prop="module" width="220px" />

      <el-table-column header-align="center" align="center" label="描述" prop="description" show-overflow-tooltip />
      <el-table-column v-if="state.canEdit" label="操作" width="150px" fixed="right">
        <template #default="{ row }">
          <el-link v-if="row.algorithmVersion" type="primary" :underline="false" @click="onCopy(row)">复制
          </el-link>
          <el-divider v-if="row.algorithmVersion" direction="vertical" />
          <el-link v-if="row.algorithmVersion" type="primary" :underline="false"
            :disabled="!AlgorithmLibPublishType.canEdit(row.publishState)" @click="onEdit(row)">编辑
          </el-link>
          <el-divider v-if="row.algorithmVersion" direction="vertical" />
          <el-link v-if="row.algorithmVersion" type="primary" :underline="false"
            :disabled="!AlgorithmLibPublishType.canEdit(row.publishState)" @click="onDelete(row)">删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <CreateAlgorithmDialog ref="CreateAlgorithmDialogRef" @done="onUpdateDataTable" />
</template>

<style scoped lang="scss">
.table-container {
  &__table {
    :deep .el-table {
      .cell {
        text-align: left !important;
      }
    }
  }
}
</style>
