<script setup>
import { ref } from 'vue';
import { useFullscreen } from '@vueuse/core';
import ListContainer from '../../layouts/ListContainer.vue';
import OrganizationalStructure from '../../components/org/monitor/OrganizationalStructure.vue';

const OrgChartRef = ref(null);
const { toggle, isFullscreen } = useFullscreen(OrgChartRef);
</script>

<template>
  <div class="monitor-container">
    <div class="monitor-container__left">
      <ListContainer title="组织架构" class="monitor-container__left__top">
        <template #header-tool>
          <el-button type="text" @click="toggle">
            <el-icon>
              <FullScreen></FullScreen>
            </el-icon>
          </el-button>
        </template>
        <OrganizationalStructure ref="OrgChartRef" :isFullscreen="isFullscreen"></OrganizationalStructure>
      </ListContainer>
      <div class="monitor-container__left__bottom">
        <ListContainer title="审批情况">

        </ListContainer>
        <ListContainer title="消息详情">

        </ListContainer>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.monitor-container {
  height: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  overflow: auto;

  &__left {
    height: 100%;
    gap: 1rem;
    overflow: auto;
    display: flex;
    flex-direction: column;

    &__top {
      height: 60%;
    }

    &__bottom {
      height: 40%;
      display: grid;
      grid-template-columns: 1fr 3fr;
      gap: 1rem;

      :deep .list-container__main {
        padding-left: 0;
        padding-right: 0;
      }
    }
  }
}
</style>
