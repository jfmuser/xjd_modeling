<script setup>
import { computed, reactive, onMounted} from 'vue';
import {Graph, Addon} from '@antv/x6';
import insertCss from 'insert-css';
import { inEffectAlgorithmList } from '../../../apis/workspace/algorithm.api';

const state = reactive({
  operators: [],
  dict: {
    reader: '数据读取',
    data_transform: '数据接入',
    feature_engineering: '特征工程',
    information_retrieval:'信息检索',
    sample_intersection:'样本求交',
    federated_training: '联合训练',
    federated_inference: '联合推理',
    post_quantum_cryptography: '后量子加密',
    cn_securety: '国密密态加密',
    model_eval:'模型评估'
  },
});
const categories = computed(()=>{
  return state.operators.reduce((result, current) => {
    let target = result.find((item) => item.key === current.category);
    if (!target) {
      target = {
        name: state.dict[current.category],
        key: current.category,
        id: current.algorithmId,
        operators: [],
      };
      result.push(target);
    }
    target.operators.push(current);
    return result;
  }, []);
})

// const projectInfo = computed(()=>{
//   return JSON.parse(localStorage.getItem('projectInfo'));
// })
// const projectJson = computed(()=> {
//   return projectInfo.value.projectJson;
// })
// const jobRuntimeConf = computed(()=> {
//   return projectJson.value.job_runtime_conf;
// })

const operatorCategories = computed(()=>{
  return categories.value.map((item) => ({
    title: item.name,
    name: item.key,
    algorithmId: item.algorithmId,
    graphHeight: 10 + item.operators.length * 60,
  }));
})

async function fetchOperators() {
  try {
    state.loading = true;
    const readers = await inEffectAlgorithmList('reader');
    const dataTransforms = await inEffectAlgorithmList('data_transform');
    const featureEngineering = await inEffectAlgorithmList('feature_engineering');
    const informationRetrieval = await inEffectAlgorithmList('information_retrieval');
    const sampleIntersection = await inEffectAlgorithmList('sample_intersection');
    const federatedTraining = await inEffectAlgorithmList('federated_training');
    const federatedInference = await inEffectAlgorithmList('federated_inference');
    state.operators = [
      ...readers,
      ...dataTransforms,
      ...featureEngineering,
      ...informationRetrieval,
      ...sampleIntersection,
      ...federatedTraining,
      ...federatedInference
    ];
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}

let graph = null;
let stencil = null;

const ports = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
  },
  items: [
    {
      group: 'top',
    },
    {
      group: 'bottom',
    },
  ],
};

Graph.registerNode(
  'custom-rect',
  {
    inherit: 'rect',
    width: 200,
    height: 36,
    attrs: {
      body: {
        strokeWidth: 1,
        stroke: '#5F95FF',
        fill: '#EFF4FF',
      },
      text: {
        fontSize: 12,
        fill: '#262626',
      },
    },
    ports: { ...ports },
  },
  true,
);

// function showPorts(ports, show) {
//   for (let i = 0, len = ports.length; i < len; i = i + 1) {
//     ports[i].style.visibility = show ? 'visible' : 'hidden';
//   }
// }

