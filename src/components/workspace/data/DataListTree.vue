<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { FormType, DataStatus, SourceType } from '../../../utils/const';
import { reactive, ref, watch, computed } from 'vue';
// import { deleteData } from '../../../apis/workspace/data.api';
// import { deleteDatatable } from '../../../apis/secretflow/secretflow.api'
import { delData, delDataSource } from '../../../apis/manager/managerApi'
import DataPublishDialog from './DataPublishDialog.vue';

const route = useRoute();
const router = useRouter();
const DataPublishDialogRef = ref(null);
const state = reactive({
  loading: false,
});
const emits = defineEmits(['afterDelete']);

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});
const type = computed(() => route.query.type)

const isFirst = ref(true)
// 父组件给子组件传值
const listtitle = ref({});
function onPublish(data) {
  // console.log('data', data);
  listtitle.value = data;
  DataPublishDialogRef.value.show(data);
}

async function onDelete(data) {
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
    state.loading = true;
    if (type.value === 'data') {
      await delData(data.id);
    } else {
      await delDataSource(data.id)
    }
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error(error || '删除失败');
  } finally {
    emits('afterDelete');
    state.loading = false;
  }
}


function onTreeNodeClick(node) {
  if (node.children) return
  isFirst.value = false
  const nodeId = JSON.parse(sessionStorage.getItem('selfParties')).secretflowInfo ? JSON.parse(JSON.parse(sessionStorage.getItem('selfParties')).secretflowInfo).nodeId : ''
  const datatableId = node.remarks ?? ''
  router.push({
    name: route.name,
    query: {
      dataName: node.name,
      id: node.id,
      action: FormType.READ,
      type: location.hash.includes('dataSource') ? 'dataSource' : 'data',
      core: node.platform,
      nodeId,
      datatableId
    },
  });
}
</script>

<template>
  <el-tree v-loading="state.loading" :data="props.data" node-key="id" highlight-current @node-click="onTreeNodeClick" default-expand-all>
    <template #default="{ data }">
      <div class="custom-tree-node">
        <div>
          {{ data.name || data.dataName }}
        </div>
        <div class="action">
          <el-link type="primary" :underline="false" @click.stop="onDelete(data)">
            <el-icon>
              <Delete />
            </el-icon>
          </el-link>
        </div>
      </div>
    </template>
  </el-tree>
  <!-- 发布数据的弹框显示 -->
  <DataPublishDialog ref="DataPublishDialogRef" :listtitle="listtitle" />
</template>

<style scoped lang="scss">
.catalog-wrapper {
  background-color: #fff;
  height: 100%;

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
        padding: 15px;
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
