<!--
 Author: YangWuLong
 Date: 2023.4
 点击作业详情跳转页面
 -->
<script setup>
import _ from 'lodash';
import {
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  defineEmits,
  computed,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { listJob, getJobDetail } from '@/apis/secretflow/secretflow.api.js';
// import { cancelCollect } from '../../../apis/workspace/model.api';
import TableContainer from '@/layouts/TableContainer.vue';
// import ModelCollect from './ModelCollect.vue';
import { CollectType, Status, JobType } from '@/utils/const';
import { formatDateTime, formatTimestamp, getTimeCost } from '@/utils';
import {
  getProjectById,
  getProjectJobList,
} from '../../apis/workspace/project.api';
import { downloadCsvData } from '../../apis/secretflowApi/secretflow.api';
import { downloadFile } from '../../utils';
import { dpProjectTasks05Form, dpProjectForm } from '../../apis/dp/api';

let jobStatusInterval;
let needRun = false;
const TableContainerRef = ref(null);
const ModelCollectRef = ref(null);
const router = useRouter();
const route = useRoute();
const props = defineProps({
  projectId: { type: String, required: true },
  projectName: { type: String, required: true },
});

const state = reactive({
  loading: false,
  tableData: [],
  search: {},
  info: {},
});
const graphId = computed(() => route.query.graphId);
const type = computed(() => route.query.type);
const dialogVisible = ref(false);
const nodesList = ref([]);
const param = reactive({
  jobId: '',
  taskId: '',
});

defineExpose({ fetchTableData });

watch(
  () => props.projectId,
  async () => {
    needRun = false;
    await fetchTableData(1);
  },
);

onBeforeUnmount(() => {
  clearJobStatusInterval;
});
onMounted(async () => {
  fetchTableData(1);
});

function clearJobStatusInterval () {
  if (jobStatusInterval) {
    clearInterval(jobStatusInterval);
  }
  jobStatusInterval = null;
}

function syncJobStatus (page) {
  if (jobStatusInterval) {
    return;
  }
  jobStatusInterval = setInterval(() => {
    fetchTableData(page);
  }, 3000);
}

async function fetchTableData (page) {
  try {
    if (type.value == '1' || type.value == '3' || props.projectId) {
      const res = await dpProjectTasks05Form({ id: props.projectId });
      const outterTask = JSON.parse(res.dpProjectTasks05.outterTaskId);

      const scretflowProjectId = outterTask.projectId;

      state.info.secretflowProjectId = scretflowProjectId;
      state.info.graphId = outterTask.graphId;
      state.loading = true;
      const pager = TableContainerRef.value?.pager;
      const currentPage = page || pager?.page;
      const response = await listJob({
        pageNum: currentPage,
        pageSize: pager.size,
        projectId: outterTask.projectId,
        graphId: outterTask.graphId,
      }); // const response = await getProjectJobList({ //     "pageRequest": { //         "pageNumber": currentPage, //         "pageSize": pager.size //     }, //     "requestData": { //         projectId: props.projectId //     } // } // );
      const { data, size, total } = response;
      state.tableData = data;
      console.log(state.tableData, 'records');
      pager.size = size;
      pager.total = total;
      needRun = state?.tableData.some((item) => {
        return Status.isRunning(item.status.toLowerCase());
      });
      if (needRun) {
        syncJobStatus();
      } else {
        clearJobStatusInterval();
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

async function onPageChange (page) {
  await fetchTableData(page);
}

function onUpdateDataTable () {
  fetchTableData(1);
}
const emits = defineEmits(['JobDetail']);
async function toDetail (row) {
  console.log(row);
  // 跳转到 算子详情页面
  // const url = `/secretpad-ui/#/record?projectId=${state.info.secretflowProjectId}&mode=MPC&dagId=${state.info.graphId}&jobId=${row.jobId}`;
  // const url = `/secretpad-ui/#/dag?projectId=${state.info.secretflowProjectId}&mode=MPC&dagId=${state.info.graphId}&jobId=${row.jobId}`;
  // const url = `/secretpad-ui/#/record?projectId=${state.info.secretflowProjectId}&mode=MPC&dagId=${row.jobId}`;
  // 判断是否有secretflow相关的凭证，没有的话就重新获取
  if (
    !localStorage.getItem('User-Token') ||
    !localStorage.getItem('secretflowUserInfo') ||
    !localStorage.getItem('neverLogined')
  ) {
    const secretflowInfo = await getSecretflowInfo();
    const data = await secretflowLogin({
      name: secretflowInfo.username,
      passwordHash: secretflowInfo.password,
    });
    localStorage.setItem('User-Token', data.token);
    localStorage.setItem('secretflowUserInfo', JSON.stringify(data));
    localStorage.setItem('neverLogined', true);
  }
  console.log(state.info, 'STATE.INFO');
  // 判断是否有secretflow相关的凭证，有的话就登陆
  if (
    localStorage.getItem('User-Token') &&
    localStorage.getItem('secretflowUserInfo') &&
    localStorage.getItem('neverLogined')
  ) {
    const url = `/secretpad-ui/#/record?projectId=${state.info.secretflowProjectId}&mode=MPC&dagId=${state.info.graphId}&jobId=${row.jobId}`;
    // 给父组件传值
    emits('JobDetail', [url, false]);
  }
  // emits('JobDetail', [url, false]);
}

// async function onCancelCollect(row) {
//     if (CollectType.canCollect(row.isCollected)) {
//         ModelCollectRef.value.show(row, props.projectName);
//         return;
//     }
//     try {
//         state.loading = true;
//         await cancelCollect(row.fJobId);
//         ElMessage.success('取消收藏成功');
//         onUpdateDataTable();
//     } catch (error) {
//         console.error(error);
//         ElMessage.error('取消收藏失败');
//     } finally {
//         state.loading = false;
//     }
// }

function onCollected (row) {
  ModelCollectRef.value.show(row.fJobId, props.projectName);
}

// async function onChangeCollect(row) {
//   if (!CollectType.canCollect(row.isCollected)) {
//     onCollected(row);
//     onUpdateDataTable();
//     return;
//   }
//   try {
//     state.loading = true;
//     await cancelCollect(row.fJobId);
//     ElMessage.success('取消收藏成功');
//     onUpdateDataTable();
//   } catch (error) {
//     console.error(error);
//     ElMessage.error('取消收藏失败');
//   } finally {
//     state.loading = false;
//   }
// }

function downloadResult (jobId) {
  window.open(
    `/manager-api/api/project-job/downloadJobOutputByIdAndOpt/${jobId}/xgb_predict`,
  );
}

async function openDownloadDialog (row) {
  const data = await getJobDetail({
    projectId: state.info.secretflowProjectId,
    jobId: row.jobId,
  });
  nodesList.value = data.graph.nodes;
  param.jobId = row.jobId;
  param.projectId = state.info.secretflowProjectId;

  // console.log(state.info)
  dialogVisible.value = true;
}

async function downloadAlgCsvData () {
  // param.taskId = `${param.taskId}-output-0`
  const data = await downloadCsvData(param);
  let fileName = `${param.taskId}.csv`;

  // 创建一个 Blob 对象
  const blob = new Blob([data], { type: 'application/octet-stream' });
  // 创建一个 URL 对象
  const url = URL.createObjectURL(blob);
  // 创建一个临时的链接元素
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName; // 设置下载文件的名称

  // 触发点击事件以下载文件
  document.body.appendChild(a);
  a.click();

  // 清理
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // 释放 URL 对象
  ElMessage({
    message: '下载成功',
    type: 'success',
  });
  dialogVisible.value = false;
}
</script>

<template>
  <TableContainer ref="TableContainerRef"
                  :showFilter="false"
                  @page-change="onPageChange">
    <el-table v-loading="state.loading"
              :data="state.tableData">
      <el-table-column label="作业ID"
                       fixed
                       show-overflow-tooltip
                       min-width="200px">
        <template #default="{ row }">
           <span>{{ row.jobId }}</span>
          <!-- <el-link type="primary" :disabled="!row.status || row.status === Status.WAITING" -->
          <!-- {{ row.platform == 3 ? row.jobId : '' }}
          <el-link
            type="primary"
            @click="toDetail(row)"
            v-show="!(row.platform == 3)"
            >{{ row.jobId }}
          </el-link> -->
        </template>
      </el-table-column>
      <el-table-column label="开始时间"
                       min-width="170px">
        <template #default="{ row }">
          {{ formatDateTime(row.gmtCreate) }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间"
                       min-width="170px">
        <template #default="{ row }">
          {{ formatDateTime(row.gmtFinished) }}
        </template>
      </el-table-column>
      <el-table-column prop="fEndTime"
                       label="耗时">
        <template #default="{ row }">
          {{
            row.gmtFinished ? getTimeCost(row.gmtCreate, row.gmtFinished) : ''
          }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="jobType" label="作业类型">
                <template #default="{ row }">{{ JobType.getLabel(row.jobType) }}
                </template>
            </el-table-column> -->
      <el-table-column prop="fStatus"
                       fixed="right"
                       label="状态">
        <template #default="{ row }">{{ Status.getLabel(row.status.toLowerCase()) }}
        </template>
      </el-table-column>
      <el-table-column prop="fStatus"
                       fixed="right"
                       label="操作"
                       v-if="route.query.type == '3'">
        <template #default="{ row }"><el-button type="text"
                     @click="downloadResult(row.jobId)">下载结果</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="fStatus"
                       fixed="right"
                       label="操作"
                       v-if="route.query.type == '1'">
        <template #default="{ row }"><el-button type="text"
                     @click="openDownloadDialog(row)">下载结果</el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column header-align="center" align="center" label="操作" fixed="right" min-width="130px">
                <template #default="{ row }">
                    <el-link v-if="CollectType.canCollect(row.isCollected)" type="primary" :underline="false"
                        @click="onCollected(row)">
                        收藏
                    </el-link>
                    <el-link v-else type="primary" :underline="false" @click="onCancelCollect(row)">
                        取消收藏
                    </el-link>
                </template>
            </el-table-column> -->
    </el-table>
  </TableContainer>
  <el-dialog v-model="dialogVisible"
             title="结果下载"
             width="500px">
    <el-select v-model="param.taskId"
               placeholder="选择要下载的算子"
               style="width: 240px">
      <el-option v-for="item in nodesList"
                 :key="item.id"
                 :label="item.label"
                 :value="item.graphNodeId" />
    </el-select>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="downloadAlgCsvData"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- <ModelCollect ref="ModelCollectRef" @done="onUpdateDataTable()" /> -->
</template>

<style></style>
