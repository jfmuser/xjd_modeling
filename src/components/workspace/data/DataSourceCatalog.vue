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
import { getDataSource } from '../../../apis/manager/managerApi'

const props = defineProps({
  dataList: {
    type: Array,
    required: true
  }
})
const route = useRoute();
const router = useRouter();
const secretflowStore = useSecretflowStore();
const CreateDataDialogRef = ref(null);
const state = reactive({
  search: { dataSourceType: SourceType.SELF },
  DataList: [],
});
let treeId = computed(() => route.query.id);
const secretflowNode = ref([])

watch(
  () => treeId.value,
  async () => {
    await renderTree();
  },
);
onMounted(async () => {
  await fetchTreeData();
  // if (pattern.value.SecretName) {
  //   secretflowNode.value = await listNode();
  //   await addSecretflowData()
  // }
  await renderTree();
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

// async function onTabChange(val) {
//   state.search.dataSourceType = val;
//   await fetchTreeData();
//   if (pattern.value.SecretName && val == '0') {
//     await addSecretflowData(val)
//   }
//   await router.replace({ name: route.name, query: { dataSourceType: val } });
//   await renderTree();
// }

async function fetchTreeData() {
  try {
    state.loading = true;
    const params = {
      "pageRequest": {
        "pageNumber": 1,
        "pageSize": 999
      },
    };
    const response = await getDataSource(params);
    const { records } = response;
    secretflowStore.getDataSourceList(records)
    state.DataList = records
    // state.DataList = secretflowStore.dataList;
    // if (records && records.length > 0) {
    //   // state.DataList = records;
    //   records.forEach((item) => {
    //     item.type = 'data';
    //     item.dataType = 'self-innovate';
    //   });
    //   state.DataList.push({ dataName: '自研', id: 1, children: [...records] })
    // }
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
  fetchTreeData();
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
</script>

<template>
  <div class="catalog-wrapper">
    <div class="header-area background">
      <div class="title">数据源目录</div>
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
          <!-- <div class="tab">
            <el-button v-for="item in SourceType.options" :key="item.value" type="text"
              :class="{ active: state.search.dataSourceType === item.value }" @click="onTabChange(item.value)">
              {{ item.label }}数据
            </el-button>
          </div> -->

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
