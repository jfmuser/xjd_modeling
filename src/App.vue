<script setup>
import { computed, watch, ref, provide, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { useLocalStorage } from '@vueuse/core';
import useAuthStore from './stores/auth.store.js';
import useEnv from './hooks/useEnv.js';
import { SHOW_PASSWORD_DIALOG } from './utils/key.js';
// 登录获取getkey cookie
import { getlogin } from '../src/apis/workspace/auth.api.js';
import { security, fblogin } from '../src/apis/workspace/job.api';
import rsa from '../src/utils/encrypt';
const resetPasswordRequired = useLocalStorage('resetPasswordRequired');
const env = useEnv();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const finishToken = ref(null);
const timer = setInterval(() => {
  if (localStorage.getItem('token')) {
    finishToken.value = localStorage.getItem('token');
  }
}, 1000);

watch(
  () => finishToken.value,
  (newval, oldeval) => {
    // alert(989898);
    if (newval) {
      initFetch();
      clearInterval(timer);
    }
    // console.log('你看有没有token', newval, oldeval);
  },
  { immediate: true, deep: true },
);

const initFetch = async () => {
  // if (VITE_APP == 'workspace') {
  //   //getkey fb 获取密钥对密码加密  getkey
  //   const securityInfo = await security();
  //   let securityData = '';
  //   if (securityInfo && securityInfo.data) {
  //     securityData = securityInfo.data;
  //   }
  //   // 获取系统登录信息
  //   const getInfo = await getlogin();
  //   // 加密
  //   const password = rsa(securityData, getInfo.password);
  //   // console.log('你猜猜呵呵呵', password);
  //   //fb login 再次登录设置cookie
  //   await fblogin(getInfo.username, password);
  // }
};
// watch(
//   () => authStore.isLogin,
//   (val) => {
//     if (!val && route.name !== 'welcome') {
//       router.push({
//         name: 'welcome',
//         query: {
//           redirect: route.fullPath,
//         },
//       });
//     }
//   },
// );

const layout = computed(() => {
  return route.meta.layout;
});
</script>

<template>
  <el-config-provider :locale="zhCn"
                      :button="{ autoInsertSpace: false }">
    <component :is="layout"
               :class="{ product: !env.DEV }" />
  </el-config-provider>
  <el-tooltip effect="dark"
              content=""
              placement="top">
    <span style="position: absolute; left: -2000px; top: -1000px"
          class="tooltip-widget" />
  </el-tooltip>
  <div class="tooltip-widget1" />
</template>

<style lang="scss">
body {
  border: 0;
  margin: 0;
  font-size: 14px;
}

* {
  box-sizing: border-box;
}

input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 600000s 0s, color 600000s 0s;
}

.product {
  user-select: none;
}

.el-menu--horizontal > .el-menu-item .is-active {
  color: #fff;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  position: relative;
}

.tooltip-widget1 {
  position: absolute;
  .custom-tooltip {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    padding: 12px;
    font-size: 12px;
    width: 260px;
    .tooltip-item {
      margin-bottom: 4px;
      display: flex;
      gap: 5px;
      align-items: center;
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .success {
        background-color: #52c41a;
      }
      .fail {
        background-color: #ff4d4f;
      }
    }
    .result {
      color: #0068fa;
      background-color: #00000008;
      padding: 4px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .icon {
      width: 14px;
      height: 14px;
      color: #0068fa;
      cursor: pointer;
    }
  }
}

.tooltip-widget1::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 5px 5px;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
}
</style>
