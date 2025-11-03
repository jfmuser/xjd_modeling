<script setup>
import { reactive, ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { getSiteList } from '../../apis/dept/user.api';
import {
  getAllRole,
  getUserRoleList,
  updateUserRole,
} from '../../apis/dept/auth.api';
import { RoleCategory } from '../../utils/const';

const platformRoleRef = ref(null);
const props = defineProps({ userId: { type: Object, default: () => ({}) } });
const state = reactive({
  loading: false,
  siteList: [],
  allRole: [],
});
const emits = defineEmits(['close']);
const platformRoleList = computed(() =>
  state.allRole.filter((item) => item.type === RoleCategory.PLATFORM),
);
const deptRoleList = computed(() =>
  state.allRole
    .filter((item) => item.type === RoleCategory.DEPT)
    .map((item) => ({
      ...item,
      disabled: true,
      children: state.siteList.map((siteItem) => ({
        ...siteItem,
        __type: 'site',
        id: `${item.id}--${siteItem.siteName}`,
      })),
    })),
);
const allDeptTags = computed(() => {
  return deptRoleList.value.reduce((result, current) => {
    if (current.children) {
      result.push(
        ...current.children.map((i) => ({
          ...i,
          id: i.id,
          label: `${current.code} ${current.name}/${i.siteName}`,
        })),
      );
    }
    result.push({
      ...current,
      id: current.id,
      label: `${current.code} ${current.name}`,
    });
    return result;
  }, []);
});
const selectedPlatformTreeIds = computed(() =>
  platformRoleRef.value.getCheckedKeys(),
);
const selectedPlatformRoles = computed(() => {
  if (!platformRoleRef.value) {
    return [];
  }
  return platformRoleList.value.filter((item) =>
    selectedPlatformTreeIds.value.includes(item.id),
  );
});


onMounted(async () => {
  await nextTick();
  fetchCurrent();
  // fetchSiteList();
  fetchList();
});

function onClose() {
  emits('close');
}

async function onConfirm() {
  try {
    state.loading = true;
    if (selectedPlatformRoles.value.length > 1) {
      return ElMessage.error('最多只能选择一个角色进行绑定')
    }
    const payload = [
      ...selectedPlatformRoles.value.map((item) => ({
        roleId: item.id,
      })),
    ];
    console.log(props.userId,payload,'LLLLLLLLKKKKKKKKKKKKKKKKKK');
    
    await updateUserRole({ userId: props.userId, payload });
    await fetchCurrent();
    ElMessage.success('操作成功');
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

async function fetchSiteList() {
  try {
    const response = await getSiteList();
    state.siteList = response;
  } catch (error) {
    console.error(error);
    state.siteList = [];
  }
}

async function fetchList() {
  try {
    state.loading = true;
    const response = await getAllRole();
    state.allRole = response;
  } catch (error) {
    console.error(error);
    state.allRole = [];
  } finally {
    state.loading = false;
  }
}

async function fetchCurrent() {
  try {
    state.loading = true;
    const response = await getUserRoleList({
      userId: props.userId,
    });
    const roleSystem = response.reduce((result, current) => {
      const systemInfo = current.systemInfo;
      const roleId = current.role.id;
      if (!result[roleId]) {
        result[roleId] = [];
      }
      if (systemInfo) {
        result[roleId].push(systemInfo);
      }
      return result;
    }, {});
    state.allRole.forEach((item) => {
      const systemNames = roleSystem[item.id];
      if (systemNames && systemNames.length > 0) {
        item.systemNames = systemNames.map((item) => item.name);
      }
    });

    platformRoleRef.value.setCheckedKeys(
      response
        .filter((item) => item.role.type === RoleCategory.PLATFORM)
        .map((item) => item.role.id),
    );
  } finally {
    state.loading = false;
  }
}

function onUnselect(id) {
  // if (type === 'platform') {
  platformRoleRef.value.setCheckedKeys(
    selectedPlatformTreeIds.value.filter((item) => item !== id),
  );
  // }
}
</script>
<template>
  <el-dialog v-loading="state.loading" :model-value="true" :before-close="onClose" title="绑定角色" :show-close="false"
    width="500px">
    <div>
      <el-form label-width="140px">
        <el-form-item label="部门管理平台角色">
          <el-popover :width="350" trigger="click">
            <template #reference>
              <el-input placeholder="请选择部门管理平台角色" :suffix-icon="ArrowDown" readonly style="width: 350px"></el-input>
            </template>
            <el-tree ref="platformRoleRef" :data="platformRoleList" show-checkbox node-key="id">
              <template #default="{ data }">
                <div class="auth-tree-node">
                  <div>{{ data.code }}</div>
                  <div>{{ data.name }}</div>
                </div>
              </template>
            </el-tree>
          </el-popover>
        </el-form-item>
        <div v-if="selectedPlatformRoles.length > 0" class="selected-roles">
          <el-tag v-for="item in selectedPlatformRoles" :key="item.id" closable type="primary"
            @close="onUnselect(item.id)">
            <div class="auth-tree-node">
              <div>{{ item.code }}</div>
              <div>{{ item.name }}</div>
            </div>
          </el-tag>
        </div>
        <el-empty v-else></el-empty>

        <!-- <el-form-item label="部门角色">
          <el-popover :width="350" trigger="click">
            <template #reference>
              <el-input
                placeholder="请选择部门角色"
                :suffix-icon="ArrowDown"
                readonly
                style="width: 350px"
              ></el-input>
            </template>
            <el-tree
              ref="deptRoleRef"
              :data="deptRoleList"
              show-checkbox
              node-key="id"
              default-expand-all
              check-strictly
            >
              <template #default="{ data }">
                <div class="auth-tree-node">
                  <template v-if="data.__type === 'site'">
                    <div>部门列表</div>
                    <div>{{ data.siteName }}</div>
                  </template>
                  <template v-else>
                    <div>{{ data.code }}</div>
                    <div>{{ data.name }}</div>
                  </template>
                </div>
              </template>
            </el-tree>
          </el-popover>
        </el-form-item>
        <div v-if="selectedDeptRoles.length > 0" class="selected-roles">
          <el-tag
            v-for="item in selectedDeptRoles"
            :key="item.id"
            closable
            type="primary"
            @close="onUnselect('dept', item.id)"
          >
            <div class="auth-tree-node">
              <div>{{ item.label }}</div>
            </div>
          </el-tag>
        </div>
        <el-empty v-else></el-empty> -->
      </el-form>
    </div>
    <template #footer>
      <el-button type="primary" @click="onConfirm">确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.selected-roles {
  display: flex;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 16px;
}

.auth-tree-node {
  display: grid;
  gap: 10px;
  width: 100%;
  grid-template-columns: 1fr 1fr;
}

:deep .el-empty {
  padding: 0;

  &__description {
    margin: 0 0 10px;
  }
}

:deep .el-empty__image {
  display: none;
}
</style>
