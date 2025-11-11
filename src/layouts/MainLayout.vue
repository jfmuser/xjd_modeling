<script setup>
import { useRoute } from 'vue-router';
import LayoutHeader from './LayoutHeader.vue';
import BreadcrumbWidget from './BreadcrumbWidget.vue';
import MenuLayout from './MenuLayout.vue';
import useMenuStore from '../stores/menu.store';

const route = useRoute();
const menuStore = useMenuStore();
</script>
<template>
  <el-container :class="{ dark: route.meta.dark }">
    <!-- <el-header>
      <LayoutHeader></LayoutHeader>
    </el-header> -->
    <el-container class="layout-content">
      <!-- <el-aside
        v-if="route.name !== 'crossroad'"
        :class="{ collapse: menuStore.collapse }"
      >
        <MenuLayout></MenuLayout>
      </el-aside> -->
      <el-main :class="{ [route.name]: true }">
        <BreadcrumbWidget v-if="false"></BreadcrumbWidget>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<style scoped lang="scss">
.el-container {
  height: 100%;
  font-size: 20px;

  .el-header {
    position: relative;
    z-index: 2;
    // height: $headerHeight;
    height: 0.21875rem;
    padding: 0;
  }

  .layout-content {
    height: calc(100% - $headerHeight);
  }

  .el-aside {
    // width: $menuWidth;
    width: 200px;
    overflow-x: hidden;

    &.collapse {
      width: 0.234375rem;
    }
  }

  .el-main {
    padding: 16px;
    background-color: $mainBackgroundColor;

    &.crossroad {
      padding: 0;
    }
  }

  :deep .deptSupervise{
    padding:0;
  }
}

.dark {
  .el-main {
    background-color: $darkBackground;
  }

  :deep .list-container {
    color: $darkTextColor;
    background-color: $darkBackground !important;
    padding: 0 !important;
    font-family: 'PingFang SC Medium' !important;

    &__header {
      background-color: #242b43;
      padding: 0 0.140625rem !important;

      .el-icon {
        color: $darkTextColor;
      }
    }

    .approval-result-item {
      .value {
        color: #fff !important;
      }
    }

    .tab-container {

      .el-button,
      .el-link--inner {
        color: $darkTextColor !important;
      }

      .el-table__header-wrapper {
        th {
          background-color: $darkBackground !important;
          border-color: $darkBackground !important;
        }
      }

      .table-wrapper,
      .table-container,
      .el-table__body-wrapper,
      .el-table__body,
      .el-table__empty-block {

        tr,
        td {
          background-color: $darkBackground !important;
          border-color: $darkBackground !important;
        }

        background-color: $darkBackground !important;
        border-color: $darkBackground !important;
      }
    }
  }

  :deep .el-date-editor,
  :deep .el-input__inner {
    background-color: $darkBackground !important;

    input {
      background-color: $darkBackground !important;
    }
  }
}
</style>

<style lang="scss">
$darkBackground: #060b15;

.dark-popper {
  background-color: $darkBackground;

  .el-picker-panel,
  .el-date-table-cell {
    background-color: $darkBackground !important;
  }

  .disabled {
    .el-date-table-cell {
      background-color: #333 !important;
    }
  }
}

.el-input__inner,.el-form-item__label,.cell,.filter-item .label,.el-link__inner {
  font-size: 18px !important;
}
.el-button {
  font-size: 18px !important;
}
.el-descriptions__cell {
font-size: 16px !important;
}
</style>
