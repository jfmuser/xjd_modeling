<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div class="list-container">
    <template v-if="visible">
      <div v-if="props.title" class="list-container__header">
        <div class="title--primary">{{ props.title }}</div>
        <slot name="addon"></slot>
        <div class="tool">
          <slot name="header-tool"></slot>
        </div>
      </div>
      <div class="list-container__main">
        <slot name="default"></slot>
      </div>
    </template>
    <el-empty v-else></el-empty>
  </div>
</template>

<style scoped lang="scss">
// $headerHeight: 0.1953125rem;
$headerHeight: 40px;

.list-container {
  height: 100%;
  background-color: #fff;
  padding: 0 0.078125rem;
  overflow: auto;


  &__header {
    height: $headerHeight;
    display: flex;
    // gap: 0.5rem;
    // font-size: 0.0703125rem;
    align-items: center;
    padding: 0 0.0703125rem;
    border-bottom: $headerBackgroundColor solid 1px;

    .tool {
      margin-left: auto;
    }
  }

  &__main {
    padding: 0.05859375rem 0 0.01953125rem;
    height: calc(100% - $headerHeight);
    overflow: auto;
    box-sizing: border-box;

        &::-webkit-scrollbar {
        width: 0px;
    }
  }
}
</style>
