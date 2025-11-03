<script setup>
import CatalogTableContainer from '../../layouts/CatalogTableContainer.vue';
import DataListView from './DataListView.vue';
import DataCatalog from '../../components/workspace/data/DataCatalog.vue';
import DataInfo from '../../components/workspace/data/DataInfo.vue';
import secretflowDataInfo from '../../views/secretflow/SecretflowDataInfo.vue'
import { computed, onBeforeMount, ref } from 'vue';
import { getData } from '../../apis/manager/managerApi'
import useSecretflowStore from '../../stores/secretflow/secretflowInfo.store'
import _ from 'lodash';
import { useRoute } from 'vue-router';

const route = useRoute();
const secretflowStore = useSecretflowStore()
const isShowAll = computed(() => {
  return !_.isNil(route.query.all);
});

</script>

<template>
  <DataListView v-if="isShowAll" ref="DataListViewRef" />
  <CatalogTableContainer v-else>
    <template #catalog>
      <!-- 左侧 -->
      <DataCatalog ref="DataCatalogRef" />
    </template>
    <template #table>
      <!-- <DataInfo v-if="type === 'self-innovate'" /> -->
      <secretflowDataInfo />
    </template>
  </CatalogTableContainer>
</template>

<style scoped></style>
