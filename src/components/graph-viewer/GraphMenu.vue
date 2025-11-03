<script>
import { onMounted, h, ref, inject, onBeforeUnmount, watch } from 'vue';
import { Addon } from '@antv/x6';
import { GET_GRAPH } from '../../utils/key';
import { getGraphNodeShape } from './graphOperation';
import dictionary from '../../utils/dictionary';

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
  setup(props) {
    let stencil;
    const StencilRef = ref();
    const getGraph = inject(GET_GRAPH);

    watch(
      () => props.groups,
      () => {
        destroy();
        render();
      },
    );

    function destroy() {
      if (stencil) {
        StencilRef.value.removeChild(stencil.container);
        stencil.dispose();
      }
    }

    async function render() {
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
          rowHeight: 55,
        },
        getDropNode: (draggingNode) => {
          const nodes = graph.getNodes();
          const result = draggingNode.clone();
          console.log(result,'RESULT在这');
          
          const sameTypeNodes = nodes.filter(
            (item) => {
              console.log(item.data.component_module, result.data.component_module, 'OOOOOAAAAAOOO123');
              return item.data.component_module === result.data.component_module
            },
          );
          // result.data.component_name = result.data.algorithm_name;
          // result.data.label += `_${sameTypeNodes.length}`;
          // result.data.label += `_${sameTypeNodes.length}`;
          result.data.label += `_${sameTypeNodes.length}`;
          result.data.name_zh += `_${sameTypeNodes.length}`;
          return result;
        },
        validateNode: () => {
          return props.editable;
        },
      });
      StencilRef.value.appendChild(stencil.container);
      props.menus.forEach((item) => {
        const nodes = item.operators.map((item) => {
          console.log(item,'初始化');
          return graph.createNode({
            // shape: getGraphNodeShape(item.module),
            shape: getGraphNodeShape(item.name),

            // shape: getGraphNodeShape(item.labelName),
            data: {
              component_name: item.name,
              component_id: item.id,
              label: item.name,
              // label: item.labelName,
              name_zh: item.labelName,
              role: 'guest',
              type: item.category,
              component_module: item.module,
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
    font-size: 18px;
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

:deep .graph-node-wrapper {
  margin-left: 60px;
}
</style>
