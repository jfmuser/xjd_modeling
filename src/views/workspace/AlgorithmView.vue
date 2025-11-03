<script setup>
import CatalogTableContainer from '../../layouts/CatalogTableContainer.vue';
import AlgorithmLibraryInfo from '../../components/workspace/algorithm/AlgorithmLibraryInfo.vue';
import AlgorithmShowAllView from './AlgorithmShowAllView.vue';
import AlgorithmInfo from '../../components/workspace/algorithm/AlgorithmInfo.vue';
import { computed } from 'vue';
import _ from 'lodash';
import { useRoute } from 'vue-router';
import AlgorithmLibraryCatalog from '../../components/workspace/algorithm/AlgorithmLibraryCatalog.vue';

const route = useRoute();
const libraryName = computed(() => route.query.libraryName);
const algorithmName = computed(() => route.query.algorithmName);
const isShowAll = computed(() => {
  return !_.isNil(route.query.all);
});
</script>

<template>
  <AlgorithmShowAllView v-if="isShowAll" ref="AlgorithmShowAllViewRef" />
  <CatalogTableContainer v-else>
    <template #catalog>
      <AlgorithmLibraryCatalog ref="AlgorithmLibraryCatalogRef" />
    </template>
    <template #table>
      <AlgorithmLibraryInfo v-if="libraryName" />
      <AlgorithmInfo v-else-if="algorithmName" />
      <el-empty v-else />
    </template>
  </CatalogTableContainer>
</template>

<style scoped></style>
