<script setup>
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import { deleteData, getAllDataList } from '../../apis/workspace/data.api';
import { FormType, SourceType, DataStatus } from '../../utils/const';
import { ElMessage, ElMessageBox } from 'element-plus';
import CreateDataDialog from '../../components/workspace/data/CreateDataDialog.vue';

const route = useRoute();
const router = useRouter();
const TableContainerRef = ref(null);
const CreateDataDialogRef = ref(null);
const state = reactive({
  loading: false,
  tableData: [],
  search: {},
});

onMounted(() => {
  fetchTableData(1);
});

async function fetchTableData(page) {
  try {
    state.loading = true;
    const pager = TableContainerRef.value.pager;
    const params = {
      currentPage: page || pager.page,
      size: pager.size,
      ..._.pickBy(state.search, (value) => value !== ''),
    };
    const response = await getAllDataList(params);
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
  fetchTableData(1);
}

function onAdd() {
  CreateDataDialogRef.value.show();
}

function onShowInfo(row) {
  router.push({
    name: route.name,
    query: {
      dataName: row.dataName,
      id: row.id,
      action: FormType.READ,
    },
  });
}

function onEdit(row) {
  router.push({
    name: route.name,
    query: {
      dataName: row.dataName,
      id: row.id,
      action: FormType.EDIT,
    },
  });
}

async function onDelete(data) {
  const confirm = await ElMessageBox.confirm(
    '此操作将永久删除, 是否继续?',
    '提示',
    {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning',
    },
  ).catch(() => {
  });

  if (confirm !== 'confirm') {
    return;
  }
  try {
    state.loading = true;
    await deleteData(data);
    ElMessage.success('删除成功');
    await fetchTableData();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '删除失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <TableContainer
    ref='TableContainerRef'
    loading='state.loading'
    title='所有数据'
    @search='onSearch'
    @page-change='onPageChange'
    @add='onAdd'
  >
    <template #filter>
      <FilterItem>
        <el-input v-model.trim='state.search.dataName' placeholder='请输入数据名称' />
      </FilterItem>
      <FilterItem>
        <el-select v-model='state.search.dataSourceType' placeholder='请选择数据源类型'>
          <el-option
            v-for='item in SourceType.options'
            :key='item.value'
            :value='item.value'
            :label="item.label +'数据'"
          />
        </el-select>
      </FilterItem>
    </template>

    <el-table :data='state.tableData'>
      <el-table-column type='expand' fixed>
        <template #default='props'>
          <p>表头信息:</p>{{ props.row.meta }}
        </template>
      </el-table-column>
      <el-table-column label='数据名称' prop='dataName' min-width='150px' fixed>
        <template #default='{ row }'>
          <el-button
            type='text'
            @click='() => onShowInfo(row)'
          >
            {{ row.dataName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label='数据源类型' prop='dataSourceType' min-width='100px'>
        <template #default='{ row }'>{{ SourceType.getLabel(row.dataSourceType) }}数据</template>
      </el-table-column>
      <el-table-column label='状态' prop='dataCheckState' min-width='60px'>
        <template #default='{ row }'>{{ DataStatus.getLabel(row.dataCheckState) }}</template>
      </el-table-column>
      <el-table-column label='命名空间' prop='namespace' min-width='100px' show-overflow-tooltip />
      <el-table-column label='分区数' prop='dataPartitions' />
      <el-table-column label='行数' prop='dataRows' />
      <el-table-column label='上传用户' prop='creator' />
      <el-table-column label='上传时间' prop='createdTime' min-width='180px' />
      <el-table-column label='更新时间' prop='updatedTime' min-width='180px' />
      <el-table-column label='备注' prop='remarks' min-width='200px' show-overflow-tooltip>
        <template #default='{ row }'>{{ row.remarks || '-' }}</template>
      </el-table-column>
      <el-table-column label='操作' min-width='100px' fixed='right'>
        <template #default='{ row }'>
          <el-link
            type='primary'
            :underline='false'
            @click='onEdit(row)'
          >编辑
          </el-link>
          <el-divider direction='vertical' />
          <el-link
            type='primary'
            :underline='false'
            @click='onDelete(row)'
          >删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <CreateDataDialog ref='CreateDataDialogRef' @done='onUpdateDataTable' />
</template>

<style scoped>

</style>