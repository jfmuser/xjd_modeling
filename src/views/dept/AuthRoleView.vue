<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import { deleteRole, getRoles } from '../../apis/dept/auth.api';
import { YES_NO } from '../../utils/const';
import RoleAuthFormDialog from '../../components/dept/RoleAuthFormDialog.vue';
import { useRouter } from 'vue-router';

const BindAuthDialogRef = ref(null);
const RoleAuthFormDialogRef = ref(null);
const TableContainerRef = ref(null);
const router = useRouter()
const state = reactive({
  loading: false,
  search: {},
  tableData: [],
});

onMounted(() => {
  fetchTableData();
});

async function fetchTableData(page) {
  try {
    const pager = TableContainerRef.value.pager;
    state.loading = true;
    const response = await getRoles({
      page: page || pager.page,
      size: pager.size,
      payload: state.search,
    });
    const { records, current, size, total } = response;
    state.tableData = records;
    pager.size = size;
    pager.page = current;
    pager.total = total;
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}
function onAdd() {
  RoleAuthFormDialogRef.value.show();
}
function onSearch(reset) {
  if (reset) {
    state.search = {};
  }
  fetchTableData(1);
}
function onPageChange(page) {
  fetchTableData(page);
}
async function onDelete(id) {
  const confirm = await ElMessageBox.confirm(
    `此操作将永久删除, 是否继续?`,
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
    await deleteRole(id);
    ElMessage.success('删除成功');
    fetchTableData();
  } catch (error) {
    ElMessage.error(error || '删除失败');
    console.error(error);
  }
}

function onEdit(row) {
  RoleAuthFormDialogRef.value.show(row);
}
function onBind(id, type) {
  // BindAuthDialogRef.value.show(id, type);
  router.push({
    path: '/auth-role-permission', query: {
      id: id,
      type: type
    }
  })
}
</script>

<template>
  <TableContainer ref="TableContainerRef" v-loading="state.loading" title="角色管理" @search="onSearch" @add="onAdd"
    :showImport="false" :showSync="true" @page-change="onPageChange">
    <template #filter>
      <FilterItem label="角色名">
        <el-input v-model="state.search.name"></el-input>
      </FilterItem>
      <FilterItem label="角色编码">
        <el-input v-model="state.search.code"></el-input>
      </FilterItem>
    </template>
    <el-table :data="state.tableData">
      <el-table-column label="角色编码" prop="code" fixed min-width="200px"></el-table-column>
      <el-table-column label="角色名" prop="name" min-width="200px">
      </el-table-column>
      <el-table-column label="是否是超级管理员" min-width="150px">
        <template #default="{ row }">
          {{ YES_NO(row.tag) }}
        </template>
      </el-table-column>

      <el-table-column label="创建人" prop="creator"></el-table-column>
      <el-table-column label="创建日期" min-width="180px" prop="createdTime">
      </el-table-column>
      <el-table-column label="更新人" prop="updatedUser"></el-table-column>
      <el-table-column label="更新日期" min-width="180px" prop="updatedTime">
      </el-table-column>
      <el-table-column label="备注" prop="remarks"></el-table-column>
      <el-table-column label="操作" fixed="right" min-width="200px">
        <template #default="{ row }">
          <el-link type="danger" :underline="false" @click="onDelete(row.id)" v-permission="'delete'">删除
          </el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="primary" :underline="false" @click="onEdit(row)" v-permission="'edit'">编辑
          </el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="primary" :disabled="row.tag === 1" :underline="false" @click="onBind(row.id, row.type)"
            v-permission="'binding'">
            绑定权限
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <RoleAuthFormDialog ref="RoleAuthFormDialogRef" @done="() => {
    fetchTableData();
  }
    "></RoleAuthFormDialog>
</template>

<style scoped></style>
