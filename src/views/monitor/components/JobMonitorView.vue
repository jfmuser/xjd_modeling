<script setup>
import { reactive, onMounted, computed } from 'vue';
import { ElLoading } from 'element-plus';
import dayjs from 'dayjs';

import {
  getJobSummary,
  getSiteOptions,
  getDurationTable,
  getDuration,
} from '@/apis/monitor/job.api';
import { getAllInstitution } from '@/apis/monitor/site.api';
import MonitorJobTotalChart from '@/components/monitor/MonitorJobTotalChart.vue';
import ListContainer from '@/layouts/ListContainer.vue';
import ListContainerItem from '@/layouts/ListContainerItem.vue';

const searchForm = reactive({
  site: '',
  institution: '',
  dateRange: [dayjs(new Date()).subtract(1, 'week'), new Date()],
});

const state = reactive({
  loading: false,
  siteOptions: [],
  institutionOptions: [],
  summary: {},
  durationTableData: [],
  durationChartData: [],
});

const jobTypeBean = computed(() => {
  if (Object.keys(state.summary).length === 0) {
    return {};
  }
  return state.summary.jobTypeStatisticsBeans.reduce((result, current) => {
    result[current.type] = {
      total: {
        failed: current.failedJobs,
        failed_percent: current.failedRatio,
        success: current.successfulJobs,
        success_percent: current.successfulRatio,
        total: current.total,
      },
    };
    return result;
  }, {});
});

onMounted(() => {
  fetchSummary();

  fetchInstitutionsOptions();
});

async function fetchInstitutionsOptions() {
  try {
    const response = await getAllInstitution();
    state.institutionOptions = response.institutionsSet;
  } catch (error) {
    console.error(error);
  }
}

async function fetchSummary() {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  });
  try {
    const response = await getJobSummary({ ...searchForm });
    state.summary = response;
  } finally {
    loading.close();
  }
}

async function fetchSiteOptions() {
  try {
    const response = await getSiteOptions({
      institutions: searchForm.institution,
    });
    state.siteOptions = response.map((item) => ({
      value: item,
      label: item,
    }));
  } catch (error) {
    console.error(error);
  }
}

async function onInstitutionChange() {
  await fetchSiteOptions();
  searchForm.site = '';
  onSearch();
}

async function onSearch() {
  fetchSummary();
}

async function fetchDurationTableByType(type) {
  try {
    const response = await getDurationTable({
      beginDate: dayjs(searchForm.dateRange[0]).valueOf(),
      endDate: dayjs(searchForm.dateRange[1]).valueOf(),
      institutions: searchForm.institution,
      site: searchForm.site,
      type,
    });
    state.durationTableData = response;
  } catch (error) {
    console.error(error);
  }
}

async function fetchDurationChartByType(type) {
  try {
    const response = await getDuration({
      beginDate: dayjs(searchForm.dateRange[0]).valueOf(),
      endDate: dayjs(searchForm.dateRange[1]).valueOf(),
      institutions: searchForm.institution,
      site: searchForm.site,
      type,
    });
    state.durationChartData = response;
  } catch (error) {
    console.error(error);
  }
}

async function onTypeChange(type) {
  fetchDurationTableByType(type);
  fetchDurationChartByType(type);
}
</script>

<template>
  <ListContainer title="数据监控">
    <el-form ref="form" :model="searchForm" inline class="filter">
      <el-form-item class="date-filter">
        <el-date-picker v-model="searchForm.dateRange" type="daterange" start-placeholder="开始" end-placeholder="结束"
          :disabledDate="(time) => {
            return time.getTime() > Date.now();
          }
            " popper-class="dark-popper" @change="onSearch" />
      </el-form-item>
      <el-form-item class="input-filter">
        <el-select v-model="searchForm.institution" popper-class="dark-popper" @change="onInstitutionChange">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="item in state.institutionOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item class="input-filter">
        <el-select v-model="searchForm.site" popper-class="dark-popper" :disabled="!searchForm.institution"
          @change="onSearch">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="(item, index) in state.siteOptions" :key="index" :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <ListContainerItem title="任务统计">
      <MonitorJobTotalChart :data="jobTypeBean" @click="onTypeChange" />
    </ListContainerItem>
    <ListContainerItem title="状况监控">
      <JobSummaryStatistics :data="state.durationTableData"></JobSummaryStatistics>
    </ListContainerItem>
    <ListContainerItem title="耗时分布">
      <JobDurationPie :data="state.durationChartData"></JobDurationPie>
    </ListContainerItem>
  </ListContainer>
</template>

<style scoped lang="scss">
:deep .list-container__main {
  padding: 0;
}

.filter {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0 0;

  .el-form-item {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  :deep .date-filter {
    width: 50%;
  }

  :deep .input-filter {
    width: 20%;
  }
}
</style>
