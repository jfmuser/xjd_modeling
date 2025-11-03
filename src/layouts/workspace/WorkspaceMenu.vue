<script setup>
import { onBeforeMount, onMounted, onUnmounted, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getLabel, canShow } from '../../router';
import { getUnreadCount } from '../../apis/workspace/message.api';
import useApprovalStore from '../../stores/dept/approval.store';
import useEnv from '../../hooks/useEnv';
import useAuthStore from '../../stores/auth.store';
import useMenuStore from '../../stores/menu.store';
import MenuItem from '../../components/MenuItem.vue';
import { Setting } from '@element-plus/icons-vue';

let msgInterval;
const authStore = useAuthStore();
const menuStore = useMenuStore();
const approvalStore = useApprovalStore();
const { VITE_APP_SWITCH_NOTIFICATION, VITE_NOTIFICATION_DELAY } = useEnv();
const router = useRouter();
const route = useRoute();
const state = reactive({
  unreadMessageCount: null,
});

const menus = computed(() => {
  const result = [
    { id: 1, name: 'deptSupervise' },
    { id: 2, name: 'data', nest: true },
    { id: 3, name: 'algorithm' },
    { id: 4, name: 'project' },
    { id: 5, name: 'model' },
    { id: 6, name: 'ApplicationConfiguration' ,nest:true},
    { id: 7, name: 'threatTerm', nest: true },
    { id: 8, name: 'authUser' },
    { id: 9, name: 'authRole' },
    { id: 10, name: 'auditManagement' },
    {
      id: 11,
      name: 'deptManagement',
    },
    { id: 12, name: 'appCenter'},
    // { id: 4, name: 'VulnerabilityDetection' },
    // { id: 10, name: 'DataRelease' },
    // { id: 11, name: 'monitor', nest: true },
    // { id: 11, name: 'approval' },
    // { id: 10, name: 'blockchain',nest:true },
    // { id: 13, name: 'message' },
    // { id: 12, name: 'config', nest: true },
  ];
  // return result.filter((item) => canShow(item.name, authStore.permissions));
  return result.filter((item) => {
    // if (item.name === 'monitor' || item.name === 'config') {
    //   return true;
    // }
    if (item.name === 'config') {
      return true;
    }
    return canShow(item.name, authStore.permissions);
  });
});
// onBeforeMount(() => {
//   if (msgInterval) {
//     clearInterval(msgInterval);
//   }
// });

// onMounted(() => {
  // mounted();
// });

// onUnmounted(() => {
  // clearInterval(msgInterval);
// });
function mounted() {
  getUnreadMessageCount();
  if (VITE_APP_SWITCH_NOTIFICATION === 'off') {
    return;
  }
  msgInterval = setInterval(() => {
    setTimeout(() => {
      getUnreadMessageCount();
    }, 0);
  }, Number(VITE_NOTIFICATION_DELAY));
}
function handleSelect(key) {
  router.push({ name: key });
}
async function getUnreadMessageCount() {
  state.unreadMessageCount = await getUnreadCount();
}
</script>

