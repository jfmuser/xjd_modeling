<script setup>
import {
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  getCurrentInstance,
  nextTick,
  watch,
  ref,
} from 'vue';
import _ from 'lodash';
import { useRoute } from 'vue-router';
import { useFullscreen } from '@vueuse/core';
import ReconnectingWebSocket from '../../utils/ReconnectingWebSocket';
import JobSummary from './JobSummary.vue';
import JobParam from './JobParam.vue';
import JobLog from './JobLog.vue';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import OutputDialog from '../../components/workspace/job-details/dialog/index.vue';
import DownloadReport from '../../components/workspace/job-details/download/report/index.vue';
import DownloadData from '../../components/workspace/job-details/download/data/index.vue';
import { getComponentCommand } from '../../apis/workspace/job.api';
import GraphViewer from '../../components/graph-viewer/GraphViewer.vue';
import formatDAGData from '../../utils/formatDAGData';
import useGraph from '../../hooks/useGraph';
import useJobComponentStore from '../../stores/workspace/jobComponent.store';

let ws;
const jobComponentStore = useJobComponentStore();
const { GraphViewerRef, onZoomIn, onZoomOut } = useGraph();
const { toggle: toggleFullScreen } = useFullscreen(GraphViewerRef);
const instance = getCurrentInstance();
const route = useRoute();
const { jobId, role, partyId } = route.query;
const state = reactive({
  summaryLoading: false,
  jobData: { jobId, role, partyId },
  component: {},
  downloadList: [],
  useLogic: false,
  variableMap: [],
});

const dependencyData = computed(() => {
  return { ...dependencyData.value, ...state.jobData.dependency_data };
});
const DAGData = computed(() => dependencyData.value);
const componentName = computed(() => state.component.name);
const modelOutputType = computed(() => {
  return state.component.model;
});
const outputTitle = computed(() =>
  modelOutputType.value
    ? `${modelOutputType.value}: ${componentName.value}`
    : '',
);

const throttleRenderDAG = _.throttle(() => {
  renderDAG();
}, 3e3);

watch(
  () => DAGData.value,
  () => {
    throttleRenderDAG();
  },
);

function initJobSocket() {
  ws = new ReconnectingWebSocket(
    `/websocket/progress/${jobId}/${role}/${partyId}`,
    undefined,
    { maxReconnectAttempts: 0 },
  );

  ws.addEventListener('message', (event) => {
    state.summaryLoading = false;
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      ws.close();
      data = null;
      return;
    }

    handleMessage(data);
  });
}

onMounted(() => {
  initJobSocket();
});

async function renderDAG() {
  if (!DAGData.value) {
    return;
  }
  await nextTick();
  GraphViewerRef.value.clearCells();
  const formattedData = formatDAGData(DAGData.value, {
    renderStart: true,
    role,
  });
  formattedData.nodes.forEach((item) => {
    GraphViewerRef.value.addNode(item);
  });
  GraphViewerRef.value.addEdges(formattedData.edges);
  GraphViewerRef.value.getGraph().scaleContentToFit().centerContent();
}

onBeforeUnmount(() => {
  closeWebSocket();
});

function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

function handleMessage(data) {
  state.jobData = { ...state.jobData, ...data };
}

function onChoose(val) {
  console.log('val', val);
  jobComponentStore.setCurrent(val);
  const componentData = val.node.store.data.data;
  if (componentData.type === 'start') {
    state.component = {};
  } else {
    state.component = {
      dataIndex: componentData.dataIndex,
      disable: false,
      name: componentData.component_name,
      model: componentData.component_module,
      status: componentData.status,
    };
  }
}

function onShowOutput() {
  instance.refs.outputDialog.visible = true;
}
function closeOutputDialog() {
  instance.refs.outputDialog.visible = false;
}
function handleDownloadReport() {
  if (instance.refs.downloadReport) {
    const fileList = instance.refs.outputDialog.getNames();
    const res = [];
    fileList.forEach((item) => {
      const mid = item.split('.');
      res.push({
        type: mid[1],
        filename: item,
        checked: true,
      });
    });
    state.downloadList = res;
    const filterReq = {};
    if (
      modelOutputType.value
        .toLowerCase()
        .match(new RegExp('(' + ['selection'].join('|') + ')'))
    ) {
      const hasIv = instance.refs.outputDialog.hasIv();
      if (role === 'host') {
        filterReq.anonym_index = true;
      }
      if (role === 'guest' && hasIv) {
        filterReq.iv = {
          variableType: 'float',
        };
      }
    }
    state.useLogic = Object.keys(filterReq).length > 0 ? filterReq : false;
    const map = [];
    instance.refs.outputDialog.getVariableMap().forEach((item) => {
      map.push({ variable: item });
    });
    state.variableMap = map;
    instance.refs.downloadReport.show();
  }
}

