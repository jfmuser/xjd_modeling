import { onMounted, ref } from 'vue';
import { Graph, Platform, Dom } from '@antv/x6';
import { $primary } from '../styles/variables.js';
import Operator from '../utils/Operator';
import { ElMessage } from 'element-plus';

export default function ({ onNodeClick, modelType }) {
  let flowPage;
  const flowPageRef = ref(null);

  onMounted(() => {
    initMap();
  });
  function initMap() {
    Graph.registerNode(
      'algo-node',
      {
        inherit: 'rect',
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: $primary,
            fill: '#fff',
            rx: 15,
            ry: 15,
          },
        },
        portMarkup: [
          {
            tagName: 'foreignObject',
            selector: 'fo',
            attrs: {
              width: 10,
              height: 10,
              x: -5,
              y: -5,
              magnet: 'true',
            },
            children: [
              {
                ns: Dom.ns.xhtml,
                tagName: 'body',
                selector: 'foBody',
                attrs: {
                  xmlns: Dom.ns.xhtml,
                },
                style: {
                  width: '100%',
                  height: '100%',
                },
                children: [
                  {
                    tagName: 'div',
                    selector: 'content',
                    style: {
                      width: '100%',
                      height: '100%',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      true,
    );

    Graph.registerConnector(
      'algo-edge',
      (source, target) => {
        const offset = 4;
        const control = 80;
        const v1 = { x: source.x, y: source.y + offset + control };
        const v2 = { x: target.x, y: target.y - offset - control };

        return `M ${source.x} ${source.y} L ${source.x} ${
          source.y + offset
        } C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${target.x} ${
          target.y - offset
        } L ${target.x} ${target.y}
        `;
      },
      true,
    );

    const graph = new Graph({
      panning: true,
      grid: true,
      container: flowPageRef.value,
      highlighting: {
        nodeAvailable: {
          name: 'className',
          args: {
            className: 'available',
          },
        },
        magnetAvailable: {
          name: 'className',
          args: {
            className: 'available',
          },
        },
        magnetAdsorbed: {
          name: 'className',
          args: {
            className: 'adsorbed',
          },
        },
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        sourceAnchor: {
          name: 'bottom',
          args: {
            dx: Platform.IS_SAFARI ? 5 : 0,
          },
        },
        targetAnchor: {
          name: 'center',
          args: {
            dx: Platform.IS_SAFARI ? 5 : 0,
          },
        },
        connectionPoint: 'anchor',
        connector: 'algo-edge',
        createEdge() {
          return graph.createEdge({
            attrs: {
              line: {
                strokeDasharray: '5 5',
                stroke: '#808080',
                strokeWidth: 1,
                targetMarker: {
                  name: 'block',
                  args: {
                    size: '6',
                  },
                },
              },
            },
          });
        },
        validateMagnet({ magnet }) {
          return magnet.getAttribute('port-group') !== 'in';
        },
        validateConnection({ targetView, sourceMagnet, targetMagnet }) {
          // 只能从输出链接桩创建连接
          if (
            !sourceMagnet ||
            sourceMagnet.getAttribute('port-group') === 'in'
          ) {
            return false;
          }

          // 只能连接到输入链接桩
          if (
            !targetMagnet ||
            targetMagnet.getAttribute('port-group') !== 'in'
          ) {
            return false;
          }

          // 判断目标链接桩是否可连接
          const portId = targetMagnet.getAttribute('port');
          const node = targetView.cell;
          const port = node.getPort(portId);
          if (port && port.connected) {
            return false;
          }

          return true;
        },
      },
    });

    graph.on('edge:connected', (args) => {
      const edge = args.edge;
      const node = args.currentCell;
      const elem = args.currentMagnet;
      const portId = elem.getAttribute('port');

      // 触发 port 重新渲染
      node.setPortProp(portId, 'connected', true);

      // 更新连线样式
      edge.attr({
        line: {
          strokeDasharray: '',
          targetMarker: '',
        },
      });
    });

    graph.on('node:click', ({ node }) => {
      const modelLabel = node.label;
      if (Operator.get(modelLabel).attrs.length === 0) {
        return;
      }
      onNodeClick(modelLabel);
    });

    flowPage = graph;
  }

  function addNode(label) {
    const existNodes = flowPage.getNodes();
    if (existNodes.find((item) => item.label === label)) {
      ElMessage.warning('节点已经存在, 不能重复添加');
      return;
    }
    const lastNode = existNodes.at(-1);
    switch (label) {
      case 'dataio':
        if (existNodes.length !== 0) {
          ElMessage.warning('"数据接入"应该在最前');
          return;
        }
        break;
      default:
        if (lastNode?.label === 'evaluation') {
          ElMessage.warning('"评估"应该在最后');
          return;
        }
    }

    const maxY = existNodes.reduce((result, current) => {
      return Math.max(result, current.store.data.position.y);
    }, 0);

    const target = flowPage.addNode({
      x: 380,
      y: maxY + 100,
      width: 160,
      height: 30,
      shape: 'algo-node',
      label,
      ports: {
        items: [
          { group: 'in', id: 'in1' },
          { group: 'out', id: 'out1' },
        ],
        groups: {
          in: {
            position: { name: 'top' },
            zIndex: 1,
          },
          out: {
            position: { name: 'bottom' },
            zIndex: 1,
          },
        },
      },
    });

    if (existNodes.length > 0) {
      flowPage.addEdge({
        source: { cell: existNodes.at(-1), port: 'out1' },
        target: { cell: target, port: 'in1' },
        connector: 'smooth',
        attrs: {
          line: {
            stroke: $primary,
          },
        },
      });
    }
  }

  function onToolClick(command) {
    const nodes = flowPage.getNodes();
    const edges = flowPage.getEdges();
    switch (command) {
      case 'clear':
        flowPage.clearCells();
        break;
      case 'zoomIn':
        flowPage.zoomTo(flowPage.zoom() + 0.1);
        break;
      case 'zoomOut':
        flowPage.zoomTo(Math.max(0, flowPage.zoom() - 0.1));
        break;
      case 'resetZoom':
        flowPage.zoomTo(1);
        break;
      case 'autoZoom':
        flowPage.zoomToFit();
        break;
      case 'rollback':
        if (nodes.length > 0) {
          flowPage.removeNode(nodes.at(-1));
        }
        if (edges.length > 0) {
          flowPage.removeEdge(edges.at(-1));
        }
        break;
      default:
        break;
    }
  }

  function gatherNodes() {
    const edges = flowPage.getEdges() || [];
    const nodes = flowPage.getNodes() || [];
    if (nodes.length === 0) {
      ElMessage.error('拓扑没有节点，请重新构建');
      return;
    }
    if (edges.length === nodes.length) {
      ElMessage.error('拓扑存在环，请重新构建');
      return;
    }
    if (edges.length !== nodes.length - 1) {
      ElMessage.error('拓扑存在环或者非连通图，请重新构建');
      return;
    }
    const sourceSet = new Set(edges.map((edge) => edge.source));
    const targetSet = new Set(edges.map((edge) => edge.target));
    targetSet.forEach((targetItem) => {
      if (sourceSet.has(targetItem)) {
        sourceSet.delete(targetItem);
      }
    });
    let entrance = nodes[0].id;
    const nodesObj = nodes.reduce((result, current) => {
      const { id, label } = current;
      result[id] = label;
      return result;
    }, {});

    const ids = [entrance];
    let flag = true;
    while (flag) {
      let idLength = ids.length;
      ids.push(
        ...edges
          .filter((item) => item.source.cell === ids.at(-1))
          .map((item) => item.target.cell),
      );
      if (ids.length === idLength) {
        flag = false;
      }
    }
    if (ids.length !== edges.length + 1) {
      ElMessage.error('拓扑存在环或者非连通图，请重新构建');
      return;
    }
    const names = ids.map((id) => nodesObj[id]);

    const categories = names.map((name) => Operator.get(name).category);
    if (categories.filter((item) => item === 'federated_training').length > 1) {
      ElMessage.error('只能存在一个联邦训练模块，请重新构建');
      return;
    }

    if (categories.indexOf('data_alignment') > 0) {
      const categoryName = modelType.value === 0 ? '特征对齐' : '样本对齐';
      ElMessage.error(`${categoryName}模块只能开头，请重新构建`);
      return;
    }

    return names;
  }

  return { addNode, onToolClick, flowPageRef, gatherNodes };
}
