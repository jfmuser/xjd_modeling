<script setup>
import { useRouter, useRoute } from 'vue-router';


const router = useRouter();
const route = useRoute();

function onBack() {
  router.push({ path: '/', query: {redirect: route.path} })
}
</script>
<template>
  <el-result icon="error" sub-title="您访问的页面不存在">
    <template #extra>
      <el-button type="primary" @click="onBack">返回</el-button>
    </template>
  </el-result>
</template>
<style scoped></style>
