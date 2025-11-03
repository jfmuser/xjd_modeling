<script setup>
import WorkspaceMenu from './workspace/WorkspaceMenu.vue';
import useMenuStore from '../stores/menu.store';

const menuStore = useMenuStore();
</script>

<template>
  <div class="menu-wrapper">
    <WorkspaceMenu />
    <!-- <DeptMenu /> -->
    <div class="tool">
      <el-icon @click="() => menuStore.toggle()">
        <expand v-if="menuStore.collapse" />
        <fold v-else />
      </el-icon>
    </div>
            <!-- <div class="versions">V3.0</div> -->
  </div>
</template>

<style scoped lang="scss">
.menu-wrapper {
  height: 100%;
  // background: linear-gradient(180deg, #0f1526 0%, #1e2434 100%);
      background: linear-gradient(#19328e 0%, rgba(25, 50, 142, 0.98) 100%);
  opacity: 0.94;
  position: relative;

  :deep .el-menu {
    background-color: transparent;
    color: #fff;
    border: 0;

    .el-menu-item,
    .el-sub-menu__title {
      color: rgba(255, 255, 255, 0.65);
      // height: 0.15625rem;
      height: 40px;
      // gap: 0.02734375rem;
      gap: 7px;

      &.is-active {
        color: #fff;
        background: linear-gradient(270deg,
            rgba(67, 118, 255, 0) 0%,
            rgba(67, 118, 255, 0.5) 100%);
      }

      &:hover {
        background: linear-gradient(270deg,
            rgba(67, 118, 255, 0) 0%,
            rgba(67, 118, 255, 0.5) 100%);
        transform: scale(1.05);
        color: #fff;
      }
    }

    .el-badge {
      transform: translateY(-50%);
    }
  }

  .tool {
    width: 100%;
    height: 0.1171875rem;
    font-size: 0.078125rem;
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 0;

    .el-icon {
      cursor: pointer;
      color: #fff;
    }
  }

    .versions {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
  text-shadow: 5px 7px 6px #000;
  font-size: 24px;
  }
}
</style>
