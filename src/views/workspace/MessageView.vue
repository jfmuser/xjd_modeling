<script setup>
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getMessageList,
  messageStored,
  messageUpdateReadStatus,
  updateAllReadStatus,
  getUnreadCount,
  deleteMessage,
} from '../../apis/workspace/message.api';
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
import {
  MessageStatus,
  MessageTopic,
  MessageType,
  MessageReadStatus,
  ApprovalStatus
} from '../../utils/const';
import { formatDateTime } from '../../utils';
import useConfigStore from '../../stores/workspace/config.store';
import { ON_READ, ON_STORED } from '../../utils/key';
import { getMySite } from "../../apis/dept/site.api";
import AgreeDialog from "../dept/AgreeDialog.vue";

const MessageDialogRef = ref(null);
const AgreeDialogRef = ref(null);
const TableContainerRef = ref(null);
const configInfo = useConfigStore().configInfo;
const state = reactive({
  loading: false,
  tableData: [],
  search: { messageStatus: MessageStatus.TODO },
});
provide(ON_STORED, onStored);
provide(ON_READ, onRead);
const selfSiteName = computed(() => {
  if (configInfo && configInfo.selfSiteList) {
    const selfSiteList = configInfo.selfSiteList;
    if (selfSiteList.length > 0) {
      return selfSiteList[0].siteName;
    }
  }
  return null;
});

onMounted(() => {
  fetchTableData();
});

async function fetchTableData(page) {
  const data = await getApprovalHistory({})
  try {
    state.loading = true;
    const pager = TableContainerRef.value.pager;
    const response = await getMessageList({
      currentPage: page || pager.page,
      size: pager.size,
      messageName: state.search.messageName,
      messageStatus: state.search.messageStatus,
    });
    const { records, current, size, total } = response;
    state.tableData = records;
    pager.size = size;
    pager.page = current;
    pager.total = total;
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

async function onStored(row) {
  try {
    state.loading = true;
    await messageStored(row.id);
    await fetchTableData();
    ElMessage.success('操作成功');
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

async function onRead(row) {
  try {
    state.loading = true;
    await messageUpdateReadStatus(row.id);
    await fetchTableData();
    ElMessage.success('操作成功');
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

function onSearch(reset) {
  if (reset) {
    state.search = {};
  }
  fetchTableData(1);
}

function onPageChange(page) {
  fetchTableData(page);
}

function onShowMessage(row) {
  MessageDialogRef.value.show(row);
}

async function onReadAll() {
  try {
    state.loading = true;
    const unreadMessageCount = await getUnreadCount();
    if (unreadMessageCount > 0) {
      await updateAllReadStatus();
      ElMessage.success('操作成功');
    } else {
      ElMessage.warning('无可操作的数据');
    }
    await fetchTableData();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}

async function onDelete(row) {
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
    await deleteMessage(row.id);
    ElMessage.success('操作成功');
    await fetchTableData();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}


// 审批中心
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
    console.error("未获取到主体信息");
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
</script>

<template>
  <ListContainer loading="state.loading" title="消息中心">
    <TableContainer ref="TableContainerRef" :showPagination="true" @search="onSearch" @page-change="onPageChange">
      <template #filter>
        <FilterItem>
          <el-input v-model.trim="state.search.messageName" placeholder="请输入消息名称"></el-input>
        </FilterItem>
        <FilterItem>
          <el-select v-model="state.search.messageStatus" placeholder="请选择消息状态">
            <el-option v-for="item in MessageStatus.options" :key="item.value" :value="item.value" :label="item.label">
            </el-option>
          </el-select>
        </FilterItem>
      </template>
      <div class="tool">
        <el-button type="primary" @click="onReadAll"> 一键已读</el-button>
      </div>
      <el-table :data="state.tableData">
        <el-table-column label="消息名称" min-width="160px" fixed>
          <template #default="{ row }">
            {{ row.messageName }}
            <el-badge v-if="MessageReadStatus.canRead(row.messageReadStatus)" is-dot class="dot-item"></el-badge>
          </template>
        </el-table-column>
        <el-table-column label="消息主题">
          <template #default="{ row }">
            {{ MessageTopic.getLabel(row.messageTopic || row.message_topic) }}
          </template>
        </el-table-column>
        <el-table-column label="消息类型">
          <template #default="{ row }">
            {{ MessageType.getLabel(row.messageType) }}
          </template>
        </el-table-column>
        <el-table-column label="消息状态" min-width="100px">
          <template #default="{ row }">
            {{ MessageStatus.getLabel(row.messageStatus) }}
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="消息内容" min-width="300px">
          <template #default="{ row }">
            <el-button type="text" @click="onShowMessage(row)">{{ row.messageContent }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="pubDeptManager" label="发送主体">
          <template #default="{ row }">
            {{ row.pubDeptManager }}
          </template>
        </el-table-column>
        <el-table-column prop="pubUser" label="发送人">
          <template #default="{ row }">
            {{ row.pubUser }}
          </template>
        </el-table-column>
        <el-table-column prop="subDeptManager" label="接收主体">
          <template #default="{ row }">
            {{ row.subDeptManager }}
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人"></el-table-column>
        <!-- <el-table-column prop="updatedUser" label="更新人">
          <template #default="{ row }">
            {{ row.usdateUser || row.usdate_user }}
          </template>
        </el-table-column> -->
        <el-table-column prop="createdTime" label="上传时间" min-width="180px">
          <template #default="{ row }">
            {{ row.createdTime }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedTime" label="更新时间" min-width="180px">
          <template #default="{ row }">
            {{ row.updatedTime }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注">
          <template #default="{ row }">{{ row.remarks || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="100px" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" v-if="row.messageName" :underline="false" :disabled="!(
              MessageStatus.canStored(row.messageStatus) &&
              row.subDept === selfSiteName
            )
              " @click="onStored(row)">
              同意
            </el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" v-if="row.messageName" :underline="false" @click="onDelete(row)">删除
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </TableContainer>
  </ListContainer>
  <AgreeDialog ref="AgreeDialogRef"></AgreeDialog>
  <MessageDialog ref="MessageDialogRef" source="message"></MessageDialog>
</template>

<style scoped>
.tool {
  text-align: right;
  margin: -20px auto 10px;
}
</style>
