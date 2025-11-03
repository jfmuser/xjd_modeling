<!-- 
    Author: YangWuLong
    UpDate: 2023.3
    version:fate1.9
 -->
<script setup>
import { reactive, ref } from 'vue';
import { useFullscreen } from '@vueuse/core';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import TabContainer from '../../layouts/TabContainer.vue';
import JobLogs from '../../components/workspace/job-dashboard/log/Logs.vue';
const JobLogsRef = ref(null);
const JobContainerRef = ref(null);
const { toggle: toggleFullScreen } = useFullscreen(JobContainerRef);
const tabs = ['算法日志', '调度日志'];
const state = reactive({
  loading: true,
  activeTab: 0,
});
const props = defineProps({
  jobId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  partyId: {
    type: String,
    required: true,
  },
});

function onTabChange(val) {
  console.log(val);
  state.activeTab = val.value;
  const TabName = state.activeTab === 0 ? 'algorithm' : 'schedule';
  JobLogsRef.value.changeMainTab(TabName);
}
</script>

<template>
  <ListContainerItem ref="JobContainerRef" title="日志">
    <template #header-tool>
      <el-icon type="primary" clickable @click="toggleFullScreen">
        <full-screen />
      </el-icon>
    </template>
    <!-- 日志调度 -->
    <TabContainer
      :options="tabs.map((item, index) => ({ label: item, value: index }))"
      :activeValue="state.activeTab"
      @change="onTabChange"
    >
      <JobLogs
        ref="JobLogsRef"
        :jobId="props.jobId"
        :role="props.role"
        :partyId="props.partyId"
      ></JobLogs>
    </TabContainer>
  </ListContainerItem>
</template>

<style scoped lang="scss">
.tab-container {
  height: 100%;
}
</style>
