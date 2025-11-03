<script setup>
import { computed, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TableContainer from '../../layouts/TableContainer.vue';
import { SiteStatus, SiteRole } from '../../utils/const';
import { formatDateTime } from '../../utils';
import useSiteStore from '../../stores/dept/site.store.js';
import useNoticeStore from '../../stores/dept/notice.store.js';
import SiteApply from './SiteApply.vue';
import AuthorityHistoryPopover from './AuthorityHistoryPopover.vue';

const siteApplyRef = ref(null);
const route = useRoute();
const router = useRouter();
const siteStore = useSiteStore();
const noticeStore = useNoticeStore();
const institutions = computed(() => route.query.institutions);
const currentData = computed(() => {
  if (!institutions.value) {
    return {};
  }
  const result = siteStore.institutions(institutions.value);
  if (!result) {
    return {};
  }
  return result;
});
const formModel = computed(() => currentData.value.__data || {});
const tableData = computed(() => {
  if (!currentData.value.children) {
    return [];
  }
  return currentData.value.children.map((item) => item.__data);
});
const isMine = computed(() => route.query.belong === 'me');

watch(
  () => institutions.value,
  () => {
    noticeStore.fetchApplyState();
  },
);

function goDetail({ siteId, partyId }) {
  router.push({
    name: route.name,
    query: {
      siteId,
      partyId,
      federatedId: formModel.value.federatedId,
      id: `${institutions.value}-${siteId}`,
    },
  });
}
</script>

<template>
  <TableContainer title="组织详情" :showAdd="false" :showFilter="false" :showPagination="false" :showImport="false">
    <el-form inline>
      <!-- 部门管理隐藏部门组织内容 https://e.gitee.com/xjtu-zp/issues/kanban?issue=I4XX64 -->
      <el-form-item v-if="isMine && 1 > 2" label="部门组织">
        {{ formModel.institutions }}
      </el-form-item>
      <el-form-item label="组织">
        {{ formModel.fateManagerInstitutions }}
      </el-form-item>
      <el-form-item v-if="isMine" label="创建时间">
        {{ formatDateTime(formModel.createTime) }}
      </el-form-item>
      <el-form-item label="部门数">
        {{ formModel.size }}
      </el-form-item>
    </el-form>
    <div>
      <template v-if="noticeStore?.applyState?.length > 0">
        您已申请查看部门
        {{ noticeStore.applyState.join(', ') }}请等待联邦管理平台的审批...
      </template>
      <template v-else>
        <el-button type="text" @click="() => {
          siteApplyRef.show();
        }
          ">申请查看成员联邦部门
        </el-button>
        <el-divider direction="vertical"></el-divider>
        <AuthorityHistoryPopover :institutions="institutions"></AuthorityHistoryPopover>
      </template>
    </div>
    <el-table :data="tableData" border>
      <el-table-column label="序号" type="index" width="100px">
      </el-table-column>
      <el-table-column label="部门名称">
        <template #default="{ row }">
          <el-link type="primary" :disabled="!isMine" @click="goDetail(row)">
            {{ row.siteName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="partyId" label="部门ID"> </el-table-column>
      <el-table-column prop="role" label="部门角色">
        <template #default="{ row }">
          {{ SiteRole.getText(row.role.code) }}
        </template>
      </el-table-column>
      <el-table-column label="激活时间" min-width="140px" prop="activationTime" sortable>
        <template #default="{ row }">
          <span>{{ formatDateTime(row.activationTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门状态">
        <template #default="{ row }">
          {{ SiteStatus.getText(row.status.code) }}
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <SiteApply ref="siteApplyRef" />
</template>

<style scoped></style>
