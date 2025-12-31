<script setup>
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import { onMounted, reactive, ref, computed } from 'vue';
import userStore from '../../stores/auth.store';
import {
  deleteVersion,
  copyAlgorithmLib,
  publish,
  deleteBind,
  getLibAndAlgList,
} from '../../apis/workspace/algorithm.api';
import {
  AlgorithmLibPublishType,
  algAndLibType,
  AlgorithmCategory,
} from '../../utils/const';
import { ElMessage, ElMessageBox } from 'element-plus';
import CreateAlgorithmLibraryDialog from '../../components/workspace/algorithm/CreateAlgorithmLibraryDialog.vue';
import ImportAlgorithmLibraryDialog from '../../components/workspace/algorithm/ImportAlgorithmLibraryDialog.vue';
import BindAlgorithmDialog from '../../components/workspace/algorithm/BindAlgorithmDialog.vue';
import useSecretflowStore from '../../stores/secretflow/secretflowInfo.store'
import { listComponents } from '../../apis/secretflow/secretflow.api'

const secretflowStore = useSecretflowStore()
const userInfo = userStore().userInfo;
const TableContainerRef = ref(null);
const CreateAlgorithmLibraryDialogRef = ref(null);
const ImportAlgorithmLibraryDialogRef = ref(null);
const BindAlgorithmDialogRef = ref(null);
const state = reactive({
  loading: false,
  tableData: [],
  search: {},
  userRole: [],
  canEdit: false,
});
const selfParties = computed(() => JSON.parse(sessionStorage.getItem('selfParties')))

onMounted(() => {
  // if (userInfo && userInfo.roleCodeList) {
  //   state.userRole = userInfo.roleCodeList;
  // }
  // if (
  //   'ADMIN'.includes(state.userRole) ||
  //   'DEPT_ADMIN'.includes(state.userRole) ||
  //   'SUPER_ADMIN'.includes(state.userRole)
  // ) {
  //   state.canEdit = true;
  // }
  state.canEdit = userInfo.admin
  fetchTableData(1);
});

async function fetchTableData (page) {
  try {
    state.loading = true;
    const pager = TableContainerRef.value.pager;
    const params = {
      "pageRequest": {
        "pageNumber": 1,
        "pageSize": 999
      },
    };
    const response = await getLibAndAlgList(params);
    const { records, current, size, total } = response;

    state.tableData = records;
    if (selfParties.value?.secretflowInfo) {
      const allArr = []
      const scretflowAlgList = { labelName: 'secretflow', name: '默认', outerVerNo: '1.0.0', type: 'secretflow', verType: 'release', publishState: 2, algorithmVersionList: [] }
      if (!secretflowStore.nodeDetail) {
        const data = await listComponents()
        data.secretflow.comps.forEach(item => {
          allArr.push({ app: 'secretflow', name: item.name, domain: item.domain })
        })
        await secretflowStore.getNodeDetail(allArr)
        await secretflowStore.getSecretflowI18n()
      }
      secretflowStore.nodeDetail.forEach((item, i) => {
        const currentI18n = secretflowStore.i18n[`${item.domain}/${item.name}:${item.version}`]
        scretflowAlgList.algorithmVersionList.push({
          outerVerNo: item.version,
          labelName: currentI18n[item.name],
          name: item.name,
          id: i,
          description: currentI18n[item.desc],
          category: currentI18n[item.domain],
          type: 'secretflow'
        })
      })
      state.tableData.unshift(scretflowAlgList)
      console.log(state.tableData, 'DETAIL')
    }
    pager.size = size;
    pager.page = current;
    pager.total = total;
  } finally {
    state.loading = false;
  }
}

function onPageChange (page) {
  fetchTableData(page);
}

function onSearch (reset = false) {
  if (reset) {
    state.search = {};
  }
  fetchTableData(1);
}

function onAdd () {
  CreateAlgorithmLibraryDialogRef.value.show();
}

function onImport () {
  ImportAlgorithmLibraryDialogRef.value.show();
}

function onBindAlgorithm (data) {
  BindAlgorithmDialogRef.value.show(data);
}

function onAfter () {
  fetchTableData(1);
}

function onEdit (row) {
  // router.push({
  //   name: route.name,
  //   query: {
  //     libraryName: row.libraryName,
  //     id: row.id,
  //     action: FormType.EDIT,
  //   },
  // });
  CreateAlgorithmLibraryDialogRef.value.show(row);
}

async function onCopy (data) {
  try {
    state.loading = true;
    await copyAlgorithmLib(data.id);
    ElMessage.success('复制成功');
    // emits('done');
    await fetchTableData();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '复制失败');
  } finally {
    state.loading = false;
  }
}

async function onPublish (data) {
  try {
    state.loading = true;
    await publish(data.id);
    ElMessage.success('发布成功');
    await fetchTableData();
  } catch (error) {
    ElMessage.error('发布失败');
  } finally {
    state.loading = false;
  }
}

async function onDelete (data) {
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
    await deleteVersion(data.id);
    ElMessage.success('删除成功');
    await fetchTableData();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '删除失败');
  } finally {
    state.loading = false;
  }
}

