// import { h } from 'vue';
// import { Graph } from '@antv/x6';
// import '@antv/x6-vue-shape';
// import GraphNode from './GraphNode.vue';

// const nodeWidth = 266;
// const nodeHeight = 50;
// const color = {
//   host: '',
//   guest: '',
//   model: '#2aa74fff',
//   data: '#d7af13ff',
//   validateData: '#d7af1388',
//   trainData: '#d7af1300',
//   cache: '#0f0',
// };
// /**
//  * TODO: to test
//  */
// export const customNodeTypes = [
//   { name: 'start', port: {} },
//   {
//     name: 'default',
//     port: {
//       trainDataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//       validateDataInput: true,
//     },
//   },
//   { name: 'Reader', port: { dataOutput: true } },
//   {
//     name: 'DataIO',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'DataTransform',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'FeatureScale',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'Intersection',
//     port: {
//       dataInput: true,
//       cacheInput: true,
//       dataOutput: true,
//       cacheOutput: true,
//     },
//   },
//   { name: 'Evaluation', port: { dataInput: true, modelInput: true } },
//   {
//     name: 'HomoLR',
//     port: {
//       trainDataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//       validateDataInput: true,
//     },
//   },
//   {
//     name: 'HeteroLR',
//     port: {
//       trainDataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//       validateDataInput: true,
//     },
//   },
//   {
//     name: 'HeteroSecureBoost',
//     port: {
//       trainDataInput: true,
//       validateDataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'FederatedSample',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'SecureInformationRetrieval',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'HomoSecureboost',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'HeteroKMeans',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'HeteroFastSecureBoost',
//     port: {
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//       validateDataInput: true,
//       trainDataInput: true,
//     },
//   },
//   {
//     name: 'HeteroFeatureBinning',
//     port: {
//       modelInput: true,
//       dataInput: true,
//       // validateDataInput: true,
//       // trainDataInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'HeteroFeatureSelection',
//     port: {
//       dataInput: true,
//       // isometricModelInput: true,
//       modelInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
//   {
//     name: 'HeteroKmeans',
//     port: {
//       modelInput: true,
//       validateDataInput: true,
//       trainDataInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },

//   {
//     name: 'HomoNN',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       validateDataInput: true,
//       trainDataInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },

//   {
//     name: 'HeteroNN',
//     port: {
//       dataInput: true,
//       modelInput: true,
//       validateDataInput: true,
//       trainDataInput: true,
//       dataOutput: true,
//       modelOutput: true,
//     },
//   },
// ];

// export function getGraphNodeShape(val) {
//   const result = customNodeTypes.find((item) => item.name === val);
//   if (result) {
//     return `graph-node-${result.name}`;
//   }
//   console.error(`unknown graph shape: [${val}]`);
//   return 'graph-node-default';
// }

// export function generatePortGroups({ x = 132, y = 50 } = {}) {
//   return {
//     trainDataInput: {
//       position: {
//         name: 'absolute',
//         args: {
//           x: x - 50,
//         },
//       },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.data,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     validateDataInput: {
//       position: {
//         name: 'absolute',
//         args: {
//           x,
//         },
//       },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.validateData,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     dataInput: {
//       position: {
//         name: 'absolute',
//         args: {
//           x: x - 50,
//         },
//       },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.data,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     modelInput: {
//       position: {
//         name: 'absolute',
//         args: {
//           x: x + 50,
//         },
//       },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.model,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     cacheInput: {
//       position: {
//         name: 'absolute',
//         args: {
//           x: x + 50,
//         },
//       },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.cache,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     dataOutput: {
//       position: { name: 'absolute', args: { x: x - 50, y } },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.data,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     modelOutput: {
//       position: { name: 'absolute', args: { x: x + 50, y } },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.model,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//     cacheOutput: {
//       position: { name: 'absolute', args: { x: x + 50, y } },
//       zIndex: 2,
//       attrs: {
//         magnet: true,
//         circle: {
//           r: 6,
//           magnet: true,
//           stroke: color.cache,
//           strokeWidth: 1,
//           fill: '#fff',
//         },
//       },
//     },
//   };
// }

// export function generatePortItems({
//   dataInput = false,
//   modelInput = false,
//   dataOutput = false,
//   modelOutput = false,
//   validateDataInput = false,
//   trainDataInput = false,
//   cacheInput = false,
//   cacheOutput = false,
// } = {}) {
//   const items = [];
//   if (dataInput) {
//     items.push({ group: 'dataInput', id: 'dataInput' });
//   }
//   if (modelInput) {
//     items.push({ group: 'modelInput', id: 'modelInput' });
//   }
//   if (dataOutput) {
//     items.push({ group: 'dataOutput', id: 'dataOutput' });
//   }
//   if (modelOutput) {
//     items.push({ group: 'modelOutput', id: 'modelOutput' });
//   }
//   if (validateDataInput) {
//     items.push({ group: 'validateDataInput', id: 'validateDataInput' });
//   }
//   if (trainDataInput) {
//     items.push({ group: 'trainDataInput', id: 'trainDataInput' });
//   }
//   if (cacheInput) {
//     items.push({ group: 'cacheInput', id: 'cacheInput' });
//   }
//   if (cacheOutput) {
//     items.push({ group: 'cacheOutput', id: 'cacheOutput' });
//   }
//   return items;
// }

// export function register() {
//   registerNode();
// }

// function registerNode() {
//   customNodeTypes.forEach((item) => {
//     Graph.registerNode(
//       `graph-node-${item.name}`,
//       {
//         inherit: 'vue-shape',
//         width: nodeWidth,
//         height: nodeHeight,
//         component: {
//           render: () => {
//             return h(GraphNode);
//           },
//         },
//         ports: {
//           groups: generatePortGroups(),
//           items: generatePortItems({ ...item.port }),
//         },
//       },
//       true,
//     );
//   });
// }

