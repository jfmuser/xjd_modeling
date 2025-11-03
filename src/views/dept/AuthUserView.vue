<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import { getUsers, deleteUser } from '../../apis/dept/auth.api';
import UserAuthFormDialog from '../../components/dept/UserAuthFormDialog.vue';
import { UsageStatus } from '../../utils/const';
import BindRoleDialog from './BindRoleDialog.vue';
import useAuthStore from '@/stores/auth.store';
import UpdateUsername from '../../components/dept/UpdateUsername.vue';

const authStore = useAuthStore();
const UserAuthFormDialogRef = ref(null);
const TableContainerRef = ref(null);
const state = reactive({
  loading: false,
  search: {},
  tableData: [],
});
const bindRoleDialogConfig = reactive({ visible: false, userId: null });
const updateUsernameDialogConfig = reactive({ dialogVisible: false,username:'' ,userId:''});

onMounted(() => {
  console.log(authStore.userInfo,'UserInfo');
  authStore.asyncAuthority()
  fetchTableData();
});

async function fetchTableData(page) {
  try {
    const pager = TableContainerRef.value.pager;
    state.loading = true;
    const response = await getUsers({
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
  UserAuthFormDialogRef.value.show();
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
  console.log(id, authStore.userInfo.username, 'OPOPOPOP');
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
    await deleteUser(id);
    ElMessage.success('删除成功');
    fetchTableData();
  } catch (error) {
    ElMessage.error(error || '删除失败');
    console.error(error);
  }
}

function onEdit(row) {
  UserAuthFormDialogRef.value.show(row);
}
function onBind(val) {
  bindRoleDialogConfig.visible = true;
  bindRoleDialogConfig.userId = val;
}

function openUpdateUsernameDialogConfig(row) {
  updateUsernameDialogConfig.dialogVisible = true
  updateUsernameDialogConfig.username = row.username
  updateUsernameDialogConfig.userId = row.id
}

function closeUpdateUsernameDialog() {
  updateUsernameDialogConfig.dialogVisible = false
fetchTableData()
}
</script>

<template>
  <TableContainer ref="TableContainerRef" v-loading="state.loading" title="用户管理" @search="onSearch" @add="onAdd"
    @page-change="onPageChange" :showImport="false">
    <template #filter>
      <FilterItem label="名称">
        <el-input v-model="state.search.nickname"></el-input>
      </FilterItem>
    </template>
    <el-table :data="state.tableData">
      <el-table-column label="ID" fixed prop="id" show-overflow-tooltip></el-table-column>
      <el-table-column label="登录名" prop="username" min-width="160px"></el-table-column>
      <el-table-column label="名称" min-width="150px" prop="nickname">
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          {{ UsageStatus.getLabel(row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="账号有效期" width="160px" prop="expireTime"></el-table-column>
      <el-table-column label="创建日期" min-width="180px" prop="createdTime">
      </el-table-column>
      <el-table-column label="更新日期" min-width="180px" prop="updatedTime">
      </el-table-column>
      <el-table-column label="创建人" prop="creator"></el-table-column>
      <el-table-column label="更新人" prop="updatedUser"></el-table-column>
      <el-table-column label="备注" prop="remarks"></el-table-column>
      <el-table-column label="操作" fixed="right" min-width="200px">
        <template #default="{ row }">
          <el-link type="danger" :underline="false" @click="onDelete(row.id)"
            :disabled="row.username === authStore.userInfo.username" v-permission="'delete'">
            删除
          </el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="primary" :underline="false" @click="onEdit(row)" v-permission="'edit'">
            编辑
          </el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="primary" :disabled="row?.userRoleList && row.userRoleList[0]?.role.tag == 1" :underline="false" @click="onBind(row.id)" v-permission="'binding'" >
            绑定角色
          </el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="primary" :disabled="!authStore.userInfo.admin && !(row.id === authStore.userInfo.id)" :underline="false" @click="openUpdateUsernameDialogConfig(row)" >
            修改登录名
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <UserAuthFormDialog ref="UserAuthFormDialogRef" @done="() => {
    fetchTableData();
  }
    "></UserAuthFormDialog>
  <BindRoleDialog v-if="bindRoleDialogConfig.visible" :userId="bindRoleDialogConfig.userId" @close="() => {
    bindRoleDialogConfig.visible = false;
    bindRoleDialogConfig.userId = null;
  }
    "></BindRoleDialog>
    <UpdateUsername :dialogVisible="updateUsernameDialogConfig.dialogVisible" :username="updateUsernameDialogConfig.username" 
    :userId="updateUsernameDialogConfig.userId" @close="closeUpdateUsernameDialog"/>
</template>

<style scoped></style>
