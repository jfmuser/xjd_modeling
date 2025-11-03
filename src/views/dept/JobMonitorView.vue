<script setup>
import { reactive, onMounted } from 'vue';
import { ElLoading } from 'element-plus';
import dayjs from 'dayjs';

import { getMonitorDetail } from '../../apis/dept/monitor.api';
import { getSiteOptions } from '../../apis/dept/other.api';
import JobTotalStatistics from '../../components/monitor/JobTotalStatistics.vue';
import MonitorJobTotalChart from '../../components/monitor/MonitorJobTotalChart.vue';
import MonitorJobFailedChart from '../../components/monitor/MonitorJobFailedChart.vue';
import MonitorJobDurationChart from '../../components/monitor/MonitorJobDurationChart.vue';
import MonitorJobDurationTable from '../../components/monitor/MonitorJobDurationTable.vue';

const searchForm = reactive({
  partyId: '',
  dateRange: [dayjs(new Date()).subtract(1, 'week'), new Date()],
});

const state = reactive({
  loading: false,
  siteOptions: [],
  detail: {},
  type: 'intersect',
});

onMounted(() => {
  fetchSiteOptions();
  fetchMonitorDetail();
});

async function fetchMonitorDetail() {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  });
  try {
    const params = {
      party_id: searchForm.partyId,
      startDate: dayjs(searchForm.dateRange[0]).format('YYYYMMDD'),
      endDate: dayjs(searchForm.dateRange[1]).format('YYYYMMDD'),
    };
    const response = await getMonitorDetail(params);
    state.detail = response;
  } finally {
    loading.close();
  }
}

async function fetchSiteOptions() {
  try {
    const response = await getSiteOptions();
    state.siteOptions = Object.keys(response).map((key) => ({
      label: key,
      value: response[key],
    }));
  } catch (error) {
    console.error(error);
  }
}

function onSearch() {
  fetchMonitorDetail();
}

function onTypeChange(type) {
  state.type = type;
}
</script>

<template>
  <el-form ref="form" :model="searchForm" label-width="80px" inline>
    <el-form-item label="日期">
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        start-placeholder="开始"
        end-placeholder="结束"
        :disabledDate="
          (time) => {
            return time.getTime() > Date.now();
          }
        "
        @change="onSearch"
      />
    </el-form-item>
    <el-form-item label="部门">
      <el-select v-model="searchForm.partyId" @change="onSearch">
        <el-option label="全部" value=""></el-option>
        <el-option
          v-for="(item, index) in state.siteOptions"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
  <JobTotalStatistics
    :data="state.detail?.total || {}"
    :availableItems="['success', 'failed']"
  />
  <MonitorJobTotalChart :data="state.detail" @click="onTypeChange" />

  <MonitorJobDurationTable
    v-if="state.detail[state.type]"
    :data="state.detail[state.type].day"
    :totalData="state.detail[state.type].total"
  />
  <MonitorJobFailedChart
    v-if="state.detail[state.type]"
    :data="state.detail[state.type].day"
  />
  <MonitorJobDurationChart
    v-if="state.detail[state.type]"
    :data="state.detail[state.type].duration"
  />
</template>

<style scoped></style>
