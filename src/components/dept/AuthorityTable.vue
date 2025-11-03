<script setup>
import { ref } from 'vue';
import _ from 'lodash';
import { ElMessage } from 'element-plus';
import TableContainer from '@/layouts/TableContainer.vue';
import { authorityReview } from '@/apis/monitor/authority.api';
import { formatScenarioType, formatDateTime } from '../../utils';
import useFederationStore from '@/stores/monitor/federation.store';

const federationStore = useFederationStore();
const multipleSelection = ref([]);
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const emits = defineEmits(['done']);
defineExpose({ onBatchDeal });

async function onBatchDeal() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择');
    return;
  }
  const groups = _.groupBy(multipleSelection.value, 'institutions');
  Object.keys(groups).forEach((group) => {
    const items = groups[group];
    onReview({
      approvedInstitutionsList: items.map((item) => item.applicant),
      institutions: group,
    });
  });
}

async function onDeal(row) {
  onReview({
    approvedInstitutionsList: [row.applicant],
    institutions: row.institutions,
  });
}

async function onReview({ approvedInstitutionsList, institutions }) {
  try {
    await authorityReview({
      approvedInstitutionsList,
      institutions,
    });
    federationStore.fetchData();
    federationStore.fetchCurrentAuthority(institutions);
    emits('done');
  } catch (error) {
    console.error(error);
  }
}

function onSelectionChange(val) {
  multipleSelection.value = val;
}
</script>

<template>
  <TableContainer :showFilter="false" :showPagination="false">
    <el-table :data="props.data" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="applicant" label="部门"></el-table-column>
      <el-table-column label="详情" min-width="500px">
        <template #default="{ row }">
          {{
            `部门组织 "${row.applicant}" 申请查看${formatScenarioType(
              row.scenarioType,
            )}以下的部门 ${row.institutions}`
          }}
        </template>
      </el-table-column>
      <el-table-column label="时间" sortable min-width="180px">
        <template #default="{ row }">
          {{ formatDateTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" sortable></el-table-column>
      <el-table-column label="操作" fixed="right" min-width="100px">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" @click="() => onDeal(row)">同意
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
</template>

<style scoped>
.table-container {
  padding-left: 0;
  padding-right: 0;
}
</style>
