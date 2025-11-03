<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import TabContainer from '@/layouts/TabContainer.vue';
import ApplyHistoryTable from '@/components/ApplyHistoryTable.vue';
import AuthorityTable from '@/components/dept/AuthorityTable.vue';
import useAuthorityStore from '@/stores/monitor/authority.store.js';
import { getAllAuthorityHistory } from '@/apis/monitor/authority.api';

const authorityStore = useAuthorityStore();
const ApprovalTableRef = ref(null);
const state = reactive({
  loading: true,
  tabs: ['消息审批', '历史操作'],
  activeTab: 0,
  allAuthority: [],
});
const isMessageTab = computed(() => state.activeTab === 0);

onMounted(() => {
  fetchTableData();
});

async function fetchTableData() {
  try {
    state.loading = true;
    await authorityStore.fetchAllCurrentAuthority();
    state.allAuthority = authorityStore.allCurrentAuthority.map((item) => ({
      ...item,
      applicant: item.authorityInstitutions,
    }));
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

function onTabChange(val) {
  state.activeTab = val.value;
}

function onBatch() {
  ApprovalTableRef.value.onBatchDeal();
}
</script>

<template>
  <TabContainer v-loading="state.loading" :options="state.tabs.map((item, index) => ({ label: item, value: index }))"
    :activeValue="state.activeTab" @change="onTabChange">
    <template #header-tool>
      <el-link v-if="isMessageTab" type="primary" :underline="false" @click="onBatch">一键审批
      </el-link>
    </template>
    <ApplyHistoryTable v-if="!isMessageTab" all :getData="(data) => getAllAuthorityHistory({ ...data })" />
    <AuthorityTable v-if="isMessageTab" ref="ApprovalTableRef" :data="state.allAuthority"></AuthorityTable>
  </TabContainer>
</template>

<style scoped></style>
