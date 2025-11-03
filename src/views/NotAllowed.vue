<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

function onBack() {
  router.push('/');
}
</script>
<template>
  <el-result icon="warning" sub-title="您没有权限访问此页面">
    <template #extra>
      <el-button type="primary" @click="onBack">返回</el-button>
    </template>
  </el-result>
</template>
<style scoped></style>
