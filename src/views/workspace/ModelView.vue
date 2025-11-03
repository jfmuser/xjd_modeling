<script setup>
import ModelCatalog from '../../components/workspace/ModelCatalog.vue';
import CatalogTableContainer from '../../layouts/CatalogTableContainer.vue';
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import ModelInfo from '../../components/workspace/ModelInfo.vue';
// fateBoard
import FateBoard from '@/components/workspace/iframe/FateBoard.vue';
const route = useRoute();
const modelVersion = computed(() => Number(route.query.modelVersion));

// 是否显示FateBoard
const allShow = ref(true);
// FATE 作业ID
const FateBoardUrl = ref('');
// 接收子组件传值
const handelJobDetail = (val) => {
  FateBoardUrl.value = val[0];
  allShow.value = val[1];
};
// 关闭的时候
const handelClose = (val) => {
  FateBoardUrl.value = val[0];
  allShow.value = val[1];
};
</script>

<template>
  <CatalogTableContainer v-if="allShow">
    <template #catalog>
      <ModelCatalog :id="modelVersion"></ModelCatalog>
    </template>
    <template #table>
      <ModelInfo v-if="modelVersion" @JobDetail="handelJobDetail" />
      <el-empty v-else />
    </template>
  </CatalogTableContainer>
  <!-- FateBoard -->
  <FateBoard :FateBoardUrl="FateBoardUrl" @close="handelClose" v-show="FateBoardUrl"></FateBoard>
</template>

<style scoped></style>
