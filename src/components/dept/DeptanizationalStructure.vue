<script setup>
import {
  onMounted,
  watch,
  computed,
  ref,
  nextTick,
  onBeforeUnmount,
} from 'vue';
import G6 from '@antv/g6';
import imageOrg from '../../assets/monitor/org.svg';
import imageSite from '../../assets/monitor/site.svg';

import useFederationStore from '@/stores/monitor/federation.store';

const federationStore = useFederationStore();

const ContainerRef = ref(null);
const props = defineProps({ isFullscreen: { type: Boolean, default: false } });
let graph;

watch(
  () => props.isFullscreen,
  async () => {
    await nextTick();
    render();
  },
);

const containerStyle = computed(() => {
  return {
    width: props.isFullscreen ? '100vw' : '100%',
    height: props.isFullscreen ? '100vh' : '100%',
    margin: '0 auto',
  };
});

onMounted(async () => {
  try {
    await federationStore.fetchData();
    render();
  } catch (e) {
    console.error(e);
  }
});

onBeforeUnmount(() => {
  if (graph) {
    graph.destroy();
  }
});

function getNodes() {
  const result = [];
  federationStore.data.forEach((item) => {
    result.push({
      id: item.__id,
      type: 'image',
      img: imageOrg,
      __type: item.__type,
      label: `组织\n${item.name}`,
      size: 200,
      labelCfg: {
        style: {
          fontSize: 24,
          // fill: 'red'
        },
      },
    });
    result.push(
      ...item.children.map((siteItem) => {
        return {
          id: siteItem.__id,
          type: 'image',
          img: imageSite,
          __type: siteItem.__type,
          label: `部门\n${siteItem.siteName}`,
          size: 120,

        };
      }),
    );
  });
  return result;
}

function getEdges() {
  const result = [];
  const length = federationStore.data.length;
  for (let i = 0; i < length; i += 1) {
    const source = federationStore.data[i];
    for (let j = i; j < length; j += 1) {
      const target = federationStore.data[j];
      result.push({
        source: source.__id,
        target: target.__id,
        style: {
          lineWidth: 10,
          stroke: '#4376FF80',
        },
        type: 'cubic',
        curveOffset: 230,
      });
    }
  }
  federationStore.data.forEach((item) => {
    result.push(
      ...item.children.map((siteItem) => {
        return {
          source: siteItem.__id,
          target: item.__id,
          style: {
            lineWidth: 2,
            stroke: '#4376FFFF',
          },
          curveOffset: 35,
          type: 'arc',
        };
      }),
    );
  });
  return result;
}

function render() {
  if (graph) {
    graph.destroy();
  }
  const data = {
    nodes: getNodes(),
    edges: getEdges(),
  };

  graph = new G6.Graph({
    container: ContainerRef.value,
    // 是否开启画布自适应。开启后图自动适配画布大小。
    fitView: true,
    // 开启后，图将会被平移，图的中心将对齐到画布中心，但不缩放。优先级低于 fitView。
    fitCenter: true,
    // 指定边是否连入节点的中心。
    linkCenter: true,
    autoPaint: true,
    modes: {
      default: ['drag-canvas', 'drag-node'],
    },
    layout: {
      type: 'gForce',
      linkDistance: (_, source) => {
        return source.__type === 'site' ? 150 : 500;
      },
    },
    defaultEdge: {},
    defaultNode: {
      type: 'image',
      labelCfg: {
        position: 'center',
        style: {
          fill: '#fff',
        },
      },
    },
  });

  graph.data(data);
  graph.render();
}
</script>

<template>
  <div id="container" ref="ContainerRef" :style="containerStyle"></div>
</template>