async function handleDownloadData() {
  const response = await getComponentCommand({
    job_id: jobId,
    role: role,
    party_id: partyId,
    component_name: componentName.value,
  });
  if (instance.refs.downloadData) {
    instance.refs.downloadData.show(response.data);
  }
}

function handleDownloadModel() {
  if (instance.refs.downloadReport) {
    const fileList = instance.refs.outputDialog.getNames();
    const res = [];
    fileList.forEach((item) => {
      const mid = item.split('.');
      res.push({
        type: mid[1],
        filename: item,
        checked: true,
      });
    });
    state.downloadList = res;
    state.useLogic = false;
    const map = [];
    instance.refs.outputDialog.getVariableMap().forEach((item) => {
      map.push({ variable: item });
    });
    state.variableMap = map;
    instance.refs.downloadReport.show();
  }
}
// 右上角模型 下载
function handleDownloadDialog(command) {
  if (command === 'report') {
    handleDownloadReport();
  } else if (command === 'data') {
    handleDownloadData();
  } else if (command === 'model') {
    handleDownloadModel();
  }
}
function handleFilterLogic(filters) {
  const res = instance.refs.outputDialog.handleFilterLogic(filters);
  instance.refs.downloadReport.logicError(res);
}
function downloadFile(res) {
  instance.refs.downloadReport.downloadFiles(
    res,
    `${jobId}_${componentName.value}`,
  );
}

function handleBeforeDownload(args) {
  nextTick(() => {
    instance.refs.outputDialog.allSteps(args);
  });
}
</script>

<template>
  <div class="job-detail">
    <div class="job-detail__top">
      <JobSummary :jobData="state.jobData" :loading="state.summaryLoading" class="job-summary"></JobSummary>
      <ListContainerItem title="拓扑图" class="job-graph">
        <template #header-tool>
          <el-icon type="primary" clickable @click="toggleFullScreen">
            <full-screen />
          </el-icon>
        </template>
        <!-- 拓扑图 -->
        <GraphViewer ref="GraphViewerRef" @click-node="onChoose" />
        <div class="graph-icons">
          <el-icon type="primary" clickable @click="onZoomIn">
            <zoom-in />
          </el-icon>
          <el-icon type="primary" clickable @click="onZoomOut">
            <zoom-out />
          </el-icon>
        </div>
      </ListContainerItem>
      <div class="job-param-output">
        <JobParam :jobId="jobId" :role="role" :partyId="partyId" :component="state.component" class="job-param">
        </JobParam>

        <div class="job-output">
          <!--    :disabled="Object.keys(state.component).length === 0" -->
          <el-button :disabled="Object.keys(state.component).length === 0" type="primary" @click="onShowOutput">查看作业输出
          </el-button>
        </div>
      </div>
    </div>
    <!-- 算法日志——调度日志 -->
    <JobLog :jobId="jobId" :role="role" :partyId="partyId"></JobLog>
  </div>
  <!-- 弹框显示数据 -->
  <OutputDialog ref="outputDialog" :title="outputTitle" :model-type="modelOutputType" :component-name="componentName"
    :job-id="jobId" :role="role" :party-id="partyId" :status="state.jobData.status" @close-dialog="closeOutputDialog"
    @download="handleDownloadDialog" @filter-logic="handleFilterLogic" @c-reporter="downloadFile"
    @d-reporter="downloadFile" />

  <DownloadReport ref="downloadReport" :download-list="state.downloadList" :use-logic="state.useLogic"
    :table-data="state.variableMap" @download="handleBeforeDownload" @filter-logic="handleFilterLogic" />

  <DownloadData ref="downloadData" />
</template>

<style scoped lang="scss">
$titleHeight: 3rem;

.job-detail {
  width: 100%;
  height: 100%;
  overflow: auto;

  &__top {
    width: 100%;
    height: 600px;
    display: flex;
    gap: 10px;
    margin-bottom: 10px;

    .job-summary {
      width: 20%;
    }

    :deep .job-graph {
      width: 60%;
      position: relative;

      .graph-icons {
        position: absolute;
        bottom: 20px;
        right: 30px;
        display: flex;
        flex-direction: column;
        gap: 5px;

        .el-icon {
          font-size: 20px;
          display: block;
        }
      }
    }

    .job-param-output {
      height: 100%;
      width: 20%;
      padding-bottom: 0;

      .job-output {
        background-color: #fff;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;

        .el-button {
          width: 90%;
        }
      }

      .job-param {
        height: calc(100% - 70px);
      }
    }
  }

  :deep .list-container-item {
    background-color: #fff;
    padding: 5px 10px;
    box-sizing: border-box;
    height: 100%;

    .main {
      height: calc(100% - 30px);
      overflow: hidden;
    }
  }
}
</style>
