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
} from 'vue';
import {
  listComponents,
  fullUpdateGraph,
  getGraphDetail,
  getProjectDatatable,
  getProject,
  getOutputData,
  getStatus,
  startGraph,
} from '../../apis/secretflow/secretflow.api';
import { ArrowLeft } from '@element-plus/icons-vue';
import { FormType } from '@/utils/const';
import { useRouter } from 'vue-router';
import { get, useFullscreen } from '@vueuse/core';
import GraphViewer from '../../components/graph-viewer/GraphViewer.vue';
import SecretflowGraphMenu from '@/components/secretflow/SecretflowGraphMenu.vue';
import { GET_GRAPH, I18N } from '../../utils/key';
import ProjectInfoPanel from '@/views/workspace/ProjectInfoPanel.vue';
import C2Transition from '../../components/C2Transition.vue';
import SecretflowAlgorithmParamDrawer from '@/views/secretflow/SecretflowAlgorithmParamDrawer.vue';
import useGraph from '../../hooks/useGraph';
import useSecretflowStore from '@/stores/secretflow/secretflowInfo.store.js';
import { useRoute } from 'vue-router';
import { getInEffectLibAndAlgList } from '../../apis/workspace/algorithm.api';
import dictionary from '../../utils/dictionary';
import ResultDrawer from './ResultDrawer.vue';
import { ElMessage } from 'element-plus';
// import { createJob } from '../../apis/workspace/project.api';
import { refreshDatas } from '../../apis/dp/api';
import LogDrawer from './LogDrawer.vue';
import { graphNodeList } from '../../components/secretflow/secretflowGraphOperation';
import useAlgorithmStore from '@/stores/algorithm.store';

const route = useRoute();
const secretflwoStore = useSecretflowStore();
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
const router = useRouter();
const i18n = inject(I18N);
const state = reactive({
  operators: [],
  expanded: true,
  editable: true,
  dependencyData: {},
});
const graphInfo = ref(null);
//当前被点击的node实例
const currentNode = ref(null);
//画布实例
const graph = ref(null);
const currentGraphNodeName = ref(null);

let timerId = null;
const core = computed(() => {
  return route.query.type;
});
const PrivacyExchangeData = ref({ nodeList: [] });

const paramDrawer = reactive({ visible: false });
const resultDrawer = reactive({ visible: false });
const logDrawer = reactive({ visible: false });
const logDrawer1 = reactive({ visible: false });
const { toggle: toggleFullScreen } = useFullscreen(GraphViewerRef);
const categories = computed(() => {
  return state.operators.reduce((result, current) => {
    // let target = result.find((item) => item.type === current.domain);
    let target = result.find((item) => item.type === current.category);
    console.log(current, 'current');
    if (!target) {
      console.log(i18n.arithmetic[current.domain]);
      target = {
        // name: i18n.arithmetic[current.domain] ?? i18n.arithmetic[current.name],
        name: i18n.arithmetic[current.category],
        key: current.name,
        module: current.name,
        component_module: current.name,
        type: current.category,
        // id: current.algorithmId,
        operators: [],
      };
      result.push(target);
    }
    target.operators.push(current);
    return result;
  }, []);
});

const operatorCategories = computed(() => {
  console.log(categories.value, 'categories.value');

  //先筛选出没有的算子然后计算左侧算子列表应该留的高度
  categories.value.forEach((item) => {
    item.operators = item.operators.filter((operator) =>
      graphNodeList.includes(`graph-node-${operator.name}`),
    );
  });

  return categories.value.map((item) => ({
    title: item.name,
    name: item.key,
    // algorithmId: item.algorithmId,
    graphHeight: 20 + item.operators.length * 60,
  }));
});

const projectInfo = computed(() =>
  JSON.parse(localStorage.getItem('projectInfo')),
);

