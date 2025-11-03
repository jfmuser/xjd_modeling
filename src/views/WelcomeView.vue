<script setup>
import { onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useEnv from '../hooks/useEnv.js';
import useAuthStore from '../stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { VITE_APP_TITLE, VITE_APP } = useEnv();
onBeforeMount(() => {
  // 如果有token自动登录
  if (localStorage.getItem('token')) {
    localStorage.setItem('autoLogin', 'on');
  }

  const authLogin = localStorage.getItem('autoLogin') === 'on';
  if (!authLogin) {
    return;
  }

  authStore.setIsLogin(true);
  if (VITE_APP === 'dept') {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    router.push({ name: 'crossroad' });
  } else if (VITE_APP === 'workspace') {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    router.push({ name: 'project' });
  } else if (VITE_APP === 'org') {
    const loginName = localStorage.getItem('loginName');
    if (!loginName) {
      return;
    }
    router.push({ name: 'monitor' });
  }
});

function gotoLogin() {
  router.push({ name: 'login', query: { ...route.query } });
}
</script>

<template>
  <div class="welcome-wrapper">
    <div class="title">{{ VITE_APP_TITLE }}</div>
    <div v-if="VITE_APP === 'org'" class="tip">
      您将作为协调方，开始创建联邦合作网络
    </div>
    <div class="action">
      <el-button type="primary" @click="gotoLogin">开始</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome-wrapper {
  text-align: center;

  .title {
    font-size: 70px;
    font-weight: 600;
    color: rgba(255, 255, 255, 1);
    white-space: nowrap;
    overflow-wrap: break-word;
  }

  .tip {
    overflow-wrap: break-word;
    color: rgba(255, 255, 255, 0.85);
    font-size: 20px;
    white-space: nowrap;
  }

  .action {
    margin-top: 4rem;
  }
}</style>
