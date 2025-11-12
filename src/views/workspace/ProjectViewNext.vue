<script setup>
import CatalogTableContainer from '../../layouts/CatalogTableContainer2.vue';
import ProjectInfo from '../../components/workspace/project/ProjectInfo.vue';
import ProjectCatalog from '../../components/workspace/project/ProjectCatalog.vue';
import ProjectListView from './ProjectListView.vue';
import { computed, ref, reactive } from 'vue';
import _ from 'lodash';
import { useRoute } from 'vue-router';
import ProjectEditViewNext from './ProjectEditViewNext.vue';
import SecretflowProjectEditView from '../secretflow/SecretflowProjectEditView.vue';
import SecretflowProjectInfo from '../secretflow/SecretflowProjectInfo.vue';
// fateBoard
import FateBoard from '@/components/workspace/iframe/FateBoard.vue';
const route = useRoute();
const projectType = computed(() => route.query.type);
const isShowAll = computed(() => {
  return !_.isNil(route.query.all);
});
const isEdit = computed(() => {
  return !_.isNil(route.query.edit);
});
const core = computed(() => {
  return route.query.type;
});

const allShow = ref(true);
const FateBoardUrl = ref(null);
const handelProjectDetail = (val) => {
  FateBoardUrl.value = val[0];
  allShow.value = val[1];
  // console.log('最终页面拿到值', val);
};
// 关闭的时候
const handelClose = (val) => {
  FateBoardUrl.value = val[0];
  allShow.value = val[1];
};
</script>

<template>
  <ProjectListView v-if="isShowAll" ref="ProjectListViewRef" />
  <ProjectEditViewNext
    v-else-if="isEdit && core == '0'"
    ref="ProjectEditViewRef"
  />
  <SecretflowProjectEditView v-else-if="isEdit && core == '1'" />
  <div v-else style="height: 100%">
    <CatalogTableContainer v-if="allShow">
      
      <template #table>
        <!-- 右边的内容区域 -->
        <ProjectInfo
          v-if="projectType == '0' || projectType == '4'"
          @ProjectDetail="handelProjectDetail"
        />
        <SecretflowProjectInfo
          v-show="projectType == '1' || projectType == '3'"
          @ProjectDetail="handelProjectDetail"
        />
        <el-empty description="暂无数据" v-show="!projectType" />
      </template>
    </CatalogTableContainer>
    <FateBoard
      :FateBoardUrl="FateBoardUrl"
      @close="handelClose"
      v-show="FateBoardUrl"
    ></FateBoard>
  </div>
  <!-- FateBoard -->
</template>

<style scoped></style>