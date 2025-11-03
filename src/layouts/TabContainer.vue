<script setup>
const props = defineProps({
  // 算法日志 调度日志
  options: { type: Array, required: true },
  activeValue: { type: Number, default: -1 },
  mode: { type: String, default: '' },
});

const emits = defineEmits(['change']);

function onClick(val) {
  emits('change', val);
}
</script>

<template>
  <div class="tab-container">
    <div class="header">
      <el-button v-for="(item, index) in props.options" :key="item.value" type="text" :class="{
        active: props.activeValue
          ? props.activeValue === item.value
          : index === 0,
      }" @click="onClick(item)">
        {{ item.label }}{{ props.mode }}
      </el-button>

      <div class="tool">
        <slot name="header-tool"></slot>
      </div>
    </div>
    <slot name="default"></slot>
  </div>
</template>

<style scoped lang="scss">
.tab-container {
  .header {
    display: flex;
    border-bottom: 1px solid rgba(67, 118, 255, 0.2);
    gap: 15px;

    .el-button {
      border: 1px solid rgba(67, 118, 255, 0.2) !important;
      padding: 10px;
      border-radius: 2px 2px 0 0;
      border-bottom: 0 !important;
      font-size: 12px;
      height: 24px;
      margin: 0;

      &:hover {
        transform: scale(1.05);
        background-color: rgba(67, 118, 255, 0.1) !important;
      }
    }

    .active {
      background: rgba(67, 118, 255, 0.1);
    }

    .tool {
      margin-left: auto;

      :deep span {
        font-size: 12px;
      }
    }
  }

  :deep .table-wrapper {
    padding: 5px 0;
  }
}
</style>