async function getOperators() {
  try {
    const temporary = [];
    state.loading = true;
    // const { algorithmVersionList } = await getInEffectLibAndAlgList();
    const algorithmStore = useAlgorithmStore();
    const algorithmVersionList = algorithmStore.getAlgorithmAllList;
    console.log('operator', { algorithmVersionList });
    const response = await listComponents();
    console.log(response.secretflow.comps, 'response.secretflow.comps');
    // state.operators = response.secretflow.comps.filter(comp => {
    //     if (algorithmVersionList.some(alg => alg.module === comp.name)) {
    //         return true
    //     }
    // })
    // for (let i = 0; i < response.secretflow.comps.length; i++) {
    //     if (algorithmVersionList.some(alg => 'ss_sgd_train' === response.secretflow.comps[i].name)) {
    //         state.operators.push(response.secretflow.comps[i])
    //         return
    //     }

    // }
    console.log(algorithmVersionList, 'algorithmVersionList123');
    algorithmVersionList.forEach((comp) => {
      if (comp.platform === '1') {
        state.operators.push(comp);
      }
      // console.log(comp,'DDPPAAPPAAPPAD');
    });
    console.log(temporary);
    state.operators = [...state.operators, ...temporary];
    console.log(state.operators, 'state.operators');
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

/**
 * 回写项目的时候判断是否有datatable和psi相连
 */
function estimatePrivacyExchangeData() {
  graphInfo.value.edges.forEach((edge) => {
    const sourceNode = graphInfo.value.nodes.find(
      (node) => node.graphNodeId === edge.source,
    );
    const targetNode = graphInfo.value.nodes.find(
      (node) => node.graphNodeId === edge.target,
    );
    if (
      !sourceNode.label.includes('数据读入_1') &&
      !targetNode?.label.includes('求交_1')
    )
      return;
    const arr = edge.edgeId.split('__');
    console.log(arr, 'AAAAAAAAAAAAAAARRRRRRRRRRRRRRR');
    const index = Number(arr[1][arr[1].length - 1]) + 1;
    getPrivacyExchangeData(
      sourceNode.graphNodeId,
      `input_ds${index}`,
      // arr[1][arr[1].length - 1] === '1' ? 'input_ds2' : 'input_ds1',
    );
  });
}

// 这个方法是回写画布的
async function setCurrentAlgorithms() {
  if (!JSON.parse(localStorage.getItem('graphInfo'))) {
    return;
  }
  graphInfo.value = JSON.parse(localStorage.getItem('graphInfo'));
  estimatePrivacyExchangeData();
  const algMap = {};
  const zhAlgMap = {};
  state.operators.forEach((item) => {
    algMap[item.name] = item;
    zhAlgMap[item.labelName] = item;
  });
  console.log(algMap, zhAlgMap, 'algMapalgMap');
  graphInfo.value.nodes.forEach((item, i) => {
    console.log(item, '这里是ITEM');

    const node = {
      data: {
        // component_name: item.label,
        component_module: item.label.slice(0, -2),
        // component_module: item.label,
        dataIndex: i,
        // algorithm_name: item.label
        algorithm_name: item.label.slice(0, -2),
      },
      label: item.label,
      type:
        algMap[item.label.slice(0, -2)]?.module ??
        zhAlgMap[item.label.slice(0, -2)]?.module,
      // type: item.label,
      x: item.x,
      y: item.y,
    };
    console.log({ node, algMap, zhAlgMap });
    GraphViewerRef.value.addSecretflowNode(node);
  });
  GraphViewerRef.value.addSecretflowEdges(graphInfo.value);
}

onMounted(async () => {
  await getOperators();
  await setCurrentAlgorithms();
  await nextTick();
  timerId = setTimeout(() => {
    if (
      !localStorage.getItem('projectParams') ||
      localStorage.getItem('projectParams') === 'null'
    )
      return;
    const dom = Array.from(
      document.querySelectorAll('.graph-area .graph-node-wrapper'),
    );
    const paramsKey = Object.keys(
      JSON.parse(localStorage.getItem('projectParams')),
    );
    dom.forEach((dom) => {
      if (paramsKey.some((key) => dom.innerHTML.includes(key))) {
        dom.style.borderBottom = '6px solid #2a50ec';
      }
    });
    if (dom.length !== 0) {
      clearTimeout(timerId);
    }
  }, 0);
});

const data = ref();

async function onClickNode(item) {
  console.log(item, '节点数据在这里a');
  if (!state.editable) return; // 如果不可编辑，直接退出

  logDrawer.visible = ['SUCCEED', 'FAILED'].includes(
    localStorage.getItem('currentNodeStatus'),
  );
  currentNode.value = item.node;
  graph.value = GraphViewerRef.value?.getGraph();
  console.log(item, '111123');
  const algMap = {};
  const zhAlgMap = {};
  state.operators.forEach((item) => {
    algMap[item.name] = item;
    zhAlgMap[item.labelName] = item;
  });
  console.log(zhAlgMap, '>>>>>>>>zhAlgMap');
  paramDrawer.operator = secretflwoStore.nodeDetail.find(
    (node) =>
      node.name === algMap[item.node.store.data.data.algorithm_name]?.module ||
      node.name === zhAlgMap[item.node.store.data.data.algorithm_name]?.module,
  );

  currentGraphNodeName.value = item.node.store.data.data.label;
  // 如果不是 PSI 和 评估 算子，直接显示 paramDrawer 并退出
  if (
    !item.node.store.data.data.type?.includes('psi') &&
    !item.node.store.data.data.type?.includes('predict') &&
    !item.node.store.data.data.algorithm_name?.includes('predict') &&
    !item.node.store.data.data.algorithm_name?.includes('psi')
  ) {
    paramDrawer.visible = true;
    data.value = {
      graphId: projectInfo.value.graphId,
      graphNodeId: graphInfo.value.nodes.find(
        (node) => node.label == item.node.store.data.data.label,
      ).graphNodeId,
      projectId: projectInfo.value.projectId,
    };
    console.log(data.value, 'data.value');
    return;
  }
  PrivacyExchangeData.value.nodeList = [];
  try {
    const res = await getProject({ projectId: graphInfo.value.projectId });
    const datatableListAll = graphInfo.value.nodes.filter((node) =>
      node.codeName.includes('datatable'),
    );
    const psi = graphInfo.value.nodes.find((node) =>
      node.codeName.includes('psi'),
    );

    const datatableList = datatableListAll.filter((datatable) =>
      graphInfo.value.edges.some(
        (edge) =>
          edge.source === datatable.graphNodeId &&
          edge.target === psi.graphNodeId,
      ),
    );

    if (datatableList.length === 0) {
      PrivacyExchangeData.value = { nodeList: [] };
      paramDrawer.visible = true; // 确保显示抽屉
      return;
    }

    const attrs = datatableList
      .map((datatable) => datatable.nodeDef.attrs)
      .flat();
    console.log(attrs, 'ATTRA');

    if (!attrs[0]) {
      PrivacyExchangeData.value = { nodeList: [] };
      paramDrawer.visible = true; // 确保显示抽屉
      return;
    }
    const dataIdList = attrs.map((attr) => attr?.s);

    for (const node of res.nodes) {
      const datatableId = node.datatables.find((datatable) =>
        dataIdList.includes(datatable.datatableId),
      );

      if (datatableId) {
        const ProjectDatatable = await getProjectDatatable({
          datatableId: datatableId.datatableId,
          nodeId: node.nodeId,
          projectId: graphInfo.value.projectId,
          type: 'CSV',
        });
        console.log({ ProjectDatatable });
        const currentDatatable = datatableList.find((datatable) =>
          datatable.nodeDef.attrs.some(
            (attr) => attr.s === datatableId.datatableId,
          ),
        );
        const targetPort = graphInfo.value.edges
          .find((edge) => edge.source === currentDatatable.graphNodeId)
          ?.edgeId.slice(-1);
        console.log({ graphInfo, currentDatatable, targetPort });
        // PrivacyExchangeData.value[
        //   targetPort === '1' ? 'input_ds2' : 'input_ds1'
        // ] = ProjectDatatable.configs;
        // const index = currentDatatable.graphNodeId.replace(`${graphInfo.value.graphId}-node-`, '')
        // console.log({ index, ProjectDatatable: ProjectDatatable.configs })
        PrivacyExchangeData.value[`input_ds${Number(targetPort) + 1}`] =
          ProjectDatatable.configs;
        PrivacyExchangeData.value.nodeList.push(node);
      }
    }

    console.log(
      res,
      datatableList,
      dataIdList,
      PrivacyExchangeData.value,
      'getProject',
    );
  } catch (error) {
    console.error('Error in fetchProjectData:', error);
  } finally {
    paramDrawer.visible = true; // 无论如何都要显示抽屉
    data.value = {
      graphId: projectInfo.value.graphId,
      graphNodeId: graphInfo.value.nodes.find(
        (node) => node.label == item.node.store.data.data.label,
      ).graphNodeId,
      projectId: projectInfo.value.projectId,
    };
    console.log(data.value, 'data.value');
  }
}

function onSwitchSide() {
  state.expanded = !state.expanded;
}

function goProjectPage() {
  cleanLocalStorage();
  router.push({
    name: 'project',
    query: {
      projectName: route.query.projectName,
      id: route.query.projectId,
      action: FormType.READ,
      type: 1,
    },
  }); // http://localhost:5173/#/project?projectName=联合建模1107&id=1986611313994878976&action=%E6%9F%A5%E7%9C%8B&type=1&dpToken=7d1c7a2ce09d46388a03077b7be290ba
}

function onEdit() {
  state.editable = true;
}

function cleanLocalStorage() {
  localStorage.setItem('projectInfo', null);
  localStorage.setItem('projectParams', null);
  localStorage.setItem('graphInfo', null);
}

async function onSave() {
  goProjectPage();
}

function onCancelEdit() {
  state.editable = false;
  router.push({
    name: 'project',
    query: {
      projectName: route.query.projectName,
      id: route.query.projectId,
      action: FormType.READ,
      type: 1,
    },
  });
}

onBeforeUnmount(() => {
  cleanLocalStorage();
});

function onCloseParamDrawer() {
  paramDrawer.visible = false;
  paramDrawer.operatorType = null;
  // logDrawer.visible = false;
  // logDrawer1.visible = false;
}

// 两个算子的边相连时触发(保存)
async function onEdgeConnected(view, edge) {
  if (!core.value === 1) return;
  let targetIndex = '';
  let sourceIndex = '';

  // 取出左侧节点的名称，判断他连接的是否是左侧节点
  const leftCellTargetName = view.targetView.cell.port.ports[0].group;
  const targetPort = view.cell.store.data.target.port;
  const sourcePort = view.cell.store.data.source.port;
  const sourcePortList = view.sourceView.cell.port.ports.filter(
    (port) => port.portType == 'output',
  );

  const sourceName = view.sourceView.cell.store.data.data.label;
  const targetName = view.targetView.cell.store.data.data.label;
  const graphId = projectInfo.value.graphId;

  const targetNode = graphInfo.value.nodes.find((node, i) => {
    if (node.label === targetName) {
      targetIndex = node.graphNodeId.split('-')[2];
      return node;
    }
  });

  const sourceNode = graphInfo.value.nodes.find((node, i) => {
    if (node.label === sourceName) {
      sourceIndex = node.graphNodeId.split('-')[2];
      return node;
    }
  });

  const targetPorts = view.targetView.cell.port.ports;
  const targetPortNameList = targetPorts.map((item) => item.group);
  const inputIndex = targetPortNameList.indexOf(targetPort);
  console.log(
    inputIndex,
    targetPort,
    targetPortNameList,
    sourceNode,
    '最后一次',
  );
  // 确保 inputs 数组长度足够
  while (targetNode.inputs.length <= inputIndex) {
    targetNode.inputs.push(null);
  }

  // 在正确的位置设置输入值
  targetNode.inputs[inputIndex] =
    // sourcePort === 'test_ds' ? sourceNode.outputs[1] : sourceNode.outputs[0];
    sourceNode.outputs.length == 1
      ? sourceNode.outputs[0]
      : sourceNode.outputs[inputIndex];

  console.log(view);
  console.log(targetNode, view, 'ZHELI');
  // const targetAnchor = targetNode.inputs[0] === null ? `${graphId}-node-${targetIndex + 1}-input-${targetNode.inputs.length - 2}` : `${graphId}-node-${targetIndex + 1}-input-${targetNode.inputs.length - 1}`
  let targetAnchor = '';
  const targetPortId = view.cell.store.data.target.port;

  // 根据实际连接的端口ID查找在端口列表中的索引位置
  const portIndex = targetPorts.findIndex((port) => port.id === targetPortId);
  if (portIndex !== -1) {
    // 找到了对应的端口，使用实际的索引
    targetAnchor = `${graphId}-node-${targetIndex}-input-${portIndex}`;
  } else if (targetPorts.length === 1) {
    // 兼容只有一个端口的情况
    targetAnchor = `${graphId}-node-${targetIndex}-input-0`;
  } else {
    // 默认使用索引0
    targetAnchor = `${graphId}-node-${targetIndex}-input-0`;
  }

  const sourcePortIdx = sourcePortList.findIndex(
    (port) => port.id == sourcePort,
  );
  graphInfo.value.edges.push({
    edgeId: `${sourceNode.outputs[sourcePortIdx]}__${targetAnchor}`,
    source: `${graphId}-node-${sourceIndex}`,
    sourceAnchor: sourceNode.outputs[sourcePortIdx],
    target: `${graphId}-node-${targetIndex}`,
    targetAnchor,
  });
  delete graphInfo.value.dataSourceConfig;
  const edgeData = edge.getData();
  // 2. 更新边的数据（添加标识符）
  edge.setData({
    ...edgeData,
    edgeId: `${
      sourceNode.outputs[sourcePort === 'test_ds' ? 1 : 0]
    }__${targetAnchor}`,
  });
  await fullUpdateGraph(graphInfo.value);
  localStorage.setItem('graphInfo', JSON.stringify(graphInfo.value));
  if (
    (!sourceName.includes('数据读入_1') && !targetName.includes('求交_1')) ||
    (!sourceName.includes('数据读入_1') && !targetName.includes('三方隐私求交'))
  )
    return;
  getPrivacyExchangeData(
    sourceNode.graphNodeId,
    view.cell.store.data.target.port,
  );
}

// 往画布上添加算子的时候触发(保存)
async function onAddNode(node, index, options) {
  if (core.value != 1) return;
  const nodes = GraphViewerRef.value.getNodes();
  const nodeName = node.store.data.data.algorithm_name;
  let max = 0;
  const algMap = {};
  const zhAlgMap = {};
  state.operators.forEach((item) => {
    algMap[item.name] = item;
    zhAlgMap[item.labelName] = item;
  });
  console.log(node, algMap, nodeName, 'nodeName在这');
  graphInfo.value = graphInfo.value
    ? graphInfo.value
    : await getGraphDetail({
        projectId: projectInfo.value.projectId,
        graphId: projectInfo.value.graphId,
      });

  //   //防止回写画布内容的时候触发这个方法反复添加节点
  if (
    graphInfo.value.nodes.some(
      (item) => item.label === node?.store?.data.data.label,
    )
  )
    return;

  const currentNode = secretflwoStore.nodeDetail.find(
    (item) =>
      item.name === algMap[nodeName]?.module ||
      item.name === zhAlgMap[nodeName]?.module,
  );
  console.log(currentNode, '>>>>>>>>>currentNode');
  if (!currentNode) return;
  console.log(
    JSON.stringify(graphInfo.value.nodes),
    'graphInfo.value.nodesgraphInfo.value.nodes',
  );
  graphInfo.value.nodes.forEach((node) => {
    if (max < node.graphNodeId.split('-')[2]) {
      max = node.graphNodeId.split('-')[2];
    }
  });
  console.log(currentNode, 'currentNode');
  graphInfo.value.nodes.push({
    codeName: `${currentNode.domain}/${currentNode.name}`,
    graphNodeId: `${projectInfo.value.graphId}-node-${max - 0 + 1}`,
    inputs: [],
    label: node.store.data.data.label,
    nodeDef: {
      domain: currentNode.domain,
      name: currentNode.name,
      version: currentNode.version,
    },
    outputs: [],
    x: node.store.data.position.x,
    y: node.store.data.position.y,
  });
  currentNode.outputs.forEach((output, i) => {
    // graphInfo.value.nodes[graphInfo.value.nodes.length - 1].outputs = [`${projectInfo.value.graphId}-node-${nodes.length}-output-0`]
    graphInfo.value.nodes[graphInfo.value.nodes.length - 1].outputs.push(
      `${projectInfo.value.graphId}-node-${max - 0 + 1}-output-${i}`,
    );
  });
  delete graphInfo.value.dataSourceConfig;
  await fullUpdateGraph(graphInfo.value);
  localStorage.setItem('graphInfo', JSON.stringify(graphInfo.value));
}

/**
 * @description 删除节点或边时触发
 */
async function onCellRemove(cell) {
  console.log(cell, 'cellolo');
  if (!core.value || core.value === 2) return;
  if (cell.store.data.shape === 'edge') {
    graphInfo.value.edges.forEach((edge, i) => {
      if (edge.edgeId == cell.store.data.data.edgeId) {
        graphInfo.value.edges.splice(i, 1);
      }
    });
  } else {
    let nodeId = '';
    graphInfo.value.nodes.forEach((node, i) => {
      if (node.label == cell.store.data.data.label) {
        nodeId = node.graphNodeId;
        graphInfo.value.nodes.splice(i, 1);
      }
    });
    graphInfo.value.edges.forEach((edge, i) => {
      if (edge.source == nodeId || edge.target == nodeId) {
        graphInfo.value.edges.splice(i, 1);
      }
    });
  }
  localStorage.setItem('graphInfo', JSON.stringify(graphInfo.value));
  delete graphInfo.value.dataSourceConfig;
  await fullUpdateGraph(graphInfo.value);
}

// 获取隐私求交下拉的值
async function getPrivacyExchangeData(targetNodeId, targetPort) {
  const currentNode = graphInfo.value.nodes.find(
    (item) => item.graphNodeId === targetNodeId,
  );
  if (!currentNode.nodeDef.attrs) return;
  const data = await getProject({ projectId: projectInfo.value.projectId });
  let nodeId = '';
  data.nodes.forEach((item) => {
    if (
      item.datatables?.some(
        (datatable) => datatable.datatableId === currentNode.nodeDef.attrs[0].s,
      )
    ) {
      nodeId = item.nodeId;
    }
  });
  if (!nodeId) return;
  const res = await getProjectDatatable({
    projectId: projectInfo.value.projectId,
    datatableId: currentNode.nodeDef.attrs[0].s,
    nodeId,
    type: 'CSV',
  });
  console.log(res, targetPort, 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

  PrivacyExchangeData.value[targetPort] = res.configs;
}

let pollingInterval = null;

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

async function onRun() {
  insertAnimationCSS(); // 确保样式注入
  console.log(graphInfo.value.nodes, 'graphInfo.value.nodes11');
  try {
    const scretflowProject = await getProject({
      projectId: graphInfo.value.projectId,
    });
    await refreshDatas(
      scretflowProject.nodes
        .filter((item) => item.datatables !== null)
        .map((item) => {
          return {
            domainId: item.nodeId,
            datalds: item.datatables.map((db) => db.datatableId),
          };
        }),
    );

    const response = await startGraph({
      graphId: projectInfo.value.graphId,
      projectId: projectInfo.value.projectId,
      nodes: graphInfo.value.nodes.map((item) => item.graphNodeId),
    });
    ElMessage.success('操作成功');
    startPollingStatus();
  } catch (error) {
    ElMessage.error(error);
    console.error('运行失败:', error);
  }
}
const isRunning = ref(false);

// 2. 增强版的轮询控制
const startPollingStatus = () => {
  stopPolling(); // 先停止已有轮询
  fetchStatus(); // 立即执行一次
  isRunning.value = true;
  pollingInterval = setInterval(fetchStatus, 2000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    isRunning.value = false;
  }
};

// 3. 带调试日志的状态检查
const fetchStatus = async () => {
  try {
    const response = await getStatus({
      graphId: projectInfo.value.graphId,
      projectId: projectInfo.value.projectId,
    });
    localStorage.setItem('nodeStatusInfo', JSON.stringify(response.nodes));
    const graph = GraphViewerRef.value?.getGraph();
    const edges = graph.getEdges();

    // 1. 调试输出节点和边信息
    console.log(
      '当前节点状态:',
      response.nodes.map((n) => `${n.graphNodeId}:${n.status}`),
    );
    console.log('边数量:', edges.length);

    // 2. 先清除所有动画
    edges.forEach((edge) => {
      edge.attr({
        line: {
          strokeDasharray: '',
          style: {
            animation: 'none',
            stroke: edge.attr('line/stroke'), // 强制触发重绘
          },
        },
      });
    });

    // 3. 仅对RUNNING节点的连线添加动画
    if (!response.finished) {
      const runningNodeIds = response.nodes
        .filter((node) => node.status === 'RUNNING')
        .map((node) => node.graphNodeId);

      console.log('RUNNING节点ID:', runningNodeIds);

      edges.forEach((edge) => {
        const sourceId = edge.getSourceCell()?.store.changed.zIndex;
        const targetId = edge.getTargetCell()?.store.changed.zIndex;
        const edgeId = edge?.store?.data?.data.edgeId;
        // 只需要target的节点ID
        const targetNodeId = edgeId.split('__')[1];

        console.log(edge, edge.getTargetCell(), '>>>edge.getTargetCell()');

        // const tempRunningNodeIds = runningNodeIds.map((i) =>
        //   Number(i[i.length - 1]),
        // );

        // console.log(
        //   'tempRUNNING节点ID:',
        //   sourceId,
        //   targetId,
        // );

        // const isActive =
        //   (sourceId && tempRunningNodeIds.includes(sourceId)) ||
        //   (targetId && tempRunningNodeIds.includes(targetId));
        const isActive = runningNodeIds.some((item) =>
          targetNodeId.includes(item),
        );

        if (isActive) {
          console.log(`激活边: ${edge.id} (${sourceId} -> ${targetId})`);
          edge.attr({
            line: {
              strokeDasharray: 5,
              style: {
                animation: 'running-line 30s linear infinite',
                stroke: edge.attr('line/stroke'), // 强制重绘
              },
            },
          });
        }
      });
    } else {
      stopPolling();
    }
  } catch (error) {
    console.error('轮询出错:', error);
  }
};

const resultData = ref({
  tableData: [],
  tableDataHeader: [],
});
const resultInfo = ref();

const onCheckResult = async (node) => {
  try {
    resultData.value.tableData = [];
    resultData.value.tableDataHeader = [];

    console.log(graphInfo, node, 'graphInfographInfo');
    const currentNodeInfo = graphInfo.value.nodes.find(
      (item) => item.label == node.label,
    );
    const outputData = await getOutputData({
      graphId: projectInfo.value.graphId,
      graphNodeId: currentNodeInfo?.graphNodeId,
      outputId: currentNodeInfo.outputs[0],
      projectId: projectInfo.value.projectId,
    });
    resultInfo.value = {
      name: `${projectInfo.value.graphId}-node-${node.dataIndex + 4}-output-0`,
      time: outputData.gmtCreate,
      paths: [],
    };
    if (outputData.meta) {
      outputData.meta.rows.forEach((row) => {
        const fields = row.fields.split(',');
        const types = row.fieldTypes.split(',');
        fields.forEach((field, index) => {
          resultData.value.tableData.push({
            node: row.nodeName,
            field: field.trim(),
            type: types[index].trim(),
          });
        });
        resultData.value.tableDataHeader = [
          { name: 'node', zhName: '节点' },
          { name: 'field', zhName: '字段' },
          { name: 'type', zhName: '类型' },
        ];
        resultInfo.value.paths.push({
          name: row.nodeId,
          path: row.path,
        });
      });
    } else if (outputData.tabs) {
      const tableData = outputData.tabs[0].divs[0].children[0].table;
      resultData.value.tableDataHeader = tableData.headers;
      tableData.rows.forEach((row) => {
        const obj = {};
        row.items.forEach((item, i) => {
          obj[resultData.value.tableDataHeader[i].name] = item.s;
        });
        obj['name'] = row.name;
        resultData.value.tableData.push(obj);
      });
    }
    resultDrawer.visible = true;
  } catch (error) {
    ElMessage.error(error || '获取数据失败');
  }
};
</script>
<template>
  <div class="project-edit">
    <div class="header">
      <el-button type="text" :icon="ArrowLeft" @click="goProjectPage"
        >返回
      </el-button>
      <div class="graph-operations">
        <el-icon type="primary" @click="onZoomIn">
          <zoom-in />
        </el-icon>
        <el-icon type="primary" @click="onZoomOut">
          <zoom-out />
        </el-icon>
        <!-- <el-icon v-show="state.editable" type="primary" @click="onGraphClear">
                    <delete />
                </el-icon> -->
        <el-icon type="primary" @click="onAutoZoom">
          <location />
        </el-icon>
        <el-icon
          v-show="state.editable"
          type="primary"
          @click="onGraphRollback"
        >
          <refresh-left />
        </el-icon>
        <el-icon type="primary" @click="toggleFullScreen">
          <full-screen />
        </el-icon>
      </div>
      <C2Transition>
        <div v-show="state.editable" class="action-button">
          <el-button type="primary" @click="onSave"> 保存</el-button>
          <el-button
            type="primary"
            @click="onRun"
            id="animate-button"
            :disabled="isRunning"
          >
            {{ isRunning ? '运行中' : '运行' }}</el-button
          >
          <el-button @click="onCancelEdit">取消</el-button>
        </div>
      </C2Transition>
    </div>
    <div class="content">
      <C2Transition>
        <div v-show="state.expanded" class="side">
          <ProjectInfoPanel
            :info="projectInfo"
            :editable="state.editable"
            @edit="onEdit"
          />
          <SecretflowGraphMenu
            v-loading="state.loading"
            :groups="operatorCategories.reverse()"
            :menus="categories"
            :editable="state.editable"
          />
        </div>
      </C2Transition>
      <!-- <div class="side-tool"
           :class="{ fold: !state.expanded }">
        <el-icon @click="onSwitchSide">
          <fold v-if="state.expanded" />
          <expand v-else />
        </el-icon>
      </div> -->
      <div class="graph-area" :class="{ wide: !state.expanded }">
        <GraphViewer
          ref="GraphViewerRef"
          :editable="state.editable"
          @click-node="onClickNode"
          @delete="onCellRemove"
          @edge-connected="onEdgeConnected"
          @add-node="onAddNode"
          @check-result="onCheckResult"
        />
        <div class="log-container" v-if="logDrawer.visible">
          <div>平台日志</div>
          <el-icon
            @click="
              logDrawer1.visible = true;
              logDrawer.visible = false;
            "
          >
            <ArrowUp />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
  <C2Transition>
    <SecretflowAlgorithmParamDrawer
      v-if="paramDrawer.visible"
      :info="projectInfo"
      :operator="paramDrawer.operator"
      :currentGraphNodeName="currentGraphNodeName"
      :graph="graph"
      :currentNode="currentNode"
      :graphInfo="graphInfo"
      :PrivacyExchangeData="PrivacyExchangeData"
      @close="onCloseParamDrawer"
    />
  </C2Transition>
  <C2Transition>
    <ResultDrawer
      v-if="resultDrawer.visible"
      :data="resultData"
      :info="resultInfo"
      @close="resultDrawer.visible = false"
    />
  </C2Transition>
  <C2Transition>
    <LogDrawer
      v-if="logDrawer1.visible"
      @close="
        logDrawer1.visible = false;
        logDrawer.visible = true;
      "
      @closeAll="onCloseParamDrawer"
      :data="data"
    />
  </C2Transition>
</template>
<style scoped lang="scss">
$header-tool-height: 40px;
$side-tool-height: 32px;
$side-width: 300px;
$project-info-height: 100px;

.project-edit {
  height: 100%;
  padding-top: 20px;

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
      //   width: 220px;
      //   margin-left: auto;
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
    // height: calc(100% - #{$side-tool-height});
    overflow: auto;
    box-shadow: 2px 4px 12px 0px rgba(67, 118, 255, 0.2);

    .project-info {
      height: $project-info-height;
    }

    .stencil {
      height: calc(100% - #{$project-info-height});
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

    .graph-viewer-container {
      height: calc(100% - 32px) !important;
    }

    &.wide {
      width: 100%;
    }
  }
}

.log-container {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 500px);
  padding-left: 10px;
  color: #000000e6;
  font-size: 14px;
  position: relative;
  z-index: 9999;

  .el-icon {
    cursor: pointer;
  }
}
</style>
