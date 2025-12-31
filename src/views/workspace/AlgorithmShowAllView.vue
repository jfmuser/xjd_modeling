<script setup>
import { computed, reactive } from 'vue';
import TabContainer from '../../layouts/TabContainer.vue';
import AlgorithmLibListView from './AlgorithmLibListView.vue';
import AlgorithmListView from './AlgorithmListView.vue';

const state = reactive({
  loading: false,
  tabs: [
    { label: '算法库列表', value: 1 },
    { label: '算法列表', value: 2 },
  ],
  activeTab: 1,
});

const isAlgorithmLib = computed(() => state.activeTab === 1);

function onTabChange (tab) {
  state.activeTab = tab.value;
}
</script>

<template>
  <TabContainer :options="state.tabs"
                :activeValue="state.activeTab"
                @change="onTabChange">
    <AlgorithmLibListView v-if="isAlgorithmLib" />
    <AlgorithmListView v-else />
  </TabContainer>
</template>

<style scoped lang="scss">
.tab-container {
  padding: 0px;
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
