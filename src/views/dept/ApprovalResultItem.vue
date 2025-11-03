<script setup>
import C2Icon from '@/components/C2Icon.vue';
const dict = {
  total: '总审批数',
  todo: '未审批数',
  agree: '审批通过数',
};
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <div class="approval-result-item">
    <div>
      <C2Icon v-if="props.type === 'total'" name="approval-all" width="50" />
      <C2Icon v-else-if="props.type === 'todo'" name="approval-todo" width="50" />
      <C2Icon v-else-if="props.type === 'agree'" name="approval-agree" width="50" />
      <C2Icon v-else-if="props.type === 'reject'" name="approval-reject" width="50" />
    </div>
    <div class="main">
      <div class="value">{{ props.value }}</div>
      <div class="label">{{ dict[props.type] }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.approval-result-item {
  display: flex;
  align-items: center;
  word-break: keep-all;

  .main {
    .value {
      color: $color-primary;
      font-size: 18px;
    }

    .label {
      font-size: 14px;
    }
  }
}
</style>
