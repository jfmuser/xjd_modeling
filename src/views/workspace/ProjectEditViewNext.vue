<script setup>
import {
  onMounted,
  onBeforeUnmount,
  provide,
  reactive,
  computed,
  inject,
  nextTick,
  ref,
  getCurrentInstance
} from 'vue';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { useFullscreen } from '@vueuse/core';
import GraphViewer from '../../components/graph-viewer/GraphViewer.vue';
import GraphMenu from '../../components/graph-viewer/GraphMenu.vue';
import {
  inEffectAlgorithmList,
  getInEffectLibAndAlgList,
} from '../../apis/workspace/algorithm.api';
import { GET_GRAPH, I18N } from '../../utils/key';
import ProjectInfoPanel from './ProjectInfoPanel.vue';
import {
  getProjectDependencyData,
  createJob,
} from '../../apis/workspace/project.api';
import { runFateProject } from '../../apis/innovate/innovate.api';
import C2Transition from '../../components/C2Transition.vue';
import AlgorithmParamDrawer from './AlgorithmParamDrawer.vue';
import ResultDrawer from '../secretflow/ResultDrawer.vue';
import useGraph from '../../hooks/useGraph';
import formatDAGData from '../../utils/formatDAGData';
import useAlgorithmParam from '../../hooks/useAlgorithmParam';
import { FormType } from '@/utils/const';
import * as Base64 from 'js-base64';
import WebSocketClient from '@/utils/WebSocketClient.js';
const { onSaveGraphInfo } = useAlgorithmParam();
const {
  GraphViewerRef,
  getGraph,
  getNodesData,
  getEdgesData,
  onZoomIn,
  onZoomOut,
  onAutoZoom,
  onGraphClear,
  onGraphRollback,
} = useGraph();
provide(GET_GRAPH, getGraph);
const { appContext } = getCurrentInstance();
const indexedDB = appContext.config.globalProperties.$indexedDB;

const router = useRouter();
const i18n = inject(I18N);
const state = reactive({
  operators: [],
  expanded: true,
  editable: true,
  dependencyData: {},
  newJobId: '',
});
let timerId = null;
const paramDrawer = reactive({ visible: false });
const resultDrawer = reactive({ visible: false });
const { toggle: toggleFullScreen } = useFullscreen(GraphViewerRef);
const categories = computed(() => {
  return state.operators.reduce((result, current) => {
    let target = result.find((item) => item.key === current.category);
    if (!target) {
      target = {
        name: i18n.arithmetic[current.category],
        key: current.category,
        module: current.module,
        component_module: current.module,
        id: current.algorithmId,
        operators: [],
      };
      result.push(target);
    }
    target.operators.push(current);
    return result;
  }, []);
});

const operatorCategories = computed(() => {
  return categories.value.map((item) => ({
    title: item.name,
    name: item.key,
    algorithmId: item.algorithmId,
    graphHeight: 20 + item.operators.length * 60,
  }));
});

const projectInfo = computed(() =>
  JSON.parse(localStorage.getItem('projectInfo')),
);

