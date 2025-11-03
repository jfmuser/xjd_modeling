<script setup>
import { reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { ROLE_TYPE, FormType } from '../../utils/const';
import { getUserList, addUser, editUser } from '../../apis/dept/user.api';

const formRef = ref(null);
const props = defineProps({
  partyOptions: {
    type: Array,
    required: true,
  },
});
const state = reactive({
  visible: false,
  loading: false,
  userSelectLoading: false,
  // TODO: creator should be currentUser
  model: { permissionList: [], creator: 'admin' },
  type: '',
  userOptions: [],
  permissionOptions: [
    'FATE Cloud: Basic management',
    'FATE Cloud: Auto-deploy',
    'FATE Studio',
    'FATEBoard',
  ],
});
const rules = reactive({
  userName: [{ required: true }],
});
const roleOptions = computed(() => {
  return Object.keys(ROLE_TYPE).map((key) => ({
    value: ROLE_TYPE[key],
    label: key,
  }));
});

const title = computed(() => {
  return `${state.type.label}用户`;
});

function show(val) {
  state.type = new FormType(val ? FormType.EDIT : FormType.CREATE);
  if (state.type.isEdit) {
    const { userName, role } = val;
    state.model.userId = userName;
    state.model.userName = userName;
    state.model.roleId = role.roleId;
    onRoleChange(state.model.roleId);
  }
  state.visible = true;
}

defineExpose({ show });
const emits = defineEmits(['done']);
function onClose() {
  formRef.value.resetFields();
  state.visible = false;
}

async function onConfirm() {
  try {
    const isValid = await formRef.value.validate().catch(() => {});
    if (!isValid) {
      return;
    }

    state.loading = true;
    if (state.type.isEdit) {
      await editUser(state.model);
    } else {
      await addUser(state.model);
    }
    ElMessage.success('操作成功');
    emits('done');
  } catch (error) {
    ElMessage.error(error.desc || '操作失败');
  } finally {
    state.loading = false;
  }
}

async function remoteMethod(context) {
  if (!context) {
    return;
  }
  try {
    state.userSelectLoading = true;
    const response = await getUserList({ context });
    state.userOptions = response;
  } finally {
    state.userSelectLoading = false;
  }
}

function onRoleChange(val) {
  if (val === ROLE_TYPE['管理员']) {
    state.model.permissionList = state.permissionOptions;
  } else if (val === ROLE_TYPE['开发或运维']) {
    state.model.permissionList = state.permissionOptions.filter((_, index) =>
      [0, 1].includes(index),
    );
  } else if (val === ROLE_TYPE['市场人员或数据分析师']) {
    state.model.permissionList = state.permissionOptions.filter((_, index) =>
      [2, 3].includes(index),
    );
  }
}
</script>

<template>
  <el-dialog
    v-model="state.visible"
    :before-close="onClose"
    :title="title"
    width="550px"
  >
    <el-form
      ref="formRef"
      label-width="80px"
      :model="state.model"
      :rules="rules"
    >
      <el-form-item label="用户名" prop="userName">
        <el-select
          v-model="state.model.userName"
          placeholder="请输入用户名"
          filterable
          remote
          :loading="state.userSelectLoading"
          :remote-method="remoteMethod"
          :disabled="state.type.isEdit"
          style="width: 100%"
          @change="
            (val) => {
              state.model.userId = val;
            }
          "
        >
          <el-option
            v-for="item in state.userOptions"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门角色" prop="roleId">
        <el-select
          v-model="state.model.roleId"
          clearable
          style="width: 100%"
          @change="onRoleChange"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="state.model.roleId === ROLE_TYPE['市场人员或数据分析师']"
        label="部门"
      >
        <el-select v-model="state.model.partyId" clearable style="width: 100%">
          <el-option
            v-for="item in props.partyOptions"
            :key="item.partyId"
            :label="item.siteName"
            :value="item.partyId"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="权限" prop="permissionList" class="permission-list">
        <el-checkbox-group v-model="state.model.permissionList" disabled>
          <el-checkbox
            v-for="item in state.permissionOptions"
            :key="item"
            :label="item"
          >
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.permission-list {
  .el-checkbox-group {
    display: flex;
    flex-direction: column;
  }
}
</style>
