<script setup>
import { useSlots } from 'vue';
import { useRoute } from 'vue-router';
import { getLabel } from '../router';
import useMenuStore from '../stores/menu.store';
// import { Blockchain } from '@icon-park/vue-next'

const slots = useSlots();
const route = useRoute();
const props = defineProps({
  name: { type: String, required: true },
  nest: {
    type: Boolean,
    default: false,
  },
});
const menuStore = useMenuStore();
</script>

<template>
  <slot v-if="props.nest" name="nest"></slot>
  <el-menu-item v-else :index="props.name">
    <el-tooltip
      :content="getLabel(props.name)"
      placement="right"
      :disabled="!menuStore.collapse"
    >
      <el-icon
        v-if="props.name === 'deptManagement'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <School />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'approval'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Stamp />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'authUser'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <User />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'authRole'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Grid />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'auditManagement'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Management />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'deptSupervise'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <VideoCamera />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'ApplicationConfiguration'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Notification />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'blockchain'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Connection />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'appCenter'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Menu />
      </el-icon>
      <!-- <el-icon v-else-if="props.name === 'VulnerabilityDetection'" style="width: 20px;height: 20px;margin-right: 0;">
        <Document />
      </el-icon> -->
      <el-icon
        v-else-if="props.name === 'project'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Document />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'algorithm'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <DataAnalysis />
      </el-icon>
      <el-icon
        v-else-if="props.name === 'DataRelease'"
        style="width: 20px; height: 20px; margin-right: 0"
      >
        <Share />
      </el-icon>
      <!-- <blockchain theme="outline" size="16" fill="#9ec2cc" v-else-if="props.name === 'blockchain'" /> -->
      <slot v-if="slots.icon" name="icon"></slot>
      <!-- <C2Icon v-else :name="`menu-${props.name}`" :active="route.name === props.name" :width="20" :height="20" /> -->
    </el-tooltip>
    <span style="font-size: 22px">{{ getLabel(props.name) }}</span>
    <slot></slot>
  </el-menu-item>
</template>

<style scoped></style>
