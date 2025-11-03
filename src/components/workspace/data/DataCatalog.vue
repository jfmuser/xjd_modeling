<script setup>
import _ from 'lodash';
import { reactive, onMounted, nextTick, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataListTree from './DataListTree.vue';
import { SourceType, FormType } from '../../../utils/const';
import CreateDataDialog from '../../../components/workspace/data/CreateDataDialog.vue';
// import { getAllDataList } from '../../../apis/workspace/data.api';
import { listDatatables, listNode } from '../../../apis/secretflow/secretflow.api'
import useSecretflowStore from '../../../stores/secretflow/secretflowInfo.store'
import { getData } from '../../../apis/manager/managerApi'
import useSiteStore from '../../../stores/dept/site.store'
import useAuthStore from '../../../stores/auth.store';

const props = defineProps({
  dataList: {
    type: Array,
    required: true
  }
})
const siteStore = useSiteStore()
const authStore = useAuthStore()
const route = useRoute();
const router = useRouter();
const secretflowStore = useSecretflowStore();
const CreateDataDialogRef = ref(null);
const state = reactive({
  search: { dataSourceType: SourceType.SELF },
  guestDataList: [],
  hostDataList: [],
  DataList:[]
});
let treeId = computed(() => route.query.id);
const secretflowNode = ref([])
const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))

watch(
  () => treeId.value,
  async () => {
    await renderTree();
  },
);

watch(
  () => authStore.IsUKey,
  async () => {
    await fetchTreeData();
  },
);
onMounted(async () => {
  await fetchTreeData();
  // await renderTree();
});

function onSearch() {
  fetchTreeData();
}

async function renderTree() {
  await nextTick();
  if (treeId.value) {
    const treeNode = document.querySelector(
      `.el-tree-node[data-key="${treeId.value}"]`,
    );
    treeNode?.click();
  } else {
    const treeNode = document.querySelector('.el-tree-node');
    treeNode?.click();
  }
}


async function fetchTreeData() {
  try {
    state.loading = true;
    const params = {
      "pageRequest": {
        "pageNumber": 1,
        "pageSize": 999
      },
    };
    // if(!authStore.IsUKey) return
    const response = await getData(params);
    const { records } = response;
    secretflowStore.getDataList(records)
    // state.DataList = records
    // state.DataList = secretflowStore.dataList;
    if (records && records.length > 0) {
      // state.DataList = records;
      records.forEach((item) => {
        switch (item.dataFromId) {
          case `${selfParties.id}`:
            state.guestDataList.push(item)
            break;
            default:
              
            state.hostDataList.push(item)
          }
        });
      }
      state.hostDataList = handleHostTreeData(state.hostDataList)
      state.guestDataList = handleTreeData(state.guestDataList)
    // state.hostDataList = handleTreeData(state.hostDataList)
    state.DataList = state.guestDataList
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}

function onAdd() {
  CreateDataDialogRef.value.show();
}

// function onViewAll() {
//   router.push({
//     name: route.name,
//     query: { all: true },
//   });
// }

async function onAfterCreate(res) {
  state.DataList = []
  state.guestDataList = []
  state.hostDataList = []
  await fetchTreeData();
  await router.push({
    name: route.name,
    query: {
      dataName: res.dataName,
      id: res.id,
      action: FormType.READ,
    },
  });
  await renderTree();
}

async function onAfterDelete() {
  state.DataList = []
    state.guestDataList = []
  state.hostDataList = []
  fetchTreeData();
    await router.push({
    name: route.name,
  });
}

// async function addSecretflowData(val) {
//   const secretflowData = [{ dataName: 'secretflow', id: 2, children: [] }]
//   for (let i = 0; i < secretflowNode.value.length; i++) {
//     const { datatableVOList } = await listDatatables({ datatableNameFilter: "", nodeId: secretflowNode.value[i].nodeId, pageNumber: 1, pageSize: 999, statusFilter: '' })
//     if (state.DataList[1]?.dataName === 'secretflow' && val == 1) return
//     for (let j = 0; j < datatableVOList.length; j++) {
//       datatableVOList[j].nodeName = secretflowNode.value[i].nodeName;
//       datatableVOList[j].nodeId = secretflowNode.value[i].nodeId;
//       // item.dataName = item.datatableName
//       datatableVOList[j].dataType = 'secretflow'
//       datatableVOList[j].id = Math.random()
//       secretflowData[0].children.push(datatableVOList[j])
//     }
//   }
//   secretflowStore.getDataList([...secretflowData[0].children])
//   state.DataList.push(secretflowData[0])
// }

function onTabChange(val) {
  state.search.dataSourceType = val
  if (Number(val)) {
    state.DataList = state.hostDataList
  } else {
    state.DataList = state.guestDataList
  }
}

function handleHostTreeData(hostTreeData) {
  const treeDataList = []
  
  console.log(siteStore.otherSite,'otherSite');
  hostTreeData.forEach(data => {
    siteStore.otherSite.forEach(otherData => {
      if (data.dataFromId === otherData.id && !treeDataList.some(item => item.name === otherData.name)) {
        treeDataList.push({name:otherData.name,children:[data]})
      } else if (data.dataFromId === otherData.id && treeDataList.some(item => item.name === otherData.name)) {
        treeDataList.find(item => item.name === otherData.name).children.push(data)
      }
      
    })
  })
  treeDataList.forEach(treeData => {
    treeData.children = handleTreeData(treeData.children)
  })
  return treeDataList
}

function handleTreeData(treeData) {
  const treeDataList = []
  let InnovateSign = ''
  let SecretflowSign = ''
  let FateSign = ''
  let GoSign = ''
  let TeeSign = ''
  let PythonSign = ''
  treeData.forEach(data => {
    // 处理自研算法分类，InnovateSign如果有值说明已经push了自研的树状数据
    const currentSite = siteStore.otherSite.find(site => site.id === data.dataFromId)
    if (data.platform == '0' && !InnovateSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '0').name
      treeDataList.push({ name: engineName, children: [data] })
      InnovateSign = treeDataList.length
      return
    } else if (data.platform == '0' && InnovateSign) {
      treeDataList[InnovateSign - 1].children.push(data)
      return
    }
    // 处理隐语算法分类，SecretflowSign如果有值说明已经push了隐语的树状数据
    if (data.platform == '1' && !SecretflowSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '1').name
      treeDataList.push({ name: engineName, children: [data] })
      SecretflowSign = treeDataList.length
      return
    } else if (data.platform == '1' && SecretflowSign) {
      treeDataList[SecretflowSign - 1].children.push(data)
      return
    }
    // 处理GO算法分类，GoSign如果有值说明已经push了GO的树状数据
    if (data.platform == '2' && !GoSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '2').name
      treeDataList.push({ name: engineName, children: [data] })
      GoSign = treeDataList.length
      return
    } else if (data.platform == '2' && GoSign) {
      treeDataList[GoSign - 1].children.push(data)
      return
    }
    // 处理TEE算法分类，TeeSign如果有值说明已经push了TEE的树状数据
    if (data.platform == '3' && !TeeSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '3').name
      treeDataList.push({ name: engineName, children: [data] })
      TeeSign = treeDataList.length
      return
    } else if (data.platform == '3' && TeeSign) {
      treeDataList[TeeSign - 1].children.push(data)
      return
    }
    // 处理python算法分类，PythonSign如果有值说明已经push了TEE的树状数据
    if (data.platform == '4' && !PythonSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '4').name
      treeDataList.push({ name: engineName, children: [data] })
      PythonSign = treeDataList.length
      return
    } else if (data.platform == '4' && PythonSign) {
      treeDataList[PythonSign - 1].children.push(data)
      return
    }
    
  })
  return treeDataList
}
</script>

