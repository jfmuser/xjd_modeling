<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
console.log(props.title);
</script>

<template>
  <div class="list-container-item">
    <div class="header">
      <div class="title--secondary">{{ props.title }}</div>
      <div class="tool">
        <slot name="header-tool"></slot>
      </div>
    </div>
    <div class="main">
      <slot name="default"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-container-item {
  // margin-bottom: 10px;
  margin-bottom: 0.0390625rem;

  .header {
    display: flex;
    padding: 0.01171875rem 0.0625rem;
    height: 40px;
    align-items: center;
    border-bottom: $headerBackgroundColor solid 1px;

    .tool {
      margin-left: auto;

      :deep .el-button {
        padding: 0 !important;
      }
    }
  }

  .main {
    padding: 0.0625rem 0;
    overflow: auto !important;

    :deep .el-form-item {
      width: max(50%, 400px);
      margin-right: 0;

      &.entire-line {
        width: 100%;
      }

      .el-select {
        width: 100%;
      }
    }
    &::-webkit-scrollbar {
        width: 0px;
    }
  }
}
</style>
