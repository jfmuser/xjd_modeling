import { nextTick, onMounted, ref } from 'vue';

export default function useGraph() {
  const GraphViewerRef = ref();
  const graph = ref();

  onMounted(async () => {
    await nextTick();
    graph.value = GraphViewerRef.value.getGraph();
  });

  function getGraph() {
    return graph.value;
  }

  async function getNodesData() {
    const graph = await getGraph();
    const graphNodes = graph.getNodes() || [];
    return graphNodes.map((node) => {
      return {
        ...node.store.data.data,
        id: node.store.data.id,
      };
    });
  }

  async function getEdgesData() {
    const graph = await getGraph();
    const graphEdges = graph.getEdges() || [];
    return graphEdges.map((edge) => {
      return {
        ...edge.store.data,
      };
    });
  }

  async function onZoomIn() {
    const graph = await getGraph();
    graph.zoom(0.1);
  }

  function onZoomOut() {
    graph.value.zoom(-0.1);
  }

  function onAutoZoom() {
    graph.value.zoomToFit();
  }

  function onGraphClear() {
    graph.value.clearCells();
    graph.value.history.clean();
  }

  function onGraphRollback() {
    if (graph.value.history.canUndo()) {
      graph.value.history.undo();
    }
  }

  return {
    GraphViewerRef,
    onZoomIn,
    onZoomOut,
    onAutoZoom,
    onGraphClear,
    onGraphRollback,
    getGraph,
    getNodesData,
    getEdgesData,
  };
}
