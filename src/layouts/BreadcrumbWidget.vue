<script setup>
import useBreadcrumbStore from '../stores/breadcrumb.store.js';
import { getLabel } from '../router';

const breadcrumbStore = useBreadcrumbStore();
</script>

<template>
  <el-breadcrumb v-if="breadcrumbStore.breadcrumbs.length > 1">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbStore.breadcrumbs"
      :key="item.name"
      :to="{ path: item.fullPath }"
      :class="{ current: index === breadcrumbStore.breadcrumbs.length - 1 }"
      >{{ getLabel(item.name) }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped lang="scss">
.el-breadcrumb {
  margin-bottom: 10px;
}
:deep .el-breadcrumb__item {
  &.current {
    .el-breadcrumb__inner {
      color: $color-primary;
    }
  }
}
</style>
