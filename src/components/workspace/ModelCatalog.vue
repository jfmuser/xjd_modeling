<script setup>
import { reactive, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteModel } from '../../apis/workspace/model.api';
import { getModelList } from '../../apis/manager/managerApi';
import {getProjectById} from '../../apis/workspace/project.api'
import _ from 'lodash';
const router = useRouter();
const route = useRoute();
function onSearch() {
  fetchTreeData();
}
const state = reactive({
  search: {},
  treeData: [],
});
const treeId = computed(() => route.query.modelId);
onMounted(async () => {
  await fetchTreeData();
  await renderTree();
});
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
      currentPage: 1,
      size: 999,
      ..._.pickBy(state.search, (value) => value !== ''),
    };
    const response = await getModelList(params);
    const { records } = response;
    state.treeData = records;
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}
async function onTreeNodeClick(node) {
  const projectInfo = await getProjectById(node.projectId)
  const projectJSON = JSON.parse(projectInfo.projectJson)
  const multi = projectJSON.job_runtime_conf.role.host.length > 1 ? true : false  
  router.push({
    name: route.name,
    query: {
      modelName: node.modelName,
      modelId: node.id,
      modelVersion: node.modelVersion,
      projectId: node.projectId,
      multi:multi
    },
  });
}

async function onDelete(modelVersion) {
  const confirm = await ElMessageBox.confirm(
    '此操作将永久删除, 是否继续?',
    '提示',
    {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning',
    },
  ).catch(() => { });

  if (confirm !== 'confirm') {
    return;
  }
  try {
    await deleteModel(modelVersion);
    ElMessage.success('删除成功');
    await fetchTreeData();
  } catch (error) {
    ElMessage.error(error || '删除失败');
  }
}
</script>

<template>
  <div class="catalog-wrapper">
    <div class="header-area background">
      <div class="title">模型目录</div>
    </div>
    <div class="main">
      <div class="actions">
        <div class="action-row">
          <el-input v-model="state.search.modelName" placeholder="模型名称" class="search-input" clearable
            @keydown.enter="onSearch" @clear="onSearch">
            <template #suffix>
              <el-icon @click="onSearch" style="cursor: pointer;">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <el-tree :data="state.treeData" :props="{
          children: 'children',
          label: 'modelName',
        }" node-key="id" highlight-current @node-click="onTreeNodeClick">
          <template #default="{ data }">
            <div class="custom-tree-node">
              <div>
                {{ data.modelName }}
              </div>
              <div class="action">
                <el-link type="primary" :underline="false" @click.stop="onDelete(data.modelVersion)"
                  v-permission="'delete'">
                  <el-icon>
                    <Delete></Delete>
                  </el-icon>
                </el-link>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
  </div>
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
      gap: 0.25rem;

      .el-button {
        border: 1px solid rgba(67, 118, 255, 0.2) !important;
        padding: 0.5rem;
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

:deep .el-tree-node__content {
  &:hover {
    .action {
      visibility: visible;
    }
  }
}
</style>
