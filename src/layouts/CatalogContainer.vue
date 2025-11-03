<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['add']);

function onAdd() {
  emits('add');
}
</script>

<template>
  <div class="catalog-container">
    <div class="header-area background">
      <div class="title">{{ props.title }}</div>
      <div class="right">
        <el-button type="text" class="add" @click="onAdd">
          <el-icon><Plus></Plus></el-icon>
          添加
        </el-button>
      </div>
    </div>
    <div class="main">
      <slot name="filter"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.catalog-container {
  background-color: #fff;
  height: 100%;
  .main {
    padding: 20px;
  }
}
</style>
