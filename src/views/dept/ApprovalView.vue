<script setup>
import {
  onMounted,
  provide,
  reactive,
  ref,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import _ from 'lodash';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import {
  getApprovalHistory,
  approvalAgree,
  approvalReject,
  updateApproval,
  readMessage,
} from '../../apis/dept/approval.api';
import ListContainer from '../../layouts/ListContainer.vue';
import TableContainer from '../../layouts/TableContainer.vue';
import FilterItem from '../../components/FilterItem.vue';
import MessageDialog from '../../components/MessageDialog.vue';
import { ApprovalStatus, MessageTopic, MessageType } from '../../utils/const';
import { formatDateTime } from '../../utils';
import TabContainer from '../../layouts/TabContainer.vue';
import { ON_AGREE, ON_REJECT } from '../../utils/key';
import AgreeDialog from "./AgreeDialog.vue";
import { getMySite } from "../../apis/dept/site.api";

let timer;
const AgreeDialogRef = ref(null);
const router = useRouter();
const route = useRoute();
const MessageDialogRef = ref(null);
const tableHeight = ref(300);
const state = reactive({
  loading: false,
  tableData: [],
  search: {},
  site: {},
  tabs: [
    { label: '待处理消息', value: 1 },
    { label: '历史消息', value: 2 },
  ],
  activeTab: Number(route.query.activeTab) || 1,
});
provide(ON_AGREE, onAgree);
provide(ON_REJECT, onReject);

onMounted(async () => {
  fetchTableData();
  timer = setInterval(() => {
    fetchTableData();
  }, 1000 * 15);
  rerenderTable();
  window.addEventListener('resize', rerenderTable);
});

async function rerenderTable() {
  await nextTick();
  const tableContainer = document.querySelector('.table-container');
  const filterDOM = document.querySelector('.table-container__filter');
  const style = window.getComputedStyle(tableContainer);
  const filterDOMStyle = window.getComputedStyle(filterDOM);
  // 52: margin top & bottom
  tableHeight.value =
    Number(style.getPropertyValue('height').replace('px', '')) -
    Number(filterDOMStyle.getPropertyValue('height').replace('px', '')) -
    52 -
    30;
}

onBeforeUnmount(() => {
  window.clearInterval(timer);
  window.removeEventListener('resize', rerenderTable);
});

function formatTableData(val) {
  return val.map((item) => {
    const newItem = Object.keys(item).reduce((result, current) => {
      result[_.camelCase(current)] = item[current];
      return result;
    }, {});
    return { ...item, ...newItem };
  });
}

async function fetchTableData() {
  try {
    const response = await getApprovalHistory({
      ...state.search,
    });
    console.log(response, 'QWEEWQ');
    let result;
    if (state.activeTab === 1) {
      result = response.filter((item) =>
        [ApprovalStatus.TODO, ApprovalStatus.READ_TODO].includes(
          item.message_status,
        ),
      );
    } else {
      result = response.filter((item) =>
        [ApprovalStatus.AGREED, ApprovalStatus.REFUSE].includes(
          item.message_status,
        ),
      );
    }

    state.tableData = formatTableData(result);
  } catch (error) {
    console.error(error);
  }
}

async function onAgree(row) {
  const response = await getMySite({ page: 1, pageSize: 1e9 });
  var arr = response.data;
  if (arr.length >= 0) {
    if (response.data[0].fateManagerInstitutions === row.pub_dept_manager) {
      try {
        state.loading = true;
        await approvalAgree({ id: row.id });
        await fetchTableData();
        ElMessage.success('操作成功');
      } catch (error) {
        console.error(error);
        ElMessage.error(error || '操作失败');
      } finally {
        state.loading = false;
      }
    } else {
      AgreeDialogRef.value.show(row);
    }
  } else {
    console.error("未获取到部门信息");
  }
}

async function onReject(row) {
  try {
    state.loading = true;
    await approvalReject({ id: row.id });
    fetchTableData();
    ElMessage.success('操作成功');
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

async function onShowMessage(row) {
  await readMessage({ "id": row.id });
  fetchTableData();
  MessageDialogRef.value.show(row);
}

function onSearch(reset = false) {
  if (reset) {
    state.search = {};
  }
  fetchTableData(1);
}

function onTabChange(val) {
  state.activeTab = val.value;
  state.search = {};
  fetchTableData(1);
  router.replace({ name: route.name, query: { activeTab: val.value } });
}
</script>

<template>
  <ListContainer v-loading="state.loading" title="审批中心">
    <TabContainer :options="state.tabs" :activeValue="state.activeTab" @change="onTabChange">
      <TableContainer :showPagination="false" @search="onSearch">
        <template #filter>
          <FilterItem label="搜索">
            <el-input v-model.trim="state.search.message_name"></el-input>
          </FilterItem>
          <FilterItem label="消息状态">
            <el-select v-model="state.search.message_status" placeholder="请选择消息状态">
              <el-option v-for="item in ApprovalStatus.options(state.activeTab)" :key="item.value" :value="item.value"
                :label="item.label">
              </el-option>
            </el-select>
          </FilterItem>
        </template>
        <el-table :data="state.tableData" :height="tableHeight">
          <el-table-column label="消息名称" min-width="160px" fixed>
            <template #default="{ row }">
              <el-badge is-dot :hidden="row.message_status !== ApprovalStatus.TODO">
                {{ row.message_name }}
              </el-badge>
            </template>
          </el-table-column>
          <el-table-column label="消息主题">
            <template #default="{ row }">
              {{ MessageTopic.getLabel(row.message_topic) }}
            </template>
          </el-table-column>
          <el-table-column label="消息类型">
            <template #default="{ row }">
              {{ MessageType.getLabel(row.message_type) }}
            </template>
          </el-table-column>
          <el-table-column label="消息状态" min-width="100px">
            <template #default="{ row }">
              {{ ApprovalStatus.getLabel(row.message_status) }}
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="消息内容" min-width="300px">
            <template #default="{ row }">
              <el-button type="text" @click="onShowMessage(row)">{{ row.message_content }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="pub_dept_manager" label="发送组织"></el-table-column>
          <el-table-column prop="pub_dept" label="发送部门" min-width="100px"></el-table-column>
          <el-table-column prop="pub_user" label="发送人"></el-table-column>
          <el-table-column prop="sub_dept_manager" label="接收组织"></el-table-column>
          <el-table-column prop="sub_dept" label="接收部门" min-width="100px"></el-table-column>
          <el-table-column prop="creator" label="创建人"></el-table-column>
          <el-table-column prop="updated_user" label="更新人"></el-table-column>
          <el-table-column label="上传时间" min-width="180px">
            <template #default="{ row }">
              {{ formatDateTime(row.create_time) }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" min-width="180px">
            <template #default="{ row }">
              {{ formatDateTime(row.update_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="200px"></el-table-column>
          <el-table-column label="操作" min-width="120px" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" :underline="false" :disabled="!ApprovalStatus.canEdit(row.message_status)"
                @click="onAgree(row)">
                同意
              </el-link>
              <el-divider direction="vertical"></el-divider>
              <el-link :underline="false" :disabled="!ApprovalStatus.canEdit(row.message_status)" @click="onReject(row)">
                拒绝
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </TableContainer>
    </TabContainer>
    <AgreeDialog ref="AgreeDialogRef"></AgreeDialog>
  </ListContainer>
  <MessageDialog ref="MessageDialogRef" source="approval"></MessageDialog>
</template>

<style scoped lang="scss">
:deep .list-container__main {
  padding-left: 0;
  padding-right: 0;
  overflow: hidden !important;
}

.tab-container {
  height: 100%;
}

:deep .table-container {
  padding: 0;
}

:deep .el-table {
  .cell {
    min-height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
