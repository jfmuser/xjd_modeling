<script setup>
import _ from 'lodash';
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import { FormType, SourceType } from '../../utils/const';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProjectList, deleteProject } from '../../apis/workspace/project.api';
import CreateProjectDialog from '../../components/workspace/project/CreateProjectDialog.vue';
import EditProjectDialog from '../../components/workspace/project/EditProjectDialog.vue';
import { formatDateTime } from '../../utils';

const route = useRoute();
const router = useRouter();
const TableContainerRef = ref(null);
const CreateProjectFormDialogRef = ref(null);
const EditProjectFormDialogRef = ref(null);
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
    const response = await getProjectList(params);
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
  CreateProjectFormDialogRef.value.show(FormType.CREATE);
}

function onShowInfo(row) {
  router.push({
    name: route.name,
    query: {
      projectName: row.projectName,
      id: row.id,
      action: FormType.READ,
    },
  });
}

function onEdit(row) {
  EditProjectFormDialogRef.value.show(row);
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
  
      await deleteProject(data.id);
  
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
  <TableContainer ref='TableContainerRef' loading='state.loading' :showImport="false" title='联邦项目' @search='onSearch'
    @page-change='onPageChange' @add='onAdd' @edit="onEdit">
    <template #filter>
      <FilterItem>
        <el-input v-model.trim='state.search.projectName' placeholder='请输入项目名称' style='width: 276px'></el-input>
      </FilterItem>
      <FilterItem>
        <el-select v-model='state.search.projectSourceType' placeholder='请选择项目类型'>
          <el-option v-for='item in SourceType.options' :key='item.value' :value='item.value'
            :label="item.label + '项目'" />
        </el-select>
      </FilterItem>
    </template>

    <el-table v-loading='state.loading' :data='state.tableData'>
      <el-table-column type='expand'>
        <template #default='props'>
          <p style='padding: 0 3rem'>
            配置信息:
            <C2Copy :text='JSON.stringify(props.row.projectJson)' />
          </p>
          <pre>
                                {{ JSON.stringify(props.row.projectJson, null, 2) }}
                              </pre>
        </template>
      </el-table-column>
      <el-table-column prop='projectName' label='项目名称' min-width='150px'>
        <template #default='{ row }'>
          <el-button type='text' @click='() => onShowInfo(row)'>
            {{ row.projectName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label='项目类型' prop='projectSourceType' min-width='100px'>
        <template #default='{ row }'>{{ SourceType.getLabel(row.projectSourceType) }}项目</template>
      </el-table-column>
      <el-table-column prop='creator' label='创建者' />
      <el-table-column prop='updatedUser' label='更新者' />
      <el-table-column label='创建时间' min-width='180px'>
        <template #default='{ row }'>
          {{ formatDateTime(row.createdTime) }}
        </template>
      </el-table-column>
      <el-table-column prop='updatedTime' label='更新时间' min-width='180px'>
        <template #default='{ row }'>
          {{ formatDateTime(row.updatedTime) }}
        </template>
      </el-table-column>
      <el-table-column prop='remarks' label='备注' show-overflow-tooltip min-width='200px'>
        <template #default='{ row }'>{{ row.remarks || '-' }}</template>
      </el-table-column>
      <el-table-column label='操作' min-width='100px' fixed='right'>
        <template #default='{ row }'>
          <el-link type='primary' :underline='false' @click='onEdit(row)'>编辑
          </el-link>
          <el-divider direction='vertical'></el-divider>
          <el-link type='primary' :underline='false' @click='onDelete(row)'>删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <CreateProjectDialog ref='CreateProjectFormDialogRef' @done='onUpdateDataTable' />
  <EditProjectDialog ref='EditProjectFormDialogRef' @done='onUpdateDataTable' />
</template>
<style scoped lang='scss'></style>
