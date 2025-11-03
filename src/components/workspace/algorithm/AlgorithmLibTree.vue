<script setup>
import { useRoute, useRouter } from 'vue-router';
// import { ElMessageBox, ElMessage } from 'element-plus';
import { AlgorithmLibPublishType, FormType } from '../../../utils/const';
// import { reactive } from 'vue';
// import {
//   deleteVersion,
//   copyAlgorithmLib,
// } from '../../../apis/workspace/algorithm.api';

const route = useRoute();
const router = useRouter();
// const state = reactive({
//   loading: false,
// });
// const emits = defineEmits(['done']);
const defaultProps = {
  // children: 'algorithmVersionList',
  label: 'labelName',
};
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

// async function onCopy(data) {
//   try {
//     state.loading = true;
//     await copyAlgorithmLib(data.id);
//     ElMessage.success('复制成功');
//     emits('done');
//   } catch (error) {
//     console.error(error);
//     ElMessage.error(error || '复制失败');
//   } finally {
//     state.loading = false;
//   }
// }

// async function onDelete(data) {
//   const confirm = await ElMessageBox.confirm(
//     '此操作将永久删除, 是否继续?',
//     '提示',
//     {
//       confirmButtonText: '是',
//       cancelButtonText: '否',
//       type: 'warning',
//     },
//   ).catch(() => {});
//
//   if (confirm !== 'confirm') {
//     return;
//   }
//   try {
//     state.loading = true;
//     await deleteVersion(data.id);
//     ElMessage.success('删除成功');
//     emits('done');
//   } catch (error) {
//     console.error(error);
//     ElMessage.error(error || '删除失败');
//   } finally {
//     state.loading = false;
//   }
// }

// 二级菜单跳转表达
function onTreeNodeClick(node) {
  if(node.children) return
  if (node.type === 'lib') {
    router.push({
      name: route.name,
      query: {
        libraryName: node.labelName,
        id: node.id,
        action: FormType.READ,
      },
    });
  } else {
    router.push({
      name: route.name,
      query: {
        algorithmName: node.labelName,
        id: node.id,
        action: FormType.READ,
      },
    });
  }
}
</script>

<template>
  <!--   default-expand-all     highlight-current-->
  <el-tree
    :data="props.data"
    :props="defaultProps"
    empty-text="无数据"
    node-key="id"
    :default-expand-all="true"
    highlight-current
    @node-click="onTreeNodeClick"
    >
    <!-- accordion -->
    <!-- 按钮显示 -->
    <template #default="{ data }">
      <div class="custom-tree-node">
        <div>
          {{ data.labelName }}
        </div>
        <!--        <div class="action">-->
        <!--          <el-link-->
        <!--            v-if="AlgorithmLibPublishType.canEdit(data.publishState)"-->
        <!--            type="primary"-->
        <!--            :underline="false"-->
        <!--            @click.stop="onDelete(data)"-->
        <!--          >-->
        <!--            <el-icon>-->
        <!--              <Delete />-->
        <!--            </el-icon>-->
        <!--          </el-link>-->
        <!--          <el-divider-->
        <!--            v-if="AlgorithmLibPublishType.canEdit(data.publishState)"-->
        <!--            direction="vertical"-->
        <!--          />-->
        <!--          <el-link-->
        <!--            v-if="data.algorithmVersionList"-->
        <!--            type="primary"-->
        <!--            :underline="false"-->
        <!--            @click.stop="onCopy(data)"-->
        <!--          >-->
        <!--            <el-icon-->
        <!--              ><img src="../../../assets/workspace/copy.svg" alt=""-->
        <!--            /></el-icon>-->
        <!--          </el-link>-->
        <!--        </div>-->
      </div>
    </template>
  </el-tree>
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
    gap: 0.5rem;

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
