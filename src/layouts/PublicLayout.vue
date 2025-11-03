<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const currentYear = new Date().getFullYear();
</script>

<template>
  <div class="layout-wrapper" :class="route.name">
    <!-- <img src="../assets/logo.svg" class="logo" /> -->
    <div class="content">
      <router-view></router-view>
    </div>
    <div class="copyright">
      <!-- Copyright &copy; 2020 - {{ currentYear }} Conv Cloud. -->
    </div>
  </div>
</template>

<style scoped lang="scss">
$headerHeight: 50px;
$footerHeight: 20px;

.layout-wrapper {
  height: 100%;
  width: 100%;

  background-repeat: no-repeat;
  background-size: cover;
  padding: 2rem;
  min-height: 400px;

  &.welcome {
    background-image: url('../assets/bg_blur.png');
  }

  &.login {
    // background-image: url('../assets/bg.png');
    // background-image: url('../assets/bg1.jpg');
    background-image: url('../assets/bg.jpeg');
    transform: translate(180deg);
    // background-size: contain;
    background-color: #102440;
  }

  .logo {
    height: $headerHeight;
  }

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100% - $headerHeight - $footerHeight);
  }

  .copyright {
    height: $footerHeight;
    overflow-wrap: break-word;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    white-space: nowrap;
    line-height: 20px;
    text-align: center;
  }
}
</style>
