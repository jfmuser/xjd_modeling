<script setup>
import _ from 'lodash';
import { reactive, onMounted, nextTick, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProjectListTree from './ProjectListTree.vue';
import CreateProjectDialog from './CreateProjectDialog.vue';
import { getProjectList } from '../../../apis/workspace/project.api';
import { FormType, SourceType } from '../../../utils/const';
import { queryAllProject } from '../../../apis/manager/managerApi';
import useSecretflowStore from '@/stores/secretflow/secretflowInfo.store'
import useSiteStore from '../../../stores/dept/site.store';
import useAuthStore from '../../../stores/auth.store';

const route = useRoute();
const router = useRouter();
const siteStore = useSiteStore()
const authStore = useAuthStore()
const secretflowStore = useSecretflowStore()
const CreateProjectDialogRef = ref(null);
const state = reactive({
  search: { projectSourceType: SourceType.SELF },
  guestProjectList: [],
  hostProjectList: [],
  projectList:[]
});
const treeId = computed(() => route.query.id);
const projectSourceType = computed(() => route.query.projectSourceType)
const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))

watch(
  () => treeId.value,
  async () => {
    await renderTree();
  },
);

watch(() => authStore.IsUKey,async () => {
    await fetchTreeData();
  // await addSecretflowProject()
  onUpdateTreeData()
  await renderTree();
})
onMounted(async () => {
  await fetchTreeData();
  // await addSecretflowProject()
  onUpdateTreeData()
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
    // const treeNode = document.querySelector('.el-tree-node');
    // treeNode?.click();
    const treeNodeChildren = document.querySelector('.el-tree-node__children .el-tree-node');
    treeNodeChildren?.click()
  }
}

async function onTabChange(val) {
  console.log(val,'是不是');
  
  state.search.projectSourceType = val;
  await fetchTreeData();
   if (Number(val)) {
    state.projectList = state.hostProjectList
  } else {
    state.projectList = state.guestProjectList
  }
  await router.replace({ name: route.name, query: { projectSourceType: val } });
  await renderTree();
}

async function fetchTreeData() {
  try {
    state.loading = true;
    const params = {
      pageNum: 1,
      size: 999,
      ..._.pickBy(state.search, (value) => value !== ''),
    };
    // if(!authStore.IsUKey) return
    const { records } = await queryAllProject({
      "pageRequest": {
        "pageNumber": 1,
        "pageSize": 999
      }
    })
    // state.projectList = records;
    if (records && records.length > 0) {
      records.forEach((item) => {
        switch (item.projectFromId) {
          case `${selfParties.id}`:
              state.guestProjectList.push(item)
            break;
          default:
            console.log(item,'LLLLLLLLLLLLLLLLLLLLLLLLLLLAAAAAAAAAAAAAAAAAAAA')
              state.hostProjectList.push(item)
        }
      });
    }
    
    state.guestProjectList = handleTreeData(state.guestProjectList)
    state.hostProjectList = handleHostTreeData(state.hostProjectList)
    
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}


function onAdd() {
  CreateProjectDialogRef.value.show(FormType.CREATE);
}

function onViewAll() {
  router.push({
    path: route.path,
    query: { all: true },
  });
}

function onUpdateTreeData() {
  state.projectList = []
  onTabChange(0);
  renderTree();
}

function handleHostTreeData(hostTreeData) {
  const treeDataList = []
  
  console.log(siteStore.otherSite,'otherSite');
  hostTreeData.forEach(data => {
    siteStore.otherSite.forEach(otherData => {
      if (data.projectFromId === otherData.id && !treeDataList.some(item => item.projectName === otherData.name)) {
        treeDataList.push({projectName:otherData.name,children:[data]})
      } else if (data.projectFromId === otherData.id && treeDataList.some(item => item.projectName === otherData.name)) {
        treeDataList.find(item => item.projectName === otherData.name).children.push(data)
      }
      
    })
  })
  console.log(treeDataList,'hostTreeData');
  
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
    const currentSite = siteStore.otherSite.find(site => site.id === data.projectFromId)
    console.log(data.platform,treeData,'data.platform');
    
    if (data.platform == '0' && !InnovateSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '0').name
      treeDataList.push({ projectName: engineName, children: [data] })
      InnovateSign = treeDataList.length
      return
    } else if (data.platform == '0' && InnovateSign) {
      treeDataList[InnovateSign - 1].children.push(data)
      return
    }
    // 处理隐语算法分类，SecretflowSign如果有值说明已经push了隐语的树状数据
    if (data.platform == '1' && !SecretflowSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '1').name
      treeDataList.push({ projectName: engineName, children: [data] })
      SecretflowSign = treeDataList.length
      return
    } else if (data.platform == '1' && SecretflowSign) {
      treeDataList[SecretflowSign - 1].children.push(data)
      return
    }
    // 处理GO算法分类，GoSign如果有值说明已经push了GO的树状数据
    if (data.platform == '2' && !GoSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '2').name
      treeDataList.push({ projectName: engineName, children: [data] })
      GoSign = treeDataList.length
      return
    } else if (data.platform == '2' && GoSign) {
      treeDataList[GoSign - 1].children.push(data)
      return
    }
    // 处理TEE分类，TeeSign如果有值说明已经push了GO的树状数据
    if (data.platform == '3' && !TeeSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '3').name
      treeDataList.push({ projectName: engineName, children: [data] })
      TeeSign = treeDataList.length
      return
    } else if (data.platform == '3' && TeeSign) {
      treeDataList[TeeSign - 1].children.push(data)
      return
    }
    // 处理python分类，PythonSign如果有值说明已经push了GO的树状数据
    if (data.platform == '4' && !PythonSign) {
      const engineName = currentSite.tDomainEngineList.find(engine => engine.engine == '4').name
      treeDataList.push({ projectName: engineName, children: [data] })
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
      <div class="title">项目目录</div>
      <div class="right">
        <el-button type="text" class="add" @click="onAdd" v-permission="'add'">
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
              :class="{ active: state.search.projectSourceType === item.value }" @click="onTabChange(item.value)">
              {{ item.label }}项目
            </el-button>
          </div>
          <!-- <el-button type="text" class="tree-switch" @click="onViewAll">
            查看所有
            <el-icon>
              <ArrowRight />
            </el-icon>
          </el-button> -->
        </div>
        <!-- <div class="action-row">
          <el-input v-model.trim="state.search.projectName" placeholder="项目名称" clearable @keydown.enter="onSearch"
            @clear="onSearch">
            <template #suffix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
</el-input>
</div> -->
        <!-- 左侧树状结构 -->
        <ProjectListTree :treeData="state.projectList" @done="onUpdateTreeData" />
      </div>
    </div>
  </div>
  <CreateProjectDialog ref="CreateProjectDialogRef" @done="onUpdateTreeData" />
</template>

<style scoped lang="scss">
.catalog-wrapper {
  background-color: #fff;
  height: 100%;
  // overflow: auto;

  .main {
    padding: 20px;
    height: 100%;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.0390625rem;
    height: 94%;
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

.el-tree {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

:deep .el-tree-node__content {
  &:hover {
    .action {
      visibility: visible;
    }
  }
}
</style>
