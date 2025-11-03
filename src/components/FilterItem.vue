<script setup>
const props = defineProps({
  label: {
    type: String,
    default: null,
  },
});
</script>

<template>
  <div class="filter-item">
    <div v-if="props.label" class="label">{{ props.label }}</div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filter-item {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 5px;

  .label {
    white-space: nowrap;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }

  .content {
    min-width: 160px;
  }
}
</style>
