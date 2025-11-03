<script>
import { h, onMounted, ref, onBeforeUnmount, watch, inject } from 'vue';
import { Graph } from '@antv/x6';
import { getGraphNodeShape, register } from './graphOperation';
import {
  secretflowRegister,
  getSecretflowGraphNodeShape,
} from '../secretflow/secretflowGraphOperation';
import { I18N } from '../../utils/key';
import useSecretflowStore from '@/stores/secretflow/secretflowInfo.store.js';
import useSiteStore from '../../stores/dept/site.store';
import dictionary from '../../utils/dictionary';
import { ElMessage } from 'element-plus';
import { getStatus } from '@/apis/secretflow/secretflow.api.js';

const siteStore = useSiteStore();

const secretflowStore = useSecretflowStore();
// 在文件顶部定义标志变量
let isButtonRemoveRegistered = false;

if (siteStore.mySite.tDomainEngineList.find((engine) => engine.engine == '1')) {
  console.log('进入了运行了');
  secretflowStore.getSecretflowI18n();
  secretflowRegister();
}
if (siteStore.mySite.tDomainEngineList.find((engine) => engine.engine == '0')) {
  register();
}
export default {
  name: 'GraphViewer',
  props: { editable: { type: Boolean, default: false } },
  emits: ['clickNode', 'edge-connected', 'add-node', 'delete', 'check-result'],
  setup(props, { emit, expose }) {
    const i18n = inject(I18N);
    const ContainerRef = ref();
    let graph;

    expose({
      addNode,
      getNodes,
      addEdge,
      getGraph,
      addEdges,
      clearCells,
      addSecretflowNode,
      addSecretflowEdges,
    });

    watch(
      () => props.editable,
      (val) => {
        graph.options.selecting.enable = val;
      },
    );

    function clearCells() {
      graph.clearCells();
    }

    function getGraph() {
      return graph;
    }

    function getNodes() {
      return graph.getNodes();
    }

    function addEdges(edges) {
      const nodes = graph.getNodes();
      for (let i = 0, l = edges.length; i < l; i += 1) {
        const edgeItem = edges[i];
        const target = nodes.find(
          (item) => item.store.data.data.label === edgeItem.target,
        );
        const source = nodes.find(
          (item) => item.store.data.data.label === edgeItem.source,
        );
        addEdge({
          target,
          source,
          targetPort: edgeItem.targetPort,
          sourcePort: edgeItem.sourcePort,
        });
      }
    }

    function addSecretflowEdges(graphInfo) {
      const nodes = graph.getNodes();
      for (let i = 0, l = graphInfo.edges.length; i < l; i += 1) {
        const edgeItem = graphInfo.edges[i];
        // 因为隐语的边数据没有节点名称，所以需要筛选两遍
        const targetNode = graphInfo.nodes.find(
          (item) => item.graphNodeId === edgeItem.target,
        );
        const sourceNode = graphInfo.nodes.find(
          (item) => item.graphNodeId === edgeItem.source,
        );
        const target = nodes.find(
          (item) => item.store.data.data.label === targetNode.label,
        );
        const source = nodes.find(
          (item) => item.store.data.data.label === sourceNode.label,
        );
        console.log(sourceNode, edgeItem, 'WOLEIGEDOUA');
        let sourcePort = '';
        if (source.port.ports.length === 1) {
          sourcePort = source.port.ports[0].group;
        } else if (source.port.ports.length === 2) {
          sourcePort = source.port.ports[1].group;
        } else if (
          (source.port.ports.length === 3 &&
            sourceNode.label.includes('随机分割')) ||
          sourceNode.label.includes('逻辑回归') ||
          sourceNode.label.includes('线性回归') ||
          sourceNode.label.includes('安全线性模型') ||
          (source.port.ports.length === 3 &&
            sourceNode.label.includes('证据权重WOE分箱'))
        ) {
          sourcePort =
            source.port.ports[
              Number(edgeItem.sourceAnchor[edgeItem.sourceAnchor.length - 1]) +
                sourceNode.inputs.length
            ].group;
        } else if (source.port.ports.length === 3) {
          sourcePort = source.port.ports[2].group;
        }
        addEdge({
          target,
          source,
          targetPort:
            edgeItem.targetAnchor[edgeItem.targetAnchor.length - 1] === '0'
              ? target.port.ports[0].group
              : target.port.ports[1].group,
          sourcePort: sourcePort,
          edgeId: edgeItem.edgeId,
        });
      }
    }

    function addEdge({
      target,
      source,
      strokeDasharray,
      sourcePort = 'dataOut',
      targetPort = 'dataIn',
      edgeId,
    }) {
      graph.addEdge({
        source: { cell: source, port: sourcePort },
        target: { cell: target, port: targetPort },
        attrs: {
          line: {
            stroke: '#2F78FF99',
            strokeDasharray,
          },
        },
        tools: [],
        data: {
          edgeId: edgeId,
        },
      });
    }

    function addNode({ role, label, type, ports, x, y, data } = {}) {
      const result = graph.addNode({
        x,
        y,
        shape: getGraphNodeShape(type),
        // shape: getGraphNodeShape(data.dependencies.slice(0,-2)),
        data: {
          label,
          role,
          type,
          ports,
          ...data,
        },
      });

      return result;
    }

    function addSecretflowNode({ role, label, type, ports, x, y, data } = {}) {
      console.log(type, 'WO错了');
      const result = graph.addNode({
        x,
        y,
        shape: getSecretflowGraphNodeShape(type),
        data: {
          label,
          role,
          type,
          ports,
          ...data,
        },
      });

      return result;
    }

    onMounted(async () => {
      render();
      // 只在未注册过的情况下注册
      if (!isButtonRemoveRegistered) {
        const removeButton = {
          name: 'button-remove',
          x: 0,
          y: 300,
          offset: { x: 10, y: 300 },
          args: {
            distance: 0.5, // 使用固定值而不是函数,
          },
          markup: [
            {
              tagName: 'circle',
              selector: 'button',
              attrs: {
                r: 8,
                stroke: '#ff4d4f',
                strokeWidth: 1,
                fill: '#fff',
                cursor: 'pointer',
              },
            },
            {
              tagName: 'path',
              selector: 'icon',
              attrs: {
                d: 'M -3 -3 3 3 M -3 3 3 -3',
                stroke: '#ff4d4f',
                strokeWidth: 1,
                fill: 'none',
                pointerEvents: 'none',
              },
            },
          ],
        };

        try {
          Graph.registerEdgeTool('button-remove', removeButton);
          isButtonRemoveRegistered = true;
        } catch (error) {
          console.warn('工具已注册或注册失败:', error);
        }
      }
      const projectInfo = JSON.parse(localStorage.getItem('projectInfo'));
      try {
        const res = await getStatus({
          graphId: projectInfo.graphId,
          projectId: projectInfo.projectId,
        });
        localStorage.setItem('nodeStatusInfo', JSON.stringify(res.nodes));
      } catch (error) {
        console.log(error, '获取节点状态失败');
      }
    });

    onBeforeUnmount(() => {
      destroy();
    });

    function render() {
      graph = new Graph({
        // 当 snap 设置为 true 时连线的过程中距离节点或者连接桩 50px 时会触发自动吸附
        snap: true,
        connecting: {
          allowBlank: false,
          // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，默认为 true。
          allowLoop: false,
          // 是否允许边链接到节点（非节点上的链接桩），默认为 true。
          allowNode: () => {
            return props.editable;
          },
          // 是否允许边链接到另一个边，默认为 true。
          allowEdge: () => {
            return props.editable;
          },
          // 是否允许边链接到链接桩，默认为 true。
          allowPort: () => {
            return props.editable;
          },
          //50px自动吸附
          snap: {
            radius: 50,
          },
          // https://x6.antv.vision/zh/docs/api/registry/router
          router: {},
          // https://x6.antv.vision/zh/docs/api/registry/connector
          connector: 'smooth',
        },
        container: ContainerRef.value,
        interacting: function (cellView) {
          if (
            cellView.cell.getData() != undefined &&
            cellView.cell.getData().disableMove == false
          ) {
            return { nodeMovable: false };
          }
          return true;
        },
        // 撤销/重做，默认禁用。
        history: true,
        //画布是否可以拖动
        panning: false,
        // 是否监听容器大小改变，并自动更新画布大小
        autoResize: true,
        selecting: {
          enabled: false,
          rubberband: true,
          showNodeSelectionBox: true,
        },
        // sorting: 'none',
        onPortRendered({ contentContainer, container, node, port }) {
          contentContainer.addEventListener('mouseenter', (e) => {
            const tooltip = document.querySelector('.tooltip-widget');
            if (tooltip) {
              const keys = Object.keys(secretflowStore.i18n);
              const key = keys.find((key) =>
                key.includes(
                  dictionary.yinyu_algorithm_reverse[
                    node.store.data.data.algorithm_name
                  ] ||
                    dictionary.algorithm_En[
                      node.store.data.data.algorithm_name
                    ],
                ),
              );
              // tooltip.innerHTML = i18n.graph[port.id] || i18n.secretflowGraph[port.id];
              console.log(
                i18n.graph,
                port.id,
                key,
                secretflowStore.i18n,
                node,
                '这里呢',
              );

              tooltip.innerHTML =
                i18n.graph[port.id] || secretflowStore.i18n[key][port.desc];
              // tooltip.innerHTML = i18n.graph[port.id] || '';
              setTimeout(() => {
                tooltip.style.left = `${
                  e.clientX - tooltip.offsetWidth / 2 + 5
                }px`;
                tooltip.style.top = `${e.clientY}px`;
              }, 300);
            }
          });
          contentContainer.addEventListener('mouseleave', () => {
            setTimeout(() => {
              const tooltip = document.querySelector('.tooltip-widget');
              if (tooltip) {
                tooltip.style.left = '-1000px';
                tooltip.style.top = '-1000px';
              }
            }, 300);
          });
        },
        // 定制节点和边的交互行为 https://x6.antv.vision/zh/docs/api/graph/interaction/#interacting
        // interacting: {
        //   edgeMovable: () => {
        //     return props.editable;
        //   },
        //   nodeMovable: () => {
        //     return props.editable;
        //   },
        // },
      });

      graph.on('edge:mouseleave', ({ cell }) => {
        // 隐藏删除按钮
        cell.removeTools();
      });

      graph.on('node:click', (...args) => {
        emit('clickNode', ...args);
      });

      graph.on('edge:connected', ({ isNew, view, edge }) => {
        edge.attr({
          line: {
            strokeDasharray: '',
          },
        });
        if (isNew) {
          // 对新创建的边进行插入数据库等持久化操作
          emit('edge-connected', view, edge);
        }
      });

      graph.on('cell:removed', ({ cell, index, options }) => {
        emit('delete', cell);
      });

      graph.on('node:added', ({ node, index, options }) => {
        emit('add-node', node, index, options);
      });

      // for test
      graph.on('node:magnet:click', (...args) => {
        console.info('port:click', args);
      });

      // 显示延迟和隐藏延迟
      let showTimer, hideTimer;
      const delay = 200;
      const statusMap = {
        STAGING: { text: '已配置' },
        SUCCEED: { text: '成功', className: 'success' },
        FAILED: { text: '失败', className: 'fail' },
        INITIALIZED: { text: '已提交' },
      };

      graph.on('node:mouseenter', (args) => {
        console.log(args, 'ARGSargs');
        console.log(localStorage.getItem('graphInfo'), '>>>>>>node:mouseenter');

        const nodeData = args.cell.getData();
        console.log(nodeData, 'nodeData456');

        const graphInfo = JSON.parse(localStorage.getItem('graphInfo'));
        const nodeStatusInfo = JSON.parse(
          localStorage.getItem('nodeStatusInfo'),
        );
        if (nodeData.component_id || nodeData.component_module) {
          let tooltip = document.querySelector('.tooltip-widget1');
          if (tooltip && args.e.target.clientWidth) {
            clearTimeout(hideTimer);
            let componentId;
            let executionStatus;
            if (graphInfo.nodes) {
              componentId = graphInfo.nodes.find(
                (node) => node.label == nodeData.label,
              )?.graphNodeId;
              // const componentId = 1;
              executionStatus = nodeStatusInfo?.find(
                (i) => i.graphNodeId === componentId,
              )?.status;
            } else {
              console.log(graphInfo, 'graphInfo看看');
              componentId = graphInfo.find(
                (node) => node.label == nodeData.label,
              )?.algorithm_id;
            }
            // 定义点击执行结果的处理函数

            showTimer = setTimeout(() => {
              // 获取提示内容
              const content = `
              <div class="custom-tooltip">
                <p class="tooltip-item">
                  <span>组件ID: ${componentId}</span>
                  <span class="icon">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64h64z"></path><path fill="currentColor" d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64H384zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64z"></path></svg>
                  </span>
                </p>
                <p class="tooltip-item">执行状态: ${
                  ['SUCCEED', 'FAILED'].includes(executionStatus)
                    ? `<span class="dot ${statusMap[executionStatus].className}"></span>`
                    : ''
                }
                 ${statusMap[executionStatus]?.text || '未运行'}</p>
                ${
                  ['SUCCEED', 'FAILED'].includes(executionStatus)
                    ? `<p class="tooltip-item">执行结果: </p>
                <p class="result">
                  <span class="icon">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="M832 384H576V128H192v768h640V384zm-26.496-64L640 154.496V320h165.504zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32zm160 448h384v64H320v-64zm0-192h160v64H320v-64zm0 384h384v64H320v-64z"></path></svg>
                  </span>
                 <span>输出表: datatable_output </span>
                </p>`
                    : ''
                }
              </div>
            `;
              tooltip.innerHTML = content;
              tooltip.style.display = 'block';
              localStorage.setItem('currentNodeStatus', executionStatus);

              tooltip
                .querySelector('.result')
                ?.addEventListener('click', () => {
                  emit('check-result', nodeData);
                });

              tooltip.querySelector('.icon').addEventListener('click', () => {
                navigator.clipboard
                  .writeText(componentId)
                  .then(() => {
                    ElMessage.success('复制成功');
                  })
                  .catch((err) => {
                    ElMessage.error('复制失败');
                  });
              });

              // 计算位置
              const rect = args.view.container.getBoundingClientRect();
              const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
              const scrollLeft =
                window.pageXOffset || document.documentElement.scrollLeft;

              // 设置提示框位置（正下方）
              tooltip.style.left =
                rect.left +
                scrollLeft +
                rect.width / 2 -
                tooltip.offsetWidth / 2 +
                'px';
              tooltip.style.top = rect.bottom + scrollTop + 5 + 'px';

              // 防止提示框超出视口
              const tooltipRect = tooltip.getBoundingClientRect();
              if (tooltipRect.right > window.innerWidth) {
                tooltip.style.left =
                  window.innerWidth - tooltipRect.width - 5 + 'px';
              }
              if (tooltipRect.left < 0) {
                tooltip.style.left = '5px';
              }
            }, delay);

            // 提示框鼠标事件
            tooltip.addEventListener('mouseenter', function () {
              clearTimeout(hideTimer);
            });

            tooltip.addEventListener('mouseleave', function () {
              hideTimer = setTimeout(() => {
                tooltip.style.display = 'none';
              }, delay);
            });
          }
        }
      });

      graph.on('node:mouseleave', ({ e }) => {
        clearTimeout(showTimer);
        // 检查鼠标是否移入提示框
        const relatedTarget = e.relatedTarget;
        const tooltip = document.querySelector('.tooltip-widget1');
        if (relatedTarget !== tooltip && !tooltip.contains(relatedTarget)) {
          hideTimer = setTimeout(() => {
            tooltip.style.display = 'none';
          }, delay);
        }
      });

      // 添加边悬停显示删除按钮
      graph.on('edge:mouseenter', ({ cell }) => {
        if (props.editable) {
          cell.addTools([
            {
              name: 'button-remove',
              args: { distance: 0.5 },
            },
          ]);
        }
      });

      graph.on('edge:mouseleave', ({ cell }) => {
        cell.removeTools();
      });
    }

    function destroy() {
      if (graph) {
        graph.dispose();
        localStorage.removeItem('nodeStatusInfo');
        localStorage.removeItem('currentNodeStatus');
      }
    }

    return () =>
      h('div', { class: 'graph-viewer-container', ref: ContainerRef });
  },
};
</script>

<style lang="scss" scoped>
.graph-viewer-container {
  width: 100% !important;
  height: 100% !important;

  :deep .x6-graph-svg {
    background-color: #fff;
  }
}
</style>
