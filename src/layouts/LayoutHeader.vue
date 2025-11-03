<script setup>
import { inject, onMounted, ref, reactive } from 'vue';
import useAuthStore from '../stores/auth.store';
import { useLocalStorage } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { SHOW_PASSWORD_DIALOG } from '../utils/key';
import WorkspaceMenu from './workspace/WorkspaceMenu.vue';
import UpdateUsername from '../components/dept/UpdateUsername.vue';
import useEnv from '../hooks/useEnv.js';

const {  VITE_APP_TITLE } = useEnv();
const router = useRouter();
const showPasswordDialog = inject(SHOW_PASSWORD_DIALOG);
const resetPasswordRequired = useLocalStorage('resetPasswordRequired');
const authStore = useAuthStore();
const updateUsernameDialogConfig = reactive({ dialogVisible: false,username:'' ,userId:''});

onMounted(() => {
  if (resetPasswordRequired.value === 'on') {
    showPasswordDialog();
  }
});

async function logout() {
  await authStore.logout(() => {
    authStore.loginStatus = false
    localStorage.clear();
    sessionStorage.clear();
    let routerList = router.getRoutes()
    routerList.forEach(item => {
      if (item.name === 'login' || item.name === 'home' || item.name === 'crossroad' || item.name === '404') return
      router.removeRoute(item.name)
    })
    router.push({ name: 'login' });
  });
}

function updateUserName() {
  updateUsernameDialogConfig.dialogVisible = true
  updateUsernameDialogConfig.userId = authStore.userInfo.id
    updateUsernameDialogConfig.username = authStore.userInfo.username

}

function closeUpdateUsernameDialog() {
  updateUsernameDialogConfig.dialogVisible = false

}

</script>
<template>
  <div class="header-wrapper">
    <!-- <div class="logo">
      <img src="../assets/logo_header_learn.svg" alt="logo" height="24" />
    </div> -->
    <!-- <div class="content-title" style="color: white; width: 1.7578125rem;font-size: 0.09375rem;font-weight: 700;font-family: 'Simsun'; margin-left: 0.078125rem;margin-right: 0.1171875rem;"> -->
    <div class="content-title" style="color: white; width: 2000px;font-size: 28px;font-weight: 700;font-family: 'Simsun'; margin-left: 0.078125rem;margin-right: 0.1171875rem;">
      <!-- 卷积云机构名称 -->
      {{ VITE_APP_TITLE }}
    </div>
    <!-- <div class="menu-wrapper" v-if="hash !== 'crossroad'">
      <WorkspaceMenu />
    </div> -->
    <el-menu mode="horizontal" background-color="#101525" text-color="#fff">
      <el-sub-menu index="profile">
        <template #title>
          <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
          <div style="margin-left: 0.01953125rem;font-size: 14px;">{{ authStore.loginName }}</div>
        </template>
        <el-menu-item index="update" style="font-size: 16px;" @click="updateUserName">修改登陆名</el-menu-item>
        <el-menu-item index="logout" style="font-size: 16px;" @click="logout">退出系统</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
   <UpdateUsername :dialogVisible="updateUsernameDialogConfig.dialogVisible" :username="updateUsernameDialogConfig.username" 
    :userId="updateUsernameDialogConfig.userId" @close="closeUpdateUsernameDialog"/>
</template>
<style scoped lang="scss">
.header-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  // background: $layoutHeaderBackgroundColor;
  // background: linear-gradient(180deg, #0A6580 0%, #005B72 100%);
    background: linear-gradient(180deg, #19328e 0%, rgba(25, 50, 142, 0.98) 100%);
  // background: linear-gradient(180deg, #012c61 0%, #053269 100%);

  .logo {
    width: $menuWidth;
    padding: 0 20px;
  }

  .el-menu {
    // width: calc(100% - $menuWidth);
    width: 100%;
    border-bottom: 0;
    background: $layoutHeaderBackgroundColor;
    height: $headerHeight;
    display: flex;
    justify-content: flex-end;
    background-color: transparent;
  }
}

.menu-wrapper {
  width: 50%;
  height: 100%;
  // background: linear-gradient(180deg, #0f1526 0%, #1e2434 100%);
  // background: linear-gradient(180deg, #0A6580 0%, #005B72 100%);
    background: linear-gradient(180deg, #19328e 0%, rgba(25, 50, 142, 0.98) 100%);
  // background: linear-gradient(180deg, #012c61 0%, #053269 100%);
  opacity: 0.94;
  position: relative;

  :deep .el-menu {
    background-color: transparent;
    color: #fff;
    border: 0;

    .el-menu-item,
    .el-sub-menu__title {
      color: rgba(255, 255, 255, 0.65);
      height: 0.1875rem;
      gap: 7px;
      // font-size: 0.0625rem;
      font-size: 20px;

      &.is-active {
        color: #fff !important;
        // background: linear-gradient(270deg,
        //     rgba(67, 118, 255, 0) 0%,
        //     rgba(67, 118, 255, 0.5) 100%);
        background-color: rgba(67, 118, 255, 0.5);

      }

      &:hover {
        // background: linear-gradient(270deg,
        //     rgba(67, 118, 255, 0) 0%,
        //     rgba(67, 118, 255, 0.5) 100%);
        background-color: rgba(67, 118, 255, 0);
        transform: scale(1.05);
        color: #fff;
      }
    }

    .el-badge {
      transform: translateY(-50%);
    }
  }
}

:deep .el-tooltip__trigger {
  // background: linear-gradient(180deg, #0A6580 0%, #005B72 100%);
    background: linear-gradient(180deg, #19328e 0%, rgba(25, 50, 142, 0.98) 100%);
  // background: linear-gradient(180deg, #012c61 0%, #053269 100%);
}
</style>
