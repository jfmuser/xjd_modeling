<script setup>
import CatalogTableContainer from '../../layouts/CatalogTableContainer.vue';
// import DataListView from './DataListView.vue';
import DataSourceCatalog from '../../components/workspace/data/DataSourceCatalog.vue';
import DataSourceInfo from '../../components/workspace/data/DataSourceInfo.vue';

import { computed } from 'vue';
import _ from 'lodash';
import { useRoute } from 'vue-router';

const route = useRoute();
const isShowAll = computed(() => {
  return !_.isNil(route.query.all);
});
const dataName = computed(() => route.query.dataName);
const type = computed(() => route.query.type)
</script>

<template>
  <!-- <DataListView v-if="isShowAll" ref="DataListViewRef" /> -->
  <CatalogTableContainer>
    <template #catalog>
      <!-- 左侧 -->
      <DataSourceCatalog ref="DataCatalogRef" />
    </template>
    <template #table>
      <DataSourceInfo />
    </template>
  </CatalogTableContainer>
</template>

<style scoped></style>
