<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  getAlgorithmList,
  deleteBind,
} from '../../../apis/workspace/algorithm.api';
import TableContainer from '../../../layouts/TableContainer.vue';
import {
  AlgorithmLibPublishType,
  AlgorithmCategory,
} from '../../../utils/const';
import { ElMessage, ElMessageBox } from 'element-plus';

const TableContainerRef = ref(null);
const router = useRouter();
const route = useRoute();
const props = defineProps({
  verId: { type: String, required: true },
  publishState: { type: Array, default: [] },
});

const state = reactive({
  loading: false,
  tableData: [],
  search: {},
});

// defineExpose({ fetchTableData });

watch(
  () => props.publishState,
  (newVal) => {
    state.tableData = newVal
  },
);

onMounted(() => {
  // fetchTableData(1);
});

// async function fetchTableData(page) {
//   try {
//     state.loading = true;
//     if (props.verId) {
//       const pager = TableContainerRef.value.pager;
//       const response = await getAlgorithmList({
//         currentPage: page || pager.page,
//         size: pager.size,
//         verId: props.verId,
//       });
//       const { records, current, size, total } = response;
//       state.tableData = records;
//       pager.size = size;
//       pager.page = current;
//       pager.total = total;
//     }
//   } catch (error) {
//     console.error(error);
//   } finally {
//     state.loading = false;
//   }
// }

function onPageChange(page) {
  fetchTableData(page);
}

async function unbind(row) {
  const confirm = await ElMessageBox.confirm(
    '此操作会将该算法移出算法库, 是否继续?',
    '提示',
    {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning',
    },
  ).catch(() => {});
  if (confirm !== 'confirm') {
    return;
  }
  try {
    state.loading = true;
    await deleteBind(row.id);
    ElMessage.success('操作成功');
    await fetchTableData(1);
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

function toDetail(row) {
  router.push({
    name: route.name,
    query: {
      algorithmName: row.name,
      id: row.algorithmId,
    },
  });
}
</script>

<template>
  <TableContainer
    ref="TableContainerRef"
    class="table-container__table"
    :showFilter="false"
    @page-change="onPageChange"
  >
    <el-table v-loading="state.loading" :data="state.tableData">
      <el-table-column fixed align="center" label="算法名称" width="400px">
        <template #default="{row}">
          <el-link type="primary"
            >{{ row.labelName }}({{ row.name }})
          </el-link>
        </template>
      </el-table-column>
      <!-- <el-table-column
        header-align="center"
        align="center"
        label="类型"
        prop="category"
        width="200px"
      >
        <template #default="{ row }"
          >{{ AlgorithmCategory.getLabel(row.category) }}
        </template>
      </el-table-column> -->
      <el-table-column
        header-align="center"
        align="center"
        label="版本"
        prop="algorithmVersion"
        width="200px"
      />
      <el-table-column
        header-align="center"
        align="center"
        label="描述"
        prop="description"
        min-width="200px"
        show-overflow-tooltip
      />
      <!--      <el-table-column-->
      <!--        header-align='center'-->
      <!--        align='center'-->
      <!--        label='操作'-->
      <!--        fixed='right'-->
      <!--        min-width='100px'-->
      <!--      >-->
      <!--        <template #default='{ row }'>-->
      <!--          <el-link-->
      <!--            type='primary'-->
      <!--            :underline='false'-->
      <!--            :disabled='!(AlgorithmLibPublishType.canEdit(props.publishState))'-->
      <!--            @click='unbind(row)'-->
      <!--          >-->
      <!--            解绑-->
      <!--          </el-link>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>
  </TableContainer>
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