<template>
  <el-menu :default-active="route.name" :collapse="menuStore.collapse" :collapse-transition="false"
    @select="handleSelect" mode="vertical">
    <MenuItem v-for="item in menus" :key="item.id" :name="item.name" :nest="item.nest">
    <template #nest>
      <!-- <template v-if="item.name === 'monitor'">
        <el-sub-menu index="monitor" v-if="canShow('monitorCooperation', authStore.permissions) ||
          canShow('monitorJob', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="统计监控" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 16px;margin-right: 0;">
                <Histogram />
              </el-icon>
            </el-tooltip>
            <span>统计监控</span>
          </template>
          <el-menu-item index="monitorCooperation" v-if="canShow('monitorCooperation', authStore.permissions)">
            <span class="sub-menu-title">{{
              getLabel('monitorCooperation')
            }}</span>
          </el-menu-item>
          <el-menu-item index="monitorJob" v-if="canShow('monitorJob', authStore.permissions)">
            <span class="sub-menu-title">{{ getLabel('monitorJob') }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template> -->
      <template v-if="item.name === 'ApplicationConfiguration'">
        <el-sub-menu class="menu_name" index="ApplicationConfiguration" v-if="canShow('ApplicationConfiguration', authStore.permissions) ||
          canShow('ApplicationConfiguration', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="可信管控" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 20px;margin-right: 0;">
                <Connection />
              </el-icon>
            </el-tooltip>
            <span>可信管控</span>
          </template>
          <el-menu-item index="blockchain" v-if="canShow('blockchain', authStore.permissions)"
            class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('blockchain')
            }}</span>
          </el-menu-item>
          <el-menu-item index="smartContracts" v-if="canShow('smartContracts', authStore.permissions)"
            class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('smartContracts')
            }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
      <template v-if="item.name === 'data'">
        <el-sub-menu index="data" v-if="canShow('data', authStore.permissions) ||
          canShow('data', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="数据管理" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 20px;margin-right: 0;"><Coin /></el-icon>
            </el-tooltip>
            <span>数据管理</span>
          </template>
          <el-menu-item index="data" v-if="canShow('data', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('data')
            }}</span>
          </el-menu-item>
          <el-menu-item index="dataSource" v-if="canShow('dataSource', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('dataSource')
            }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
      <template v-if="item.name === 'threatTerm'">
        <el-sub-menu index="threatTerm" v-if="canShow('threatTerm', authStore.permissions) ||
          canShow('threatTerm', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="风险防护" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 20px;margin-right: 0;">
                <WarningFilled />
              </el-icon>
            </el-tooltip>
            <span>风险防护</span>
          </template>
          <el-menu-item index="threatTerm" v-if="canShow('threatTerm', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('threatTerm')
            }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
      <!-- <template v-if="item.name === 'project'">
        <el-sub-menu index="project" v-if="canShow('project', authStore.permissions) ||
          canShow('project', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="模型管理" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 20px;margin-right: 0;">
                <Setting />
              </el-icon>
            </el-tooltip>
            <span>模型管理</span>
          </template>
          <el-menu-item index="project" v-if="canShow('project', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('project')
            }}</span>
          </el-menu-item>
          <el-menu-item index="model" v-if="canShow('model', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('model')
            }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template> -->
      <!-- <template v-if="item.name === 'blockchain'">
        <el-sub-menu index="blockchain" v-if="canShow('blockchain', authStore.permissions) ||
          canShow('blockchain', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="区块链管理" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 16px;margin-right: 0;">
                <Setting />
              </el-icon>
            </el-tooltip>
            <span>区块链管理</span>
          </template>
          <el-menu-item index="blockchain" v-if="canShow('blockchain', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('blockchain')
            }}</span>
          </el-menu-item>
          <el-menu-item index="blockchainConfig" v-if="canShow('blockchainConfig', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('blockchainConfig')
            }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template> -->
      <!-- <template v-if="item.name === 'appCenter'">
        <el-sub-menu index="appCenter" v-if="canShow('appCenter', authStore.permissions) ||
          canShow('appCenter', authStore.permissions)
          ">
          <template #title>
            <el-tooltip content="应用中心" placement="top" :disabled="!menuStore.collapse">
              <el-icon style="width: 16px;margin-right: 0;">
                <Setting />
              </el-icon>
            </el-tooltip>
            <span>应用管理</span>
          </template>
          <el-menu-item index="appCenter" v-if="canShow('appCenter', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('appCenter')
            }}</span>
          </el-menu-item>
          <el-menu-item index="ApplicationConfiguration" v-if="canShow('ApplicationConfiguration', authStore.permissions)" class="el-menu-item">
            <span class="sub-menu-title">{{
              getLabel('ApplicationConfiguration')
            }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template> -->
    </template>
    <template #default>
      <el-badge v-if="item.name === 'approval'" v-show="approvalStore.todoApprovals.length > 0"
        :hidden="menuStore.collapse" :value="approvalStore.todoApprovals.length" />
      <el-badge v-if="item.name === 'message' && state.unreadMessageCount > 0" :hidden="menuStore.collapse"
        :value="state.unreadMessageCount + approvalStore.todoApprovals.length" class="item" />
    </template>
    </MenuItem>
  </el-menu>
</template>

<style scoped>
span {
  font-size: 22px;
}
.sub-menu-title {
  /* text-indent: 1rem; */
}

:deep .el-sub-menu__icon-arrow {
  right: 7px !important;
}

/* :deep .el-menu {
  background: linear-gradient(180deg, #0A6580 0%, #005B72 100%);

} */


.el-menu-item {
  color: #fff;
}



.menu_name{
  color: rgba(255, 255, 255, 0.65);
}


  .el-menu--horizontal > .el-sub-menu.is-active :deep(.el-sub-menu__title) {
  color: #fff;
  background-color: rgba(67, 118, 255, 0.5);
}

.el-menu--horizontal > .el-sub-menu :deep(.el-sub-menu__title) {
border-bottom: 0;
}
</style>
