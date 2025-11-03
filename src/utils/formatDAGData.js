import _ from 'lodash';

function packageComponent({
  component_list,
  component_module,
  component_need_run,
  dependencies,
}) {
  let result = component_list.map((item, index) => {
    // let dependenciesName = ''
    // for (let k in dependencies) {
    //   dependenciesName = k
    // }
    return {
      ...item,
      component_module: component_module[item.component_name],
      // component_need_run: component_need_run[item.component_name],
      dependencies: dependencies[item.component_name],
      // dependencies: dependenciesName,
      dataIndex: index,
    };
  });
  const groupedResult = _.groupBy(result, 'component_module');
  const sortedResult = [];
  Object.keys(groupedResult).forEach((key) => {
    sortedResult.push(..._.sortBy(groupedResult[key], ['component_name']));
  });
  return sortedResult;
}

function generateNodesAndEdges(components, { renderStart = false, role } = {}) {
  // console.log({ components });
  const nodes = [];
  if (renderStart) {
    nodes.push({
      type: 'start',
      role: role || 'guest',
      label: role || 'guest',
    });
  }

  const edges = [];
  components.forEach(item => {
    nodes.push({
      // type: item.component_module,
      type: item.algorithm_name,
      label: item.component_name,
      data: item,
    });
  })
  components.forEach((item) => {
    if (item.dependencies) {
      for (let i = 0, l = item.dependencies.length; i < l; i += 1) {
        const depItem = item.dependencies[i];
        const source = nodes.find(
          (resultItem) => resultItem.label === depItem.component_name,
        );
        if (!source) {
          continue;
        }
        edges.push({
          target: item.component_name,
          source: depItem.component_name,
          // targetPort: `${_.camelCase(depItem.type)}Input`,
          targetPort: `${depItem.type}Input`,
          sourcePort: `${depItem.up_output_info[0]}Output`,
        });
      }
    }

  });

  return { nodes, edges };
}

//给节点计算在画布上的坐标
function calcPosition(nodes) {
  const startX = 50;
  const stepX = 300;
  const stepY = 100;
  let x = startX;
  let y = 50;
  const nodeMap = new Map();
  let horizontalMax = 0;
  for (let i = 0, l = nodes.length; i < l; i += 1) {
    const node = nodes[i];

    const count = nodeMap.get(node.type);

    if (count === undefined) {
      y += stepY;
      x = startX;
      nodeMap.set(node.type, 1);
    } else {
      x += stepX;
      if (x > horizontalMax) {
        horizontalMax = x;
      }
      nodeMap.set(node.type, count + 1);
    }

    node.y = y;
    node.x = x;
  }
  setStartNodePosition(nodes, horizontalMax, startX);
}

function setStartNodePosition(nodes, horizontalMax, startX) {
  if (nodes.length === 0) {
    return;
  }
  const firstNode = nodes[0];
  if (firstNode.type === 'start') {
    firstNode.x =
      horizontalMax === 0 ? startX : (horizontalMax - startX) / 2 + startX;
  }
}

export default function (
  { component_list, component_module, component_need_run, dependencies } = {},
  { renderStart = false, role } = {},
) {
  const components = packageComponent({
    component_list,
    component_module,
    component_need_run,
    dependencies,
  });
  const { nodes, edges } = generateNodesAndEdges(components, {
    renderStart,
    role,
  });
  console.log(edges);
  // calcPosition(nodes);
  return { edges, nodes };
}