<template>
  <div class="catalog-wrapper">
    <div class="header-area background">
      <div class="title">数据目录</div>
      <div class="right">
        <el-button type="text" class="add" @click="onAdd">
          <el-icon>
            <Plus />
          </el-icon>
          添加
        </el-button>
      </div>
    </div>
    <div class="main">
      <div class="actions">
        <div class="action-row">
          <div class="tab">
            <el-button v-for="item in SourceType.options" :key="item.value" type="text"
              :class="{ active: state.search.dataSourceType === item.value }" @click="onTabChange(item.value)">
              {{ item.label }}数据
            </el-button>
          </div>

          <!-- <el-button type="text" class="tree-switch" @click="onViewAll">
            查看所有
            <el-icon>
              <ArrowRight />
            </el-icon>
          </el-button> -->
        </div>
        <div class="action-row">
          <el-input v-model.trim="state.search.dataName" clearable placeholder="数据名称" @keydown.enter="onSearch"
            @clear="onSearch">
            <template #suffix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <!-- 左侧siderbar 树状 -->
        <DataListTree :data="state.DataList" @afterDelete="onAfterDelete" />
      </div>
    </div>
  </div>
  <!-- 添加的弹框 -->
  <CreateDataDialog ref="CreateDataDialogRef" :nodeList="secretflowNode" @done="onAfterCreate" />
</template>

<style scoped lang="scss">
.catalog-wrapper {
  background-color: #fff;
  height: 100%;
  overflow: auto;

  .main {
    padding: 20px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.0390625rem;
  }

  .action-row {
    display: flex;
    gap: 15px;

    .tab {
      display: flex;
      border-bottom: 1px solid rgba(67, 118, 255, 0.2);
      gap: 10px;

      .el-button {
        border: 1px solid rgba(67, 118, 255, 0.2) !important;
        padding: 10px;
        border-radius: 2px 2px 0 0;
        border-bottom: 0 !important;
        font-size: 14px;
        height: 24px;
        margin: 0;
      }

      .active {
        background: rgba(67, 118, 255, 0.1);
      }
    }

    .tree-switch {
      font-size: 12px;
      height: 24px;
    }
  }
}
</style>