onMounted(async () => {
  state.model = JSON.parse(localStorage.getItem("projectInfo"));
  await fetchOperators();
  // console.log("operators>>", state.operators)
  // console.log("categories>>", categories)
  // console.log("projectInfo>>", projectInfo)
  // console.log("operatorCategories>>",operatorCategories)
  preWork();
  graph = new Graph({
    container: document.getElementById('graph-container'),
    // grid: true,
    // history: true,
    // keyboard: true,
    // rotating: true,
    // mousewheel: {
    //   enabled: true,
    //   zoomAtMousePosition: true,
    //   modifiers: 'ctrl',
    //   minScale: 0.5,
    //   maxScale: 3,
    // },
    // connecting: {
    //   router: {
    //     name: 'manhattan',
    //     args: {
    //       padding: 1,
    //     },
    //   },
    //   connector: {
    //     name: 'rounded',
    //     args: {
    //       radius: 8,
    //     },
    //   },
    //   anchor: 'center',
    //   connectionPoint: 'anchor',
    //   allowBlank: false,
    //   snap: {
    //     radius: 20,
    //   },
      // createEdge() {
      //   return new Shape.Edge({
      //     attrs: {
      //       line: {
      //         stroke: '#A2B1C3',
      //         strokeWidth: 2,
      //         targetMarker: {
      //           name: 'block',
      //           width: 12,
      //           height: 8,
      //         },
      //       },
      //     },
      //     zIndex: 0,
      //   });
      // },
      // validateConnection({
      //                      targetMagnet,
      //                      sourceMagnet,
      //                      targetPort,
      //                      targetCell,
      //                      sourceCell,
      //                      sourcePort,
      //                    }) {
      //   if (sourceMagnet.getAttribute('port-group') === 'top') {
      //     return false;
      //   }
      //
      //   if (
      //     !targetMagnet ||
      //     targetMagnet.getAttribute('port-group') === 'bottom'
      //   ) {
      //     return false;
      //   }
      //
      //   const targetPortCell = targetCell.getPort(targetPort);
      //   if (targetPortCell && targetPortCell.connected) {
      //     return false;
      //   }
      //
      //   const sourcePortCell = sourceCell.getPort(sourcePort);
      //   return !(sourcePortCell && sourcePortCell.connected);
      //
      // },
    // },
    // highlighting: {
    //   magnetAdsorbed: {
    //     name: 'stroke',
    //     args: {
    //       attrs: {
    //         fill: '#5F95FF',
    //         stroke: '#5F95FF',
    //       },
    //     },
    //   },
    // },
    // selecting: {
    //   enabled: true,
    //   rubberband: true,
    //   showNodeSelectionBox: true,
    // },
    // snapline: true,
    // clipboard: true,
  });

  stencil = new Addon.Stencil({
    // title: '',
    // placeholder: '',
    // notFoundText: '',
    target: graph,
    stencilGraphWidth: 210,
    groups: operatorCategories.value,
    layoutOptions: {
      columns: 1,
      columnWidth: 155,
      rowHeight: 55,
      resizeToFit: true,
      center: true,
    },
  });
  document.getElementById('stencil').appendChild(stencil.container);

  // graph.bindKey(['meta+c', 'ctrl+c'], () => {
  //   const cells = graph.getSelectedCells();
  //   if (cells.length) {
  //     graph.copy(cells);
  //   }
  //   return false;
  // });
  // graph.bindKey(['meta+x', 'ctrl+x'], () => {
  //   const cells = graph.getSelectedCells();
  //   if (cells.length) {
  //     graph.cut(cells);
  //   }
  //   return false;
  // });
  // graph.bindKey(['meta+v', 'ctrl+v'], () => {
  //   if (!graph.isClipboardEmpty()) {
  //     const cells = graph.paste({ offset: 32 });
  //     graph.cleanSelection();
  //     graph.select(cells);
  //   }
  //   return false;
  // });
  //
  // graph.bindKey(['meta+a', 'ctrl+a'], () => {
  //   const nodes = graph.getNodes();
  //   if (nodes) {
  //     graph.select(nodes);
  //   }
  // });
  //
  // graph.bindKey('backspace', () => {
  //   const cells = graph.getSelectedCells();
  //   if (cells.length) {
  //     graph.removeCells(cells);
  //   }
  // });
  // graph.on('node:mousemove', () => {
  //   const container = document.getElementById('graph-container');
  //   const ports = container.querySelectorAll('.x6-port-body');
  //   showPorts(ports, true);
  // });
  // graph.on('node:mouseenter', () => {
  //   const container = document.getElementById('graph-container');
  //   const ports = container.querySelectorAll('.x6-port-body');
  //   showPorts(ports, true);
  // });
  // graph.on('node:mouseleave', () => {
  //   const container = document.getElementById('graph-container');
  //   const ports = container.querySelectorAll('.x6-port-body');
  //   showPorts(ports, false);
  // });
  //
  // graph.on('node:click', ({ node }) => {
  //   const modelLabel = node.label;
  //   if (!modelLabel) {
  //     return;
  //   }
  //   this.showEditDrawer = true;
  //   this.operatorType = modelLabel;
  // });
  //
  // graph.on('edge:connected', ({ currentCell, currentPort, isNew, edge }) => {
  //   currentCell.setPortProp(currentPort, 'connected', true);
  //   if (isNew) {
  //     const sourceCell = edge.getSourceCell();
  //     sourceCell.setPortProp(edge.source.port, 'connected', true);
  //   }
  // });

  categories.value.forEach((item) => {
    const nodes = item.operators.map((item) =>
      graph.createNode({
        shape: 'custom-rect',
        label: item.name,
        attrs: {
          body: {
            rx: 10,
            ry: 50,
          },
        },
      }),
    );
    stencil.load(nodes, item.key);
  });

  // if (projectInfo.value.id) {
  //   state.operators.forEach((algorithm) => {
  //     this.addNode(algorithm.name, graph);
  //   })
  // }
});

function preWork() {
  const container = document.getElementById('container');
  const stencilContainer = document.createElement('div');
  stencilContainer.id = 'stencil';
  const graphContainer = document.createElement('div');
  graphContainer.id = 'graph-container';
  container.appendChild(stencilContainer);
  container.appendChild(graphContainer);
  insertCss(`
    #container {
      display: flex;
      position: relative;
    }
    .x6-widget-stencil {
      background-color: #ffffff;
    }
    .x6-graph-svg-viewport{
      margin-left: auto;
    }
    #stencil {
      width: 210px;
      height: 100%;
      position: relative;
    }
    #graph-container {
      width: calc(100% - 210px);
      height: 100%;
    }
    .x6-widget-transform {
      margin: -1px 0 0 -1px;
      padding: 0px;
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
      background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
      background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
      border-radius: 0;
    }
    .x6-widget-selection-inner {
      border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
      opacity: 0;
    }
    .x6-widget-stencil-group > .x6-widget-stencil-group-title {
     background: #ffffff;
}
  `);
}
</script>

<template>
    <div id="container"></div>
<!--    <el-collapse v-if="categories.length > 0" :bordered="false">-->
<!--    <el-collapse-item-->
<!--      v-for="category in categories"-->
<!--      :key="category.key"-->
<!--      :name="category.key"-->
<!--      :title="category.name"-->
<!--    >-->
<!--      <ul v-if="category.operators.length>0">-->
<!--        <li v-for="operator in category.operators" :key="operator.algorithmId">{{operator.name}}</li>-->
<!--      </ul>-->
<!--    </el-collapse-item>-->
<!--    </el-collapse>-->
</template>

<style scoped lang="scss">
#container {
  height: 800px;
}
</style>