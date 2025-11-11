<script setup>
import CatalogTableContainer from '../../layouts/CatalogTableContainer.vue';
import ProjectInfo from '../../components/workspace/project/ProjectInfo.vue';
import ProjectCatalog from '../../components/workspace/project/ProjectCatalog.vue';
import ProjectListView from './ProjectListView.vue';
import { computed, onBeforeMount } from 'vue';
import _ from 'lodash';
import { useRoute } from 'vue-router';
import ProjectEditView from './ProjectEditViewNext.vue';

const route = useRoute();
const projectName = computed(() => route.query.projectName);
const isShowAll = computed(() => {
  return !_.isNil(route.query.all);
});
const isEdit = computed(() => {
  return !_.isNil(route.query.edit);
});

</script>

<template>
  <ProjectListView v-if="isShowAll" ref="ProjectListViewRef" />
  <ProjectEditView v-else-if="isEdit" ref="ProjectEditViewRef" />
  <CatalogTableContainer v-else>
    
    <template #table>
      <ProjectInfo v-if="projectName" />
      <el-empty v-else />
    </template>
  </CatalogTableContainer>
</template>

<style scoped></style>
