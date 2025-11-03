<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { FormType, SourceType } from '../../../utils/const';
import { reactive, ref, computed } from 'vue';
import { deleteProject, createJob } from '../../../apis/workspace/project.api';
import EditProjectDialog from './EditProjectDialog.vue';
import { getProjectJobList } from '../../../apis/workspace/project.api'
import { deleteGraph, listGraph, deleteSecretflowProject } from '@/apis/secretflow/secretflow.api.js'
import {getProjectById} from '../../../apis/workspace/project.api'

const route = useRoute();
const router = useRouter();
const state = reactive({
  loading: false,
});
const EditProjectFormDialogRef = ref(null);
const emits = defineEmits(['done']);
const defaultProps = {
  children: 'projectJobList',
  label: 'name',
};
const props = defineProps({
  treeData: {
    type: Array,
    required: true,
  },
});

const ProjectType = computed(() => route.query.type)
const graphId = ref('')
const defaultArr = ref([])

async function onRun(data) {
  try {
    state.listLoading = true;
    const response = await createJob(data.id);
    ElMessage.success(response.retmsg || '操作成功');
  } catch (error) {
    ElMessage.error(error);
  } finally {
    emits('done');
    state.listLoading = false;
  }
}

async function onDelete(data) {
  if (!(data.platform === ProjectType.value)) return
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
  // const { records } = await getProjectJobList(
  //   data.id,
  //   1,
  //   999
  // )
  // records.forEach(item => {
  //   if (item.isCollected) {
  //     ElMessage.error('无法删除，请先取消所有模型收藏!')
  //     throw new Error('无法删除，请先取消所有模型收藏!')
  //   }
  // })
  try {
    state.loading = true;
    // if (ProjectType.value === 'SECRETFLOW') {
      // const res = await getProjectById(route.query.id)
      // await deleteGraph({ projectId: res.tProjectAlgConfig.configData, graphId: res.tProjectAlgConfig.dependencyData })
      // await deleteSecretflowProject({ projectId: data.tProjectAlgConfig.configData })
      // await deleteProject(data.id);
    // } else if (ProjectType.value === 'FATE' || ProjectType.value === 'INNOVATE') {
      await deleteProject(data.id);
    // }
    ElMessage.success('删除成功');
    emits('done');
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '删除失败');
  } finally {
    state.loading = false;
  }
}

function onEdit(data) {
  EditProjectFormDialogRef.value.show(data);
}

async function onTreeNodeClick(node) {
  if(node?.children) return
  router.push({
    name: route.name,
    query: {
      projectName: node.projectName,
      id: node.id,
      action: FormType.READ,
      type: node.platform
      // type: 3
    },
  });
}

function onUpdateDataTable() {
  emits('done');
}
</script>

<template>
  <el-tree :data="props.treeData" node-key="id" highlight-current @node-click="onTreeNodeClick"
    :default-checked-keys="defaultArr" default-expand-all>
    <template #default="{ node, data }">
      <div class="custom-tree-node">
        <span>
          {{ data.projectName }}
        </span>
        <span class="action">
          <el-link type="primary" :underline="false" @click.stop="onEdit(data)" v-permission="'edit'">
            <el-icon>
              <Edit></Edit>
            </el-icon>
          </el-link>
          <el-divider direction="vertical" />
          <el-link v-if="SourceType.isSelf(data.projectSourceType) || data.projectId" type="primary" :underline="false"
            @click.stop="onRun(data)" v-permission="'start'">
            <el-icon>
              <img src="../../../assets/workspace/play.svg" alt="运行" />
            </el-icon>
          </el-link>
          <el-divider v-if="SourceType.isSelf(data.projectSourceType) || data.projectId" direction="vertical" />
          <el-link type="primary" :underline="false" @click.stop="onDelete(data)" v-permission="'delete'">
            <el-icon>
              <Delete />
            </el-icon>
          </el-link>
        </span>
      </div>
    </template>
  </el-tree>
  <EditProjectDialog ref='EditProjectFormDialogRef' @done='onUpdateDataTable' />
</template>

<style scoped lang="scss">
.catalog-wrapper {
  background-color: #fff;
  height: 100%;
  overflow: auto;

  .main {
    padding: 20px;
    height: 100%;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.0390625rem;
    height: 100%;
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
