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
import { modifyDataStructure, convertDownDataSource, getFullCsvDataForSample, getFullCsvDataForStatsPSI } from '@/utils/secretflowUtils.js'
import { formatDateTime, formatTimestamp, getTimeCost, exportCsv } from '@/utils';
import {
  getProjectById,
  getProjectJobList,
} from '../../apis/workspace/project.api';
import { downloadCsvData } from '../../apis/secretflowApi/secretflow.api';
import { downloadResultData, getResultTableData } from '@/apis/secretflow/secretflow.api'
import { downloadFile } from '../../utils';
import { dpProjectTasks05Form, dpProjectForm } from '../../apis/dp/api';
const STATS_PSI = 'stats/stats_psi';
const SAMPLE = 'data_filter/sample';
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
  let resultList = []
  data.graph.nodes.forEach(item => {
    if (item.results && item.status == 'SUCCEED') {
      item.results.forEach(it => {
        resultList.push({
          value: it.refId,
          key: it.refId,
          label: `${item.label}_${it.kind == 'Report' ? '报告' : '数据'}`,
          codeName: item.codeName,
          graphNodeId: item.graphNodeId,
          taskId: item.taskId,
          type: it.kind == 'Report' ? 1 : 2
        })
      })
    }
  })
  nodesList.value = resultList;
  param.jobId = row.jobId;
  param.projectId = state.info.secretflowProjectId;
  console.log({ nodesList })
  // console.log(state.info)
  dialogVisible.value = true;
}
const csvHandler = async (codeName, graphNodeId) => {
  let outputId = param.taskId.replace(`${param.jobId}-`, '')
  const res = await getResultTableData({ jobId: param.jobId, projectId: param.projectId, taskId: `${param.jobId}-${graphNodeId}`, outputId })
  console.log({ res })
  let allTableInfo = res.tabs
  let tableInfo = modifyDataStructure(res.tabs[0], codeName)
  console.log({ tableInfo })
  let columnsList = [];
  tableInfo.schema.forEach(({ name, type }) => {
    if (name !== 'name') {
      columnsList.push({
        key: name,
        title: name,
        dataIndex: name,

        showSorterTooltip: false,

      });
    } else {
      columnsList.push({
        key: name,
        title: name,
        dataIndex: name,
        showSorterTooltip: false,

      });
    }
  });
  let datasource = ((tableInfo?.records) || []).map(
    (record, index) => {
      const res = {
        key: index,
      };
      columnsList.forEach((col, i) => {
        if (typeof record[i] === 'string') {
          // 防止导出时候值也会进行逗号分割
          res[col.dataIndex] = (record[i]).replace(/"/g, '');
        } else {
          res[col.dataIndex] = record[i];
        }
      });
      return res;
    },
  );
  console.log({ datasource })
  let csvData;
  if (tableInfo.type === "descriptions") {
    console.log({ codeName })
    let fullCavData
    if (codeName && codeName === SAMPLE) {
      fullCavData = getFullCsvDataForSample(tableInfo.records);
    }
    csvData = tableInfo.records || fullCavData
  } else if (codeName && codeName === STATS_PSI && allTableInfo) {
    console.log('进来', { codeName });
    csvData = getFullCsvDataForStatsPSI(allTableInfo);
  } else {
    console.log('这边', { codeName });
    csvData = convertDownDataSource(datasource);
  }
  console.log({ csvData })
  exportCsv(csvData, `${param.taskId}`)
}
const apiDownLoad = async () => {
  fetch(`/secretflow-api/proxy/secretPad/api/v1alpha1/data/download`, {
    method: 'POST',
    headers: { "Content-Type": "application/json", "Authorization": localStorage.getItem('token') },
    body: JSON.stringify({
      nodeId: 'test1',
      domainDataId: param.taskId,
    }),
  }).then((res) => {
    res.blob().then((blob) => {
      const data = new Blob(['\ufeff', blob], { type: 'text/plain;charset=utf-8' });

      const disposition = res.headers.get('Content-Disposition');
      console.log({ disposition, blob })
      let filename = ``;
      const filenameRegex = /filename[^;=\n]*=[^'"]*['"]*((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition || '');
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
      const a = document.createElement('a');
      document.body.appendChild(a); //兼容火狐，将a标签添加到body当中
      const url = window.URL.createObjectURL(data); // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
      a.href = url;
      a.download = filename;
      a.click();
      a.remove(); //移除a标签
      window.URL.revokeObjectURL(url);
      ElMessage({
        message: '下载成功',
        type: 'success',
      });
      dialogVisible.value = false;
    })
  })
}
async function downloadAlgCsvData () {
  let { codeName, graphNodeId, type } = nodesList.value.find(item => item.value == param.taskId) || {}
  if (type == 1) {
    await csvHandler(codeName, graphNodeId)
  } else {
    await apiDownLoad()
  }


}
async function downloadAlgCsvData1 () {
  console.log(4444, { param })
  let domainDataId = `${param.jobId}-${param.taskId}-output-0`
  const data = await downloadResultData({ domainDataId, nodeId: 'test1' })
  console.log(333, { data, param })
  // const data = await downloadCsvData(param);
  let fileName = `${param.taskId}.csv`;
  let filename = '';
  const filenameRegex = /filename[^;=\n]*=[^'"]*['"]*((['"]).*?\2|[^;\n]*)/;
  // const matches = filenameRegex.exec(disposition || '');
  // if (matches != null && matches[1]) {
  //   filename = matches[1].replace(/['"]/g, '');
  // }
  // 创建一个 Blob 对象
  const blob = new Blob(['\ufeff', data], { type: 'text/plain;charset=utf-8' });
  // const blob = new Blob([data], { type: 'application/octet-stream' });
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
                 :key="item.key"
                 :label="item.label"
                 :value="item.value" />
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
