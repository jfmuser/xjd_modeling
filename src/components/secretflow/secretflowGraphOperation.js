import { h } from 'vue';
import { Graph } from '@antv/x6';
import '@antv/x6-vue-shape';
import GraphNode from '../graph-viewer/GraphNode.vue';
import { listComponents } from '../../apis/secretflow/secretflow.api';
import useSecretflowStore from '@/stores/secretflow/secretflowInfo.store.js';
import { getInEffectLibAndAlgList } from '../../apis/workspace/algorithm.api';
import useAlgorithmStore from '@/stores/algorithm.store'
import { ElMessage } from 'element-plus';
const secretflowStore = useSecretflowStore();

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
// 添加状态管理
let isDataLoaded = false;
let retryCount = 0;
const MAX_RETRY_COUNT = 3;
/**
 * TODO: to test
 */
export let customNodeTypeList = [];
export const yyCustomNodeTypeList = [];
export let graphNodeList = [];

export function getSecretflowGraphNodeShape(val) {
  console.log(val, customNodeTypeList, yyCustomNodeTypeList, 'VVAALL');

  const result = customNodeTypeList.find(
    (item) => item.name === val || item.module === val,
  );
  // const result = customNodeTypeList.find((item) => item.name === val);
  console.log(result, 'VALVALVAL');
  if (result) {
    return `graph-node-${result.name}`;
  }
  console.error(`unknown graph shape: [${val}]`);
  return 'graph-node-default';
}

export function secretflowRegister() {
  return registerSecretflowNode();
}

async function registerSecretflowNode() {
  try {
    // 设置超时（例如10秒）
    // const timeoutPromise = new Promise((_, reject) => {
    //   setTimeout(() => reject(new Error('数据加载超时')), 10000);
    // });

    // 并行执行数据请求
    const dataPromise = listComponents();
    const algorithmStore = useAlgorithmStore()
    // const algorithmPromise = getInEffectLibAndAlgList();
    const data = await dataPromise;
    const algorithmVersionList  = await algorithmStore.fetchAlgorithmAllList(1)
    await algorithmStore.fetchAlgorithmParams()
    // const algorithmData = await algorithmPromise;
//  const algorithmVersionList =  algorithmStore.getAlgorithmAllList
    // 使用Promise.race实现超时控制
    // const [data, algorithmData] = await Promise.race([
    //   Promise.all([dataPromise, algorithmPromise]),
    //   timeoutPromise,
    // ]);

    // 处理数据
    var yl_comp = {};
    data.secretflow.comps.forEach((item) => {
      yl_comp[item.name] = item;
    });
    let algorithmObj = {}
    algorithmVersionList.forEach((item) => {
       algorithmObj = {...algorithmObj, [item.name]:item}
      if (yl_comp[item.module]) {
        yyCustomNodeTypeList.push({
          app: 'secretflow',
          name: yl_comp[item.module].name,
          domain: yl_comp[item.module].domain,
        });
      }
    });

    customNodeTypeList = algorithmVersionList;
    await secretflowStore.getNodeDetail(yyCustomNodeTypeList);

    // 标记数据已加载
    isDataLoaded = true;

    let x = 82;
    let y = 45;
    // const data = await listComponents()
    // console.log(data, 'await listComponents()');
    // data.secretflow.comps.forEach(item => {
    //     yyCustomNodeTypeList.push({ app: 'secretflow', name: item.name, domain: item.domain })
    // })
    // // await secretflowStore.getNodeDetail(customNodeTypeList)
    // const { algorithmVersionList } = await getInEffectLibAndAlgList()
    // customNodeTypeList = algorithmVersionList
    // await secretflowStore.getNodeDetail(yyCustomNodeTypeList)
    // console.log(secretflowStore.nodeDetail, 'secretflowStore.nodeDetail');

    var ylNodeDetail = {};
    secretflowStore.nodeDetail.forEach((item) => {
      ylNodeDetail[item.name] = item;
    });
    customNodeTypeList.forEach((selfitem) => {
      if (!ylNodeDetail[selfitem.module]) {
        return;
      }
      const item = ylNodeDetail[selfitem.module];
      console.log(item, '看看好不好');
      const items = [];
      const nodePlace = {};
      let top = 0;
      let bottom = 0;
      // 输入节点渲染
      if (item.inputs?.length === 3) {
        item.inputs.forEach((inputNode) => {
          nodePlace[inputNode.name] = {
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
          items.push({
            group: inputNode.name,
            id: inputNode.name,
            desc: inputNode.desc,
          });
        });
      } else if (item.inputs?.length === 2) {
        item.inputs.forEach((inputNode) => {
          nodePlace[inputNode.name] = {
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
          items.push({
            group: inputNode.name,
            id: inputNode.name,
            desc: inputNode.desc,
          });
        });
      } else if (item.inputs?.length === 1) {
        nodePlace[item.inputs[0].name] = {
          position: {
            name: 'absolute',
            args: {
              x: 133,
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
        items.push({
          group: item.inputs[0].name,
          id: item.inputs[0].name,
          desc: item.inputs[0].desc,
        });
      }
      // 输出节点渲染
      const outputPortObj = JSON.parse(JSON.stringify(item.outputs ?? []));
      //筛选出不需要的输出节点
      outputPortObj.forEach((output, i) => {
        if (output.types.includes('sf.report')) {
          outputPortObj.splice(i, 1);
        }
      });
      if (outputPortObj?.length === 2) {
        outputPortObj.forEach((outputNode) => {
          nodePlace[outputNode.name] = {
            position: {
              name: 'absolute',
              args: {
                x: x + 100 * bottom,
                y,
              },
            },
            zIndex: 2,
            portType: 'output',
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
          bottom++;
          items.push({
            group: outputNode.name,
            id: outputNode.name,
            portType: 'output',
            desc: outputNode.desc,
          });
        });
      } else if (outputPortObj?.length === 1) {
        nodePlace[outputPortObj[0].name] = {
          position: {
            name: 'absolute',
            args: {
              x: 133,
              y,
            },
          },
          zIndex: 2,
          portType: 'output',
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
        items.push({
          group: outputPortObj[0].name,
          id: outputPortObj[0].name,
          portType: 'output',
          desc: outputPortObj[0].desc,
        });
      }
      console.log(nodePlace, 'nodePlace');
      graphNodeList.push(`graph-node-${selfitem.name}`);
      Graph.registerNode(
        // `graph-node-${item.name}`,
        `graph-node-${selfitem.name}`,
        {
          inherit: 'vue-shape',
          width: nodeWidth,
          height: nodeHeight,
          component: {
            render: () => {
              return h(GraphNode,{ info:algorithmObj[selfitem.name]});
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
    secretflowStore.setSecretflowSuccess(true);
    console.log(graphNodeList, 'graphNodeList');
    //为了保证后执行secretflowRegister方法
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('secretflowRegister 执行完毕');
        resolve();
      }, 1000);
    });
  } catch (error) {
    console.error('节点数据加载失败:', error);

    if (retryCount < MAX_RETRY_COUNT) {
      retryCount++;
      console.log(`正在重试 (${retryCount}/${MAX_RETRY_COUNT})...`);
      setTimeout(registerSecretflowNode, 2000 * retryCount); // 指数退避重试
    } else {
      // 显示错误提示
      ElMessage.error('节点数据加载失败，请检查网络连接后刷新页面重试');
    }
  }
}
