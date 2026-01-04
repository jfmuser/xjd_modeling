<script>
import { onMounted, h, ref, inject, onBeforeUnmount, watch } from 'vue';
import { Addon } from '@antv/x6';
import { GET_GRAPH } from '../../utils/key';
import { getSecretflowGraphNodeShape } from './secretflowGraphOperation';
import { getInEffectLibAndAlgList } from '../../apis/workspace/algorithm.api';
import { graphNodeList } from './secretflowGraphOperation';
import useAlgorithmStore from '@/stores/algorithm.store'

export default {
  name: 'GraphMenu',
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
    menus: {
      type: Array,
      default: () => [],
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  setup (props) {
    let stencil;
    const StencilRef = ref();
    const getGraph = inject(GET_GRAPH);
    const algorithmStore = useAlgorithmStore()
    watch(
      () => props.groups,
      () => {
        destroy();
        render();
      },
    );

    function destroy () {
      if (stencil) {
        StencilRef.value.removeChild(stencil.container);
        stencil.dispose();
      }
    }

    async function render () {
      // const { algorithmVersionList } = await getInEffectLibAndAlgList();
      const algorithmVersionList = algorithmStore.getAlgorithmAllList
      console.log(123, { algorithmVersionList })
      const graph = getGraph();
      stencil = new Addon.Stencil({
        title: '联邦算子',
        // 目标画布
        target: graph,
        // 模板画布宽度
        stencilGraphWidth: 300,
        // 分组信息
        groups: props.groups,
        layoutOptions: {
          // 网格布局的列数，默认为 2。行数根据节点数自动计算。
          columns: 1,
          // 行高。auto: 所有节点中最高节点的高度作为行高，compact: 该行中最高节点的高度作为行高。
          columnWidth: 'auto',
          rowHeight: 'auto',
        },
        getDropNode: (draggingNode) => {
          console.log(123456)
          const nodes = graph.getNodes();
          const result = draggingNode.clone();
          let max = 0;
          const sameTypeNodes = nodes.filter((item) => {
            console.log(
              item,
              item.data.component_module,
              result.data.component_module,
              result,
              'OOOOOAAAAAOOO',
            );

            if (!item.data.component_module) return false;

            return (
              item.data.component_module === result.data.component_module ||
              item.data.type === result.data.component_module
            );
          });

          // result.data.component_name = result.data.algorithm_name;
          console.log(result.data.label, sameTypeNodes, '>>>sameTypeNodes');
          algorithmVersionList.forEach((alg) => {
            console.log(alg, alg.module, result.data.label, result, '看看对比');
            if (
              alg.module === result.data.label ||
              alg.name === result.data.label
            ) {
              sameTypeNodes.forEach((node) => {
                console.log(node, '在这里等你');
                const parts = node.store.data.data.label.split('_');
                if (parts[parts.length - 1] > max) {
                  max = parts[parts.length - 1];
                }
              });
              result.data.label = alg.labelName + `_${max - 0 + 1}`;
              result.data.name_zh = alg.labelName + `_${max - 0 + 1}`;
            }
          });
          return result;
        },
        validateNode: () => {
          return props.editable;
        },
      });
      StencilRef.value.appendChild(stencil.container);
      props.menus.forEach((item) => {
        //筛选出没有注册的算子防止报错
        const operators = item.operators.filter((item) =>
          graphNodeList.includes(`graph-node-${item.name}`),
        );
        const nodes = operators.map((item) => {
          console.log(item, 'ITEM结果');
          return graph.createNode({
            // shape: getGrIaphNodeShape(item.module),
            shape: getSecretflowGraphNodeShape(item.name),
            data: {
              component_name: item.name,
              algorithm_name: item.name,
              // component_id: item.id,
              label: item.name,
              role: 'guest',
              // type: item.category,
              component_module: item.module,
              name_zh: item.labelName,
            },
          });
        });
        stencil.load(nodes, item.key);
      });
    }

    onMounted(() => {
      render();
    });

    onBeforeUnmount(() => {
      destroy();
    });
    return () => h('div', { class: 'stencil', ref: StencilRef });
  },
};
</script>

<style scoped lang="scss">
$header-height: 50px;

:deep .x6-widget-stencil {
  background-color: #fff;

  .x6-widget-stencil-title {
    height: $header-height;
    line-height: $header-height;
    background-color: #fff;
    font-size: 16px;
    border-bottom: 1px solid #4376ff1a;
    position: relative;
    padding-left: 30px;

    &::before {
      position: absolute;
      content: ' ';
      width: 13px;
      height: 13px;
      background-image: url('../../assets/title_1.svg');
      background-repeat: no-repeat;
      top: 18px;
      left: 10px;
    }
  }

  .x6-widget-stencil-content {
    top: $header-height;

    .x6-widget-stencil-group-title {
      background-color: #fff;
      font-size: 16px;

      &::before {
        background-image: url('../../assets/upward.svg');
        background-repeat: no-repeat;
        background-size: contain;
      }
    }

    .collapsed {
      .x6-widget-stencil-group-title {
        &::before {
          background-image: url('../../assets/down.svg');
          background-repeat: no-repeat;
          background-size: contain;
        }
      }
    }
  }

  .x6-port {
    display: none;
  }
}

// :deep .graph-node-wrapper {
//   margin-left: 60px;
// }
</style>
