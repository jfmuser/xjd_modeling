<script>
import User from '~icons/c2/user';
import Plus from '~icons/c2/plus';
import Lock from '~icons/c2/lock';
import ViewOff from '~icons/c2/view-off';
import ViewOn from '~icons/c2/view-on';
import approvalAll from '~icons/c2/approval-all';
import approvalTodo from '~icons/c2/approval-todo';
import approvalAgree from '~icons/c2/approval-agree';
import approvalReject from '~icons/c2/approval-reject';
import MenuMonitor from '~icons/c2/menu-monitor';
import MenuFederation from '~icons/c2/menu-federation';
import MenuId from '~icons/c2/menu-id';
import MenuNetwork from '~icons/c2/menu-network';
import MenuCertificate from '~icons/c2/menu-certificate';
import MenuUser from '~icons/c2/menu-user';
import MenuSetting from '~icons/c2/menu-setting';
import ZoomIn from '~icons/c2/zoom-in';
import ZoomOut from '~icons/c2/zoom-out';
import ResetZoom from '~icons/c2/reset-zoom';
import Rollback from '~icons/c2/rollback';
import Clear from '~icons/c2/clear';
import AutoZoom from '~icons/c2/auto-zoom';
import MenuAlgorithm from '~icons/c2/menu-algorithm';
import MenuData from '~icons/c2/menu-data';
import MenuModel from '~icons/c2/menu-model';
import MenuMessage from '~icons/c2/menu-message';
import MenuProject from '~icons/c2/menu-project';

export default {
  components: {
    MenuProject,
    MenuModel,
    MenuData,
    MenuMessage,
    User,
    Plus,
    Lock,
    ViewOff,
    ViewOn,
    approvalAll,
    approvalTodo,
    approvalAgree,
    approvalReject,
    MenuMonitor,
    MenuFederation,
    MenuId,
    MenuNetwork,
    MenuCertificate,
    MenuUser,
    MenuSetting,
    ZoomIn,
    ZoomOut,
    ResetZoom,
    Rollback,
    Clear,
    AutoZoom,
    MenuAlgorithm,
  },
};
</script>
<script setup>
const props = defineProps({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
  width: { type: [String, Number], default: '' },
  height: { type: [String, Number], default: '' },
});
</script>

<template>
  <component
    :is="props.name"
    :class="{ 'c2-icon': true, [active ? 'active' : 'inactive']: true }"
    :style="{
      width: props.width ? `${props.width}px` : 'auto',
      height: props.height ? `${props.height}px` : 'auto',
    }"
  ></component>
</template>

<style scoped lang="scss">
.c2-icon {
  &:hover,
  &:focus {
    filter: grayscale(0);
  }
}

.active {
  filter: grayscale(0);
}

.inactive {
  filter: grayscale(1) opacity(0.5);
}
</style>