import { h } from 'vue';
import { Graph } from '@antv/x6';
import '@antv/x6-vue-shape';
import GraphNode from './GraphNode.vue';
import {
  inEffectAlgorithmParams,
  getInEffectLibAndAlgList,
} from '../../apis/workspace/algorithm.api';

const nodeWidth = 266;
const nodeHeight = 50;
const color = {
  host: '',
  guest: '',
  model: '#2aa74fff',
  data: '#d7af13ff',
  validateData: '#d7af1388',
  trainData: '#d7af1300',
  cache: '#0f0',
};
/**
 * TODO: to test
 */
export const customNodeTypeList = [];
export let algorithmList = [];

export function getGraphNodeShape(val) {
  // const result = customNodeTypeList.find((item) => item.name === val);
  console.log(val, customNodeTypeList, '匹配');

  const result = customNodeTypeList.find((item) => item === val);
  if (result) {
    // return `graph-node-${result.name}`;
    return `graph-node-${result}`;
  }
  console.error(`unknown graph shape: [${val}]`);
  return 'graph-node-default';
}

export function register() {
  registerNode();
}

async function registerNode() {
  let x = 82;
  let y = 50;
  const { algorithmVersionList } = (await getInEffectLibAndAlgList()) ?? {
    algorithmVersionList: [],
  };
  console.log(algorithmVersionList, '>>>>>algorithmVersionList');
  algorithmList = algorithmVersionList;
  algorithmVersionList.forEach((item) => {
    // customNodeTypeList.push(item.name)
    // customNodeTypeList.push({ name: item.labelName, algName: item.name })
    customNodeTypeList.push(item.name);
  });
  customNodeTypeList.forEach(async (item) => {
    const customNodeType = {};
    const items = [];
    const { tAlgorithmParamVersions } = await inEffectAlgorithmParams(item);
    if (
      !tAlgorithmParamVersions[0].param_dsl ||
      tAlgorithmParamVersions[0].param_dsl === ''
    )
      return;
    const dsl = tAlgorithmParamVersions[0].param_dsl;
    // 这里开始分input, output
    dsl.input?.data.forEach((itemData) => {
      customNodeType[itemData.split(':')[0] + 'Input'] = true;
    });
    dsl.output.data.forEach((itemData) => {
      customNodeType[itemData.split(':')[0] + 'Output'] = true;
    });
    dsl.input?.model.forEach((itemData) => {
      customNodeType[itemData.split(':')[0] + 'Input'] = true;
    });
    dsl.output.model?.forEach((itemData) => {
      customNodeType[itemData.split(':')[0] + 'Output'] = true;
    });
    const nodeNameList = Object.keys(customNodeType);
    nodeNameList.forEach((item) => {
      items.push({ group: item, id: item });
    });
    console.log(nodeNameList, '爱卡卡卡卡卡');
    const nodePlace = {};
    let top = 0;
    let bottom = 0;
    if (
      dsl.input.data.length + dsl.input.model.length === 2 &&
      dsl.output.data.length + dsl.output.model.length === 2
    ) {
      nodeNameList.forEach((item) => {
        if (item.includes('Input')) {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * top,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.data,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          top += 1;
        } else {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * bottom,
                y,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.validateData,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          bottom += 1;
        }
      });
    } else if (
      dsl.input.data.length + dsl.input.model.length === 3 &&
      dsl.output.data.length + dsl.output.model.length === 2
    ) {
      nodeNameList.forEach((item) => {
        if (item.includes('Input')) {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 50 * top,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.data,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          top += 1;
        } else {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * bottom,
                y,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.validateData,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          bottom += 1;
        }
      });
    } else if (
      dsl.input.data.length + dsl.input.model.length === 4 &&
      dsl.output.data.length + dsl.output.model.length === 2
    ) {
      nodeNameList.forEach((item) => {
        if (item.includes('Input')) {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x - 22 + 50 * top,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.data,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          top += 1;
        } else {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * bottom,
                y,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.validateData,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          bottom += 1;
        }
      });
    } else if (
      dsl.input.data.length + dsl.input.model.length === 2 &&
      dsl.output.data.length + dsl.output.model.length === 0
    ) {
      nodeNameList.forEach((item) => {
        if (item.includes('Input')) {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * top,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.data,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          top += 1;
        } else {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * bottom,
                y,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.validateData,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          bottom += 1;
        }
      });
    } else if (
      dsl.input.data.length + dsl.input.model.length === 2 &&
      dsl.output.data.length + dsl.output.model.length === 1
    ) {
      nodeNameList.forEach((item) => {
        if (item.includes('Input')) {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * top,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.data,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          top += 1;
        } else {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: 133,
                y,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.validateData,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          bottom += 1;
        }
      });
    } else {
      nodeNameList.forEach((item) => {
        if (item.includes('Input')) {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 50 * top,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.data,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          top += 1;
        } else {
          nodePlace[item] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 50 * bottom,
                y,
              },
            },
            zIndex: 2,
            attrs: {
              magnet: true,
              circle: {
                r: 6,
                magnet: true,
                stroke: color.validateData,
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          };
          bottom += 1;
        }
      });
    }
    Graph.registerNode(
      // `graph-node-${item.name}`,
      `graph-node-${item}`,
      {
        inherit: 'vue-shape',
        width: nodeWidth,
        height: nodeHeight,
        component: {
          render: () => {
            return h(GraphNode);
          },
        },
        ports: {
          groups: nodePlace,
          items: items,
        },
      },
      true,
    );
  });
}