async function unbind (row) {
  const confirm = await ElMessageBox.confirm(
    '此操作会将该算法移出算法库, 是否继续?',
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

    await deleteBind(row.bindId);
    ElMessage.success('操作成功');
    await fetchTableData(1);
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

async function load (row, treeNode, resolve) { }
</script>

<template>
  <TableContainer ref="TableContainerRef"
                  class="table-container__table"
                  loading="state.loading"
                  title="算法库列表"
                  :showImport="state.canEdit"
                  :showAdd="state.canEdit"
                  @search="onSearch"
                  @page-change="onPageChange"
                  @add="onAdd"
                  @import="onImport">
    <template #filter>
      <FilterItem>
        <el-input v-model.trim="state.search.name"
                  placeholder="算法库名称"
                  style="width: 276px" />
      </FilterItem>
    </template>

    <el-table :data="state.tableData"
              row-key="id"
              :tree-props="{ children: 'algorithmVersionList' }">
      <el-table-column label="算法(库)名称"
                       prop="labelName"
                       width="300px">
        <template #default="{ row }">
          <template v-if="algAndLibType.isLib(row.type)">
            {{ row.labelName }}
          </template>
          <template v-else>{{ row.labelName }}({{ row.name }})</template>
        </template>
      </el-table-column>
      <el-table-column label="版本号"
                       prop="outerVerNo"
                       width="100px">
        <template #default="{ row }">
          <template v-if="algAndLibType.isLib(row.type) || row.type === 'secretflow'">
            {{ row.outerVerNo }}
          </template>
          <template v-else>{{ row.algorithmVersion }}</template>
        </template>
      </el-table-column>
      <el-table-column label="发布状态"
                       width="200px">
        <template #default="{ row }">
          <template v-if="algAndLibType.isLib(row.type) || row.type === 'secretflow'">
            {{ AlgorithmLibPublishType.getLabel(row.publishState) }}
            <el-button v-show="AlgorithmLibPublishType.canEdit(row.publishState) &&
              state.canEdit
              "
                       type="primary"
                       @click="onPublish(row)">
              发布
            </el-button>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="算法类型"
                       prop="category"
                       width="200px">
        <template #default="{ row }">{{ AlgorithmCategory.getLabel(row.category) || row.category }}
        </template>
      </el-table-column>

      <el-table-column label="版本描述"
                       prop="description"
                       show-overflow-tooltip>
        <template #default="{ row }">{{ row.description || '-' }}</template>
      </el-table-column>
      <el-table-column v-if="state.canEdit"
                       label="操作"
                       width="260px"
                       fixed="right">
        <template #default="{ row }">
          <el-link v-show="algAndLibType.isLib(row.type)"
                   type="primary"
                   :underline="false"
                   @click="onCopy(row)">复制
          </el-link>
          <el-divider v-show="algAndLibType.isLib(row.type)"
                      direction="vertical" />
          <el-link v-show="algAndLibType.isLib(row.type)"
                   type="primary"
                   :underline="false"
                   :disabled="!userInfo.id === '1' && !AlgorithmLibPublishType.canEdit(row.publishState)"
                   @click="onEdit(row)">编辑
          </el-link>
          <el-divider v-show="algAndLibType.isLib(row.type)"
                      direction="vertical" />
          <el-link v-show="algAndLibType.isLib(row.type)"
                   type="primary"
                   :underline="false"
                   :disabled="!AlgorithmLibPublishType.canDel(row.publishState)"
                   @click="onDelete(row)">删除
          </el-link>
          <el-link v-show="!algAndLibType.isLib(row.type) && row.type !== 'secretflow'"
                   type="primary"
                   :underline="false"
                   :disabled="!userInfo.id === '1' && !AlgorithmLibPublishType.canEdit(row.publishState)"
                   @click="unbind(row)">解绑
          </el-link>
          <el-divider v-show="algAndLibType.isLib(row.type)"
                      direction="vertical" />

          <!--          <el-link-->
          <!--            v-show="algAndLibType.isLib(row.type)"-->
          <!--            type="primary"-->
          <!--            :underline="false"-->
          <!--            :disabled="!AlgorithmLibPublishType.canEdit(row.publishState)"-->
          <!--            @click="onPublish(row)"-->
          <!--            >发布-->
          <!--          </el-link>-->
          <!--          <el-divider-->
          <!--            v-show="algAndLibType.isLib(row.type)"-->
          <!--            direction="vertical"-->
          <!--          />-->
          <el-link v-show="algAndLibType.isLib(row.type)"
                   type="primary"
                   :underline="false"
                   :disabled="!userInfo.id === '1' && !AlgorithmLibPublishType.canEdit(row.publishState)"
                   @click="onBindAlgorithm(row)">绑定算法
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <CreateAlgorithmLibraryDialog ref="CreateAlgorithmLibraryDialogRef"
                                @done="onAfter" />
  <ImportAlgorithmLibraryDialog ref="ImportAlgorithmLibraryDialogRef"
                                @done="onAfter" />
  <BindAlgorithmDialog ref="BindAlgorithmDialogRef"
                       @done="onAfter" />
</template>

<style scoped lang="scss">
.table-container {
  &__table {
    :deep .el-table {
      .cell {
        text-align: left !important;
      }
    }
  }
}
</style>
