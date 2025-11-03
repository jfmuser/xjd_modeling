<script setup>
import { computed, onMounted } from 'vue';
import ApprovalResultItem from './ApprovalResultItem.vue';
import useAuthorityStore from '../../stores/monitor/authority.store';

const authorityStore = useAuthorityStore();

const agreeCount = computed(() => authorityStore.allAuthorityHistory.length);
const todoCount = computed(() => authorityStore.allCurrentAuthority.length);

const items = computed(() => [
  { value: agreeCount.value + todoCount.value, type: 'total' },
  {
    value: todoCount.value,
    type: 'todo',
  },
  {
    value: agreeCount.value,
    type: 'agree',
  },
]);

onMounted(() => {
  authorityStore.fetchAllAuthorityHistory();
});
</script>

<template>
  <div class="approval-result">
    <ApprovalResultItem v-for="item in items" :key="item.type" :type="item.type" :value="item.value"></ApprovalResultItem>
  </div>
</template>

<style scoped>
.approval-result {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
