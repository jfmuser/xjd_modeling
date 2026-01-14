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
  getCurrentInstance
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getProjectJobList } from '../../../apis/workspace/project.api';
import { getFateJobList } from '@/apis/innovate/innovate.api';
import { cancelCollect } from '../../../apis/workspace/model.api';
import TableContainer from '../../../layouts/TableContainer.vue';
import ModelCollect from './ModelCollect.vue';
import { CollectType, Status, JobType } from '../../../utils/const';
import { formatDateTime, formatSeconds } from '../../../utils';
import useSiteStore from '../../../stores/dept/site.store';
import { security, fblogin } from '../../../apis/workspace/job.api';
import { getBoardInfo } from '../../../apis/innovate/innovate.api.js';
import AES from '../../../utils/aesCrypto';
import rsa from '../../../utils/encrypt';
import useEnv from '@/hooks/useEnv.js';
import { queryFateData, collectFate, deleteModel } from '@/apis/prjModel/api';
let jobStatusInterval;
let needRun = false;
const { VITE_GLOB_XJ_PASSWORD, VITE_GLOB_FATEBOARD_UI_URL } = useEnv()
const siteStore = useSiteStore()
const TableContainerRef = ref(null);
const ModelCollectRef = ref(null);
const router = useRouter();
const route = useRoute()
const { appContext } = getCurrentInstance();
const indexedDB = appContext.config.globalProperties.$indexedDB;
const props = defineProps({
  projectId: { type: String, required: true },
  projectName: { type: String, required: true },
});
const type = computed(() => route.query.type)
const state = reactive({
  loading: false,
  tableData: [],
  search: {},
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
    if (!props.projectId) return
    state.loading = true;
    const pager = TableContainerRef.value.pager;
    const currentPage = page || pager.page;
    // let project = await indexedDB.get(route.query.id)
    const response = await queryFateData({ projectId: props.projectId })
    // console.log({ project, indexedDB })
    // let ids = project?.jobIds || []
    if (response.code != 0) {
      return
    }
    let jobMap = new Map()
    let ids = response.data.map(item => {
      jobMap.set(item.jobId, item)
      return item.jobId
    });
    const res = await getFateJobList({ ids })
    console.log({ res, ids })
    // const response = await getProjectJobList({
    //   "pageRequest": {
    //     "pageNumber": currentPage,
    //     "pageSize": pager.size
    //   },
    //   "requestData": {
    //     projectId: props.projectId
    //   }
    // },
    // );
    // const { records, current, size, total } = response;
    state.tableData = res?.data?.slice((currentPage - 1) * 10, currentPage * 10).map(item => {
      const originData = jobMap.get(item.jobId)
      return { ...item, ...originData }
    }) || [];
    console.log({ tableData: state.tableData })
    pager.size = 10;//size;
    pager.page = currentPage;
    pager.total = ids?.length || 0 //total;
    needRun = state?.tableData?.some?.((item) => {
      return Status.isRunning(item.status);
    });

    if (needRun) {
      syncJobStatus();
    } else {
      clearJobStatusInterval();
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
async function toDetail ({ jobId, fRole, fPartyId }) {
  // console.log({
  //   fJobId, fRole, fPartyId, projectId: props.projectId,
  //   projectName: props.projectName
  // }, '1111111111111111');
  // fJobId:当前作业的id   fPartyId:当前用户的身份id   fRole:当前用户的角色   projectName：项目名称   projectId:对应的生成的JSON文件的id
  // router.push({
  //   name: 'jobDetail',
  //   query: {
  //     jobId: fJobId,
  //     role: fRole,
  //     partyId: fPartyId,
  //     projectId: props.projectId,
  //     projectName: props.projectName,
  //   },
  // });
  const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))
  const partyId = JSON.parse(siteStore.mySite.tDomainEngineList.find(engine => engine.engine == '0')?.engineInfo ?? "{}").partyId
  //判断有没有登录凭证，没有的话就获取登录凭证
  if (!localStorage.getItem('CurrentUser')) {

    //   getkey fb 获取密钥对密码加密
    const securityInfo = await security();
    let securityData = '';
    if (securityInfo && securityInfo.data) {
      securityData = securityInfo.data;
    }
    // 获取系统登录信息
    const getInfo = await getBoardInfo();
    const password = rsa(securityData, AES.decrypt(getInfo.password));
    // fb login 再次登录设置cookie
    await fblogin(AES.decrypt(getInfo.username), password);
    localStorage.setItem('CurrentUser', getInfo.username)
  }
  //判断有没有登录凭证，有的话就跳转
  if (localStorage.getItem('CurrentUser')) {
    const prefix = import.meta.env.DEV ? VITE_GLOB_FATEBOARD_UI_URL : ''
    // 跳转到fateBoard 算子详情页面
    const url = `${prefix}/fateboard-ui/#/details?job_id=${jobId}&role=guest&party_id=${partyId}&from=Job%20overview&projectId=${props.projectId}&projectName=${props.projectName}`;
    emits('JobDetail', [url, false]);
  }
  // const url = `http://localhost:8082/#/details?job_id=${fJobId}&role=${fRole}&party_id=${fPartyId}&from=Job%20overview&projectId=${props.projectId}`;
  // 给父组件传值
}

async function onCancelCollect (row) {
  if (row.modelId) {
    ModelCollectRef.value.show(row.jobId, row.projectId, props.projectName);
    return;
  }
  try {
    state.loading = true;
    await cancelCollect(row.jobId);
    ElMessage.success('取消收藏成功');
    onUpdateDataTable();
  } catch (error) {
    console.error(error);
    ElMessage.error('取消收藏失败');
  } finally {
    state.loading = false;
  }
}

function onCollected (row) {
  ModelCollectRef.value.show(row.jobId, row.projectId, props.projectName);
}

function getFrole (fRole) {
  if (fRole === 'guest') {
    return '业务方'
  } else if (fRole === 'host') {
    return '数据方'
  } else if (fRole === 'arbiter') {
    return '聚合方'
  }
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
onBeforeUnmount(() => {
  clearInterval(jobStatusInterval);
})
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
          {{ row.platform == 4 ? row.jobId : '' }}
          <el-link type="primary"
                   :disabled="!row.status || row.status === Status.WAITING"
                   v-show="!(row.platform == 4)"
                   @click="toDetail(row)">{{
            row.jobId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="开始时间"
                       min-width="170px">
        <template #default="{ row }">
          {{ row.startDate||row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间"
                       min-width="170px">
        <template #default="{ row }">
          {{ row.endDate }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="fEndTime" label="耗时">
        <template #default="{ row }">
          {{ formatSeconds(row.createdTime - row.endDate) }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="jobType" label="作业类型">
        <template #default="{ row }">{{ JobType.getLabel(row.jobType) }}
        </template>
      </el-table-column> -->
      <el-table-column prop="status"
                       fixed="right"
                       label="状态">
        <template #default="{ row }">{{ Status.getLabel(row.status) }}
        </template>
      </el-table-column>
      <!-- <el-table-column-->
      <!--        header-align='center'-->
      <!--        align='center'-->
      <!--        label='收藏'-->
      <!--        fixed='right'-->
      <!--        min-width='130px'>-->
      <!--        <template #default='{ row }'>-->
      <!--          <el-switch v-model='row.isCollected' :active-value='1' :inactive-value='0' @click='onChangeCollect(row)' />-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column header-align="center"
                       align="center"
                       label="操作"
                       fixed="right"
                       min-width="130px">
        <template #default="{ row }">
          <!-- <el-link v-if="CollectType.canCollect(row.collect)"
                   type="primary"
                   :underline="false"
                   @click="onCollected(row)">
            收藏
          </el-link>
          <el-link v-else
                   type="primary"
                   :underline="false"
                   @click="onCancelCollect(row)">
            取消收藏
          </el-link> -->
          <div v-if="row.status ==Status.SUCCEED">
            <el-button v-if="!row.modelId"
                       type="text"
                       @click="onCollected(row)">收藏</el-button>
            <el-button v-else
                       type="text"
                       @click="onCancelCollect(row)">取消收藏</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </TableContainer>
  <ModelCollect ref="ModelCollectRef"
                @done="onUpdateDataTable()" />
</template>

<style></style>
