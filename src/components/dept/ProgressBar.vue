<script setup>
import { computed } from 'vue';
import { percent } from '../../utils';
import { TASK_LEGEND } from '../../utils/const';

const props = defineProps({
  data: {
    required: true,
    type: Object,
  },
});

const items = computed(() => {
  return TASK_LEGEND.map((item) => ({
    ...item,
    value: props.data[item.name],
    percent: percent(props.data[`${item.name}_percent`]),
  }));
});
</script>

<template>
  <el-popover trigger="hover">
    <div class="tip-content">
      <div v-for="(item, index) in items" :key="index">
        {{ item.label }}:{{ item.value }} ({{ item.percent }})
      </div>
    </div>
    <template #reference>
      <div class="progress-bar-wrapper">
        <el-tag
          v-for="(item, index) in items"
          :key="index"
          class="item"
          effect="dark"
          :type="item.type"
          :style="{
            width: item.percent,
            display: item.percent === '0.0%' ? 'none' : 'static',
          }"
        />
      </div>
    </template>
  </el-popover>
</template>

<style scoped lang="scss">
.progress-bar-wrapper {
  width: 80%;
  height: 20px;
  display: flex;
  .item {
    height: 20px;
    padding: 0;
    border-radius: 0;
  }
}
</style>