async function getOperators () {
  try {
    state.loading = true;
    // const promises = [
    //   'reader',
    //   'data_transform',
    //   'hetero_data_split',
    //   'data_statistic',
    //   'feature_engineering',
    //   'information_retrieval',
    //   'sample_intersection',
    //   'federated_training',
    //   'federated_inference',
    // ].map((item) => inEffectAlgorithmList(item));

    // const response = await Promise.all(promises);
    // console.log(response, 'getOperatorsgetOperatorsgetOperatorsgetOperators');
    // const FATEList = ["reader", "data_transform", "scale", "hetero_fast_secure_boost", "HomoSecureboost","homo_lr", "HeteroKmeans", "hetero_linr_he", "hetero_lr", "evaluation", "intersection"
    //   ,"secure_information_retrieval","homo_lr",""
    // ]
    const response = await getInEffectLibAndAlgList();
    response?.algorithmVersionList.forEach((alg) => {
      // alg.forEach((item,i) => {
      //   // if (FATEList.includes(item.name)) {
      //   //   console.log(item,'FATEList')
      //   //   state.operators.push(item)
      //   // }
      // })
      if (alg.platform == 0) {
        state.operators.push(alg);
      }
      console.log(alg, 'ALG');
    });
    // state.operators = response.flat();
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

async function getDependencyData () {
  try {
    state.dependencyData = await getProjectDependencyData(projectInfo.value.id);
  } catch (error) {
    console.error(error);
  }
}
// 这个方法是回写画布的
async function setCurrentAlgorithms () {
  console.log(projectInfo.value, '我撒');
  if (!projectInfo.value.id || !projectInfo.value.dependencyData) {
    return;
  }
  // await getDependencyData();

  const formattedData = await formatDAGData(
    JSON.parse(projectInfo.value.dependencyData),
  );
  console.log(formattedData, 'formattedData');

  formattedData.nodes.forEach((item) => {
    console.log(item, 'OITEMOITEM');
    item.x = item.data.x;
    item.y = item.data.y;
    console.log(GraphViewerRef.value, 'GraphViewerRef.value');
    GraphViewerRef.value.addNode(item);
  });
  GraphViewerRef.value.addEdges(formattedData.edges);
}

onMounted(async () => {
  await getOperators();
  await setCurrentAlgorithms();
  await nextTick();
  timerId = setTimeout(() => {
    const dom = Array.from(
      document.querySelectorAll('.graph-area .graph-node-wrapper'),
    );
    console.log(dom, '看看变色dom');
    dom.forEach((dom) => (dom.style.borderBottom = '6px solid #0068fa'));
    if (dom.length !== 0) {
      clearTimeout(timerId);
    }
  }, 100);
});

function onClickNode (item) {
  if (item.node.port.ports.length == 0) return;
  console.log('item>>>', item);
  if (state.editable) {
    paramDrawer.visible = true;
    paramDrawer.operator = item.node.store.data.data;
  }
}

function onSwitchSide () {
  state.expanded = !state.expanded;
}

function goProjectPage () {
  cleanLocalStorage();
  // router.push({ name: 'project' });
  router.push({
    name: 'project', query: {
      projectName: route.query.projectName,
      id: route.query.id,
      action: FormType.READ,
      type: route.query.type
    }
  });
}

function onEdit () {
  state.editable = true;
}

function cleanLocalStorage () {
  console.log('fade清除缓存')
  localStorage.setItem('graphInfo', null);
  localStorage.setItem('projectInfo', null);
  localStorage.setItem('projectParams', null);
  localStorage.setItem('ProjectConfigInfo', null);
  localStorage.setItem('hostProjectParams', null);
  localStorage.setItem('hostProjectParamsObj', null);
  localStorage.setItem('guestProjectParams', null);
  localStorage.setItem('commonProjectParams', null);
  localStorage.setItem('commonProjectConfigInfo', null);
  localStorage.setItem('arbiterProjectParams', null);
  localStorage.setItem('projectNodeCoord', '{}');
  sessionStorage.removeItem('projectParamsVersion');
}

async function onSave () {
  console.log('onSave');
  const nodes = await getNodesData();
  const edges = await getEdgesData();
  if (nodes.length === 0) {
    ElMessage.error('保存失败,画布不能为空!');
    throw new Error('画布为空');
  }
  await onSaveGraphInfo(nodes, edges);
  goProjectPage();
}

function onCancelEdit () {
  state.editable = false;

}

onBeforeUnmount(() => {
  cleanLocalStorage();
});

function onCloseParamDrawer () {
  paramDrawer.visible = false;
  paramDrawer.operatorType = null;
}

//往画布添加算子时触发
function onAddNode (node) {
  console.log(node, 'NODENODENODE');
  const projectNodeCoord = JSON.parse(
    localStorage.getItem('projectNodeCoord') ?? '{}',
  );
  let graphInfo = JSON.parse(localStorage.getItem('graphInfo') ?? '[]');
  graphInfo = graphInfo == null ? [] : graphInfo;
  // localStorage.setItem('graphInfo')
  // console.log(node,'NODE节点');
  console.log({ graphInfo })
  graphInfo.push({
    label: node.store.data.data.label,
    algorithm_id: node.store.data.data.algorithm_id,
  });
  projectNodeCoord[node.store.data.data.label] = node.store.data.position;
  localStorage.setItem('projectNodeCoord', JSON.stringify(projectNodeCoord));
  localStorage.setItem('graphInfo', JSON.stringify(graphInfo));
}

// 1. 确保CSS注入成功
const insertAnimationCSS = () => {
  const styleId = 'x6-edge-animation-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes running-line {
        to { stroke-dashoffset: -1000; }
      }
      [data-animated="true"] {
        stroke-dasharray: 5 !important;
        animation: running-line 30s linear infinite !important;
      }
    `;
    document.head.appendChild(style);
  }
};

const route = useRoute();

async function onRun () {
  try {
    insertAnimationCSS(); // 确保样式注入

    const nodes = await getNodesData();
    const edges = await getEdgesData();
    if (nodes.length === 0) {
      ElMessage.error('运行失败,画布不能为空!');
      throw new Error('画布为空');
    }
    await onSaveGraphInfo(nodes, edges);
    console.log(449)
    // const response = await createJob(route.query.id);
    let projectJson = JSON.parse(localStorage.getItem('projectInfo')).projectJson;
    projectJson = Base64.encode(JSON.stringify(projectJson));
    const response = await runFateProject({ data: projectJson });
    state.newJobId = response.data;
    let project = await indexedDB.get(route.query.id)
    console.log({ project, indexedDB })
    let jobIds = project?.jobIds || []
    jobIds.unshift(response.data)
    console.log(33, { project })
    await indexedDB.set({ ...project, id: route.query.id, jobIds });
    startPollingStatus();
    ElMessage.success(response.retmsg || '操作成功');
  } catch (error) {
    ElMessage.error(error);
  }
}

const isRunning = ref(false);
let ws
let pollingInterval;
// 2. 增强版的轮询控制
const startPollingStatus = () => {
  stopPolling(); // 先停止已有轮询
  fetchStatus(); // 立即执行一次
  isRunning.value = true;

  // pollingInterval = setInterval(fetchStatus, 2000);
};

const stopPolling = () => {
  if (ws) {
    // clearInterval(pollingInterval);
    isRunning.value = false;
    ws.close()
    ws = null;
  }
};

const onMessage = (data, event) => {
  if (data.status === 'running') {
    console.log('正在运行', data);
    isRunning.value = true;
  } else if (data.status === 'waiting') {
    console.log('正在等待', data);
    isRunning.value = true;
  } else if (data.status === 'success') {
    isRunning.value = false;
    console.log('运行成功', data);
    ElMessage.success('运行成功');
    ws.close()
  } else if (data.status == 'failed') {
    console.log('运行失败', data);
    isRunning.value = false;
    ElMessage.success('运行失败');
    ws.close()
  } else {
    console.log('其他消息', data);
  }
}
// 带调试日志的状态检查
// 3. 带调试日志的状态检查
const fetchStatus = async () => {
  try {
    ws = new WebSocketClient(`/fate/websocket/progress/${state.newJobId}/guest/9999`, {
      autoReconnect: true,        // 自动重连
      reconnectInterval: 3000,     // 重连间隔 3 秒
      maxReconnectAttempts: 5,     // 最多重连 5 次
      timeout: 30000,              // 消息超时 30 秒
      onClose: (event) => {
        console.log('连接关闭', event);
      },
      onError: (event) => {
        console.error('连接错误', event);
      },
      onMessage
    });


    await ws.connect();
    console.log('连接成功');
    // const response = new WebSocket(`/fate/websocket/progress/202512021139156190580/guest/1`);
    console.log({ ws: ws })
    // localStorage.setItem('nodeStatusInfo', JSON.stringify(response.nodes));
    // const graph = GraphViewerRef.value?.getGraph();
    // const edges = graph.getEdges(); // 1. 调试输出节点和边信息

    // console.log(
    //   '当前节点状态:',
    //   response.nodes.map((n) => `${n.graphNodeId}:${n.status}`),
    // );
    // console.log('边数量:', edges.length); // 2. 先清除所有动画

    // edges.forEach((edge) => {
    //   edge.attr({
    //     line: {
    //       strokeDasharray: '',
    //       style: {
    //         animation: 'none',
    //         stroke: edge.attr('line/stroke'), // 强制触发重绘
    //       },
    //     },
    //   });
    // }); // 3. 仅对RUNNING节点的连线添加动画

    // if (!response.finished) {
    //   const runningNodeIds = response.nodes
    //     .filter((node) => node.status === 'RUNNING')
    //     .map((node) => node.graphNodeId);

    //   console.log('RUNNING节点ID:', runningNodeIds);

    //   edges.forEach((edge) => {
    //     const sourceId = edge.getSourceCell()?.store.changed.zIndex;
    //     const targetId = edge.getTargetCell()?.store.changed.zIndex;
    //     const edgeId = edge?.store?.data?.data.edgeId; // 只需要target的节点ID
    //     const targetNodeId = edgeId.split('__')[1];

    //     console.log(edge, edge.getTargetCell(), '>>>edge.getTargetCell()'); // const tempRunningNodeIds = runningNodeIds.map((i) => //   Number(i[i.length - 1]), // ); // console.log( //   'tempRUNNING节点ID:', //   sourceId, //   targetId, // ); // const isActive = //   (sourceId && tempRunningNodeIds.includes(sourceId)) || //   (targetId && tempRunningNodeIds.includes(targetId));

    //     const isActive = runningNodeIds.some((item) =>
    //       targetNodeId.includes(item),
    //     );

    //     if (isActive) {
    //       console.log(`激活边: ${edge.id} (${sourceId} -> ${targetId})`);
    //       edge.attr({
    //         line: {
    //           strokeDasharray: 5,
    //           style: {
    //             animation: 'running-line 30s linear infinite',
    //             stroke: edge.attr('line/stroke'), // 强制重绘
    //           },
    //         },
    //       });
    //     }
    //   });
    // } else {
    //   stopPolling();
    // }
  } catch (error) {
    console.error('轮询出错:', error);
  }
};

const onCheckResult = async (args) => {
  resultDrawer.visible = true;

  //   let currentGraphNodeId = ''
  //   let sourceGraphEdgeId = ''
  //   let sourceAnchor = ''
  //   graphInfo.nodes.forEach(item => {
  //       if (item.label === props.operatorName) {
  //           currentGraphNodeId = item.graphNodeId
  //       }
  //   })
  //   graphInfo.edges.forEach(item => {
  //       if (item.target === currentGraphNodeId) {
  //           sourceGraphEdgeId = item.source
  //           sourceAnchor = item.sourceAnchor
  //       }
  //   })
  // const graphInfo = JSON.parse(localStorage.getItem('graphInfo'))
  // const outputData = await getOutputData({
  //               graphId: route.query.graphId,
  //               graphNodeId: sourceGraphEdgeId,
  //               outputId: sourceAnchor,
  //               projectId: props.projectInfo.projectId
  //           })
};
onBeforeUnmount(() => {
  stopPolling()
})
</script>
<template>
  <div class="project-edit">
    <div class="header">
      <el-button type="text"
                 :icon="ArrowLeft"
                 @click="goProjectPage">返回
      </el-button>
      <div class="graph-operations">
        <el-icon type="primary"
                 @click="onZoomIn">
          <zoom-in />
        </el-icon>
        <el-icon type="primary"
                 @click="onZoomOut">
          <zoom-out />
        </el-icon>
        <el-icon v-show="state.editable"
                 type="primary"
                 @click="onGraphClear">
          <delete />
        </el-icon>
        <el-icon type="primary"
                 @click="onAutoZoom">
          <location />
        </el-icon>
        <el-icon v-show="state.editable"
                 type="primary"
                 @click="onGraphRollback">
          <refresh-left />
        </el-icon>
        <el-icon type="primary"
                 @click="toggleFullScreen">
          <full-screen />
        </el-icon>
      </div>
      <C2Transition>
        <div v-show="state.editable&&!isRunning"
             class="action-button">
          <el-button type="primary"
                     @click="onSave"> 保存</el-button>
          <el-button type="primary"
                     @click="onRun"
                     :disabled="isRunning">
            {{ isRunning ? '运行中' : '运行' }}
          </el-button>
          <el-button @click="onCancelEdit">取消</el-button>
        </div>
      </C2Transition>
    </div>
    <div class="content">
      <C2Transition>
        <div v-show="state.expanded"
             class="side">
          <ProjectInfoPanel :info="projectInfo"
                            :editable="state.editable"
                            @edit="onEdit" />
          <GraphMenu v-loading="state.loading"
                     :groups="operatorCategories"
                     :menus="categories"
                     :editable="state.editable" />
        </div>
      </C2Transition>
      <div class="side-tool"
           :class="{ fold: !state.expanded }">
        <el-icon @click="onSwitchSide">
          <fold v-if="state.expanded" />
          <expand v-else />
        </el-icon>
      </div>
      <div class="graph-area"
           :class="{ wide: !state.expanded }">
        <GraphViewer ref="GraphViewerRef"
                     :editable="state.editable"
                     @click-node="onClickNode"
                     @add-node="onAddNode"
                     @check-result="onCheckResult" />
      </div>
    </div>
  </div>
  <C2Transition>
    <AlgorithmParamDrawer v-if="paramDrawer.visible"
                          :operator="paramDrawer.operator"
                          @close="onCloseParamDrawer" />
  </C2Transition>
  <C2Transition>
    <ResultDrawer v-if="resultDrawer.visible"
                  @close="resultDrawer.visible = false" />
  </C2Transition>
</template>
<style scoped lang="scss">
$header-tool-height: 40px;
$side-tool-height: 32px;
$side-width: 300px;
$project-info-height: 100px;

.project-edit {
  height: 100%;

  .header {
    width: calc(100% + 16px * 2);
    margin: -16px 0 0 -16px;
    padding: 16px;
    height: $header-tool-height;
    display: flex;
    align-items: center;
    background-color: #fff;

    .graph-operations {
      width: calc(100% - 200px);
      display: flex;
      justify-content: center;
      gap: 10px;

      .el-icon {
        cursor: pointer;
        font-size: 20px;
      }
    }

    .action-button {
      // width: 220px;
      // margin-left: auto;
      display: flex;
    }
  }

  .content {
    height: calc(100% - #{$header-tool-height});
    display: flex;
    background-color: #fff;
    margin-top: 10px;
    gap: 3px;
  }

  .side {
    width: $side-width;
    background-color: #fff;
    border-radius: 4px;
    height: calc(100% - #{$side-tool-height});
    overflow: auto;
    box-shadow: 2px 4px 12px 0px rgba(67, 118, 255, 0.2);
    display: flex;
    flex-direction: column;
    .project-info {
      height: auto; //$project-info-height;
    }

    .stencil {
      height: 100%; //calc(100% - #{$project-info-height});
      width: 100%;
      position: relative;
    }
  }

  .side-tool {
    width: $side-width;
    position: absolute;
    bottom: 15px;
    height: $side-tool-height;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    background-color: #fff;

    &.fold {
      width: 30px;
    }

    .el-icon {
      cursor: pointer;
      font-size: 20px;
    }
  }

  .graph-area {
    width: calc(100% - #{$side-width});
    overflow: auto;

    &.wide {
      width: 100%;
    }
  }
}
</style>
