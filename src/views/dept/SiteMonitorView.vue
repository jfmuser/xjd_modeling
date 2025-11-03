<script setup>
import { reactive, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import _ from 'lodash';

import { getTotal } from '../../apis/dept/monitor.api';
import ProgressBar from '../../components/dept/ProgressBar.vue';
import InstitutionStatistics from '../../components/monitor/InstitutionStatistics.vue';
import SiteStatistics from '../../components/monitor/SiteStatistics.vue';
import JobTotalStatistics from '../../components/monitor/JobTotalStatistics.vue';
import { TASK_LEGEND } from '../../utils/const';
import { useRoute, useRouter } from 'vue-router';
import TabContainer from '../../layouts/TabContainer.vue';

const route = useRoute();
const router = useRouter();
const tabs = ['今日活跃数据', '累计活跃数据'];
const state = reactive({
  timeRange: [dayjs(new Date()).subtract(1, 'month'), dayjs(new Date())],
  responseData: {},
  activeTab: route.query.type,
});

const isToday = computed(() => state.activeTab === tabs[0]);

const allData = computed(() => {
  return state.responseData?.all?.data || { activeData: 0 };
});

const partyList = computed(() => {
  const partyData = _.omit(state.responseData, ['all']);
  return Object.keys(partyData).map((key) => {
    return {
      partyId: key,
      siteName: partyData[key].site_name,
      data: partyData[key].data,
    };
  });
});

const params = computed(() => {
  return {
    beginDate: dayjs(state.timeRange[0]).format('YYYYMMDD'),
    endDate: dayjs(state.timeRange[1]).format('YYYYMMDD'),
  };
});

onMounted(() => {
  fetchTotal();
});

function onTabChange(tab) {
  state.activeTab = tab.value;
  router.replace({ name: route.name, query: { type: tab.value } });
  if (isToday.value) {
    state.timeRange = [
      dayjs(new Date()).subtract(1, 'month'),
      dayjs(new Date()),
    ];
  } else {
    state.timeRange = [dayjs(new Date()), dayjs(new Date())];
  }

  fetchTotal();
}

async function fetchTotal() {
  try {
    const response = await getTotal({ ...params.value });
    state.responseData = response;
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <TabContainer
    :options="tabs.map((item) => ({ value: item, label: item }))"
    :activeValue="state.activeTab"
    @change="onTabChange"
  >
    <div v-if="isToday" class="today-total">
      今日活跃部门数:{{ state.responseData?.all?.data?.activeData || 0 }}
    </div>
    <div v-else>
      <el-date-picker
        v-model="state.timeRange"
        type="daterange"
        :clearable="false"
        start-placeholder="开始"
        end-placeholder="结束"
        format="YYYY-MM-DD"
        :disabledDate="
          (val) => {
            return val.getTime() >= Date.now();
          }
        "
        :disabled="isToday"
        style="margin: 1rem 0"
        @change="
          () => {
            fetchTotal();
          }
        "
      />
    </div>

    <JobTotalStatistics :data="allData" />

    <el-empty v-if="partyList.length === 0" />
    <template v-else>
      <div class="legend">
        <el-tag
          v-for="(item, index) in TASK_LEGEND"
          :key="index"
          effect="dark"
          :type="item.type"
          size="small"
        >
          {{ item.label }}
        </el-tag>
      </div>
      <div v-for="(item, index) in partyList" :key="index" class="party-list">
        <div>{{ item.siteName }}</div>
        <div>{{ item.partyId }}</div>
        <ProgressBar :data="item.data"></ProgressBar>
        <div>{{ item.data.total }}</div>
      </div>
    </template>
    <InstitutionStatistics :params="params" />
    <SiteStatistics :params="params" />
  </TabContainer>
</template>

<style scoped lang="scss">
.tab-container {
  padding: 16px;
  background-color: #fff;
}
.today-total {
  height: 72px;
  line-height: 72px;
}
.legend {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.party-list {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 5px 0;
}
</style>
