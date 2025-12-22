<template>
  <el-drawer :model-value="true"
             direction="btt"
             :modal="false"
             custom-class="log-drawer"
             :show-close="false"
             :append-to-body="false">
    <template #title>
      <div class="log-container">
        <div>平台日志</div>
        <el-icon @click="handleClose">
          <ArrowDown />
        </el-icon>
      </div>
    </template>

    <div v-for="(i, index) in logs"
         :key="i"
         class="log-content">
      <span class="log-index">{{ index + 1 }}</span>
      <span style="color: #008800">{{ time(i) }}&nbsp;</span>
      <span style="color: #4b71ca"> {{ level(i) }} </span>
      <span v-html="rest(i)" />
    </div>
  </el-drawer>
</template>

<script setup>
import { getLogs } from '@/apis/secretflow/secretflow.api.js';
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref, nextTick } from 'vue';

const props = defineProps({
  data: {
    default: {
      graphId: '',
      graphNodeId: '',
      projectId: '',
    },
  },
});

const emit = defineEmits(['close', 'closeAll']);
const logs = ref([
  //   '2025-06-06 16:21:08 INFO the jobId=chih, taskId=chih-tbvnezin-node-33 start ...',
  //   '2025-06-06 16:21:08 INFO the jobId=chih, taskId=chih-tbvnezin-node-33 succeed',
]);

const getLog = async () => {
  try {
    nextTick(() => {
      console.log(props.data, 'LogDrawer');
      const mask = document.querySelector('.log-drawer').parentNode;
      const drawer = document.querySelector('.log-drawer');
      if (mask) {
        setTimeout(() => {
          mask.style.pointerEvents = 'none';
        }, 200);
      }
      if (drawer) {
        // setTimeout(() => {
        drawer.style.pointerEvents = 'auto';
        // }, 200);
      }
      console.log(drawer, 'drawer');
    });

    const res = await getLogs(props.data);
    logs.value = res.logs;
  } catch (error) {
    ElMessage.error(error);
  }
};

const time = (logItem) =>
  logItem.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0] || '';

const level = (logItem) => logItem.match(/(INFO|WARN|ERROR|DEBUG)/)?.[0] || '';

const rest = (logItem) =>
  logItem
    .replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, '')
    .replace(/(INFO|WARN|ERROR|DEBUG)/, '')
    .replace(/(jobId=\w+)/, '$1 ')
    .replace(/(taskId=\w+-[\w-]+)/, '$1 ')
    .replace(/-(\d+)/, '-<span style="color: red">$1</span>');

function handleClose () {
  emit('close');
}

onMounted(getLog);
</script>

<style lang="scss">
.log-drawer {
  width: calc(100% - 1020px) !important;
  // width: calc(100% - 2.03125rem) !important;
  margin-left: 520px;
  .el-drawer__body {
    padding: 20px 0;
  }
  .el-drawer__header {
    padding: 0;
    margin: 0;
  }
  .log-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #000000e6;
    font-size: 14px;
    background-color: #f5f5f5;
    padding: 10px 20px;
    font-weight: bold;
    .el-icon {
      cursor: pointer;
    }
  }
  .el-drawer__mask {
    pointer-events: none !important;
    background-color: transparent !important; /* 确保无背景 */
  }
  .log-content {
    font-size: 12px;
    padding-left: 22px;
    .log-index {
      margin-right: 10px;
    }
  }
}
</style>
