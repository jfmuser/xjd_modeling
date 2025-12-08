<script setup>
import { computed, reactive, onMounted, watch, ref, nextTick, defineEmits } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  findModelInfo,
  getDeployModels,
} from '../../apis/workspace/model.api';
import { deployModel, getAuthData } from '../../apis/manager/managerApi'
import { Status } from '../../utils/const';
import ListContainer from '../../layouts/ListContainer.vue';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import TableContainer from '../../layouts/TableContainer.vue';
import OnlineReasoningDialog from '../../components/workspace/OnlineReasoningDialog.vue';
import OfflineReasoningDialog from '../../components/workspace/OfflineReasoningDialog.vue';
import { ElMessage } from 'element-plus';


const router = useRouter();
const route = useRoute();
const modelId = computed(() => route.query.modelId);
const modelVersion = computed(() => route.query.modelVersion);
const modelName = computed(() => route.query.modelName);
const TableContainerRef = ref(null);
const state = reactive({
  loading: false,
  model: {},
  tableDate: [],
  search: {},
  authDataList: []
});
const OnlineReasoningDialogRef = ref(null);
const OfflineReasoningDialogRef = ref(null);


watch(
  () => modelId.value,
  async () => {
    findModel(modelId.value);
    await nextTick();
    fetchTableData(1);
    getProjectAuthData();
  },
  { immediate: true },
);

onMounted(() => {
  findModel(modelId.value);
  fetchTableData(1);
  getProjectAuthData();
});

async function findModel (modelId) {
  try {
    state.loading = true;
    if (modelId) {
      state.model = await findModelInfo(modelId);
    }
  } finally {
    state.loading = false;
  }
}
function afterDeployModelDialog () {
  findModel(modelId.value);
  fetchTableData(1);
}

async function onDeploy () {
  try {
    state.loading = true;
    await deployModel({ ...state.model, serviceId: state.model.modelName });
    ElMessage.success('部署成功');
    afterDeployModelDialog();
  } catch (e) {
    console.error(e);
    ElMessage.error(e || '部署失败');
  } finally {
    state.loading = false;
  }
}

function onRun (val) {
  OnlineReasoningDialogRef.value.show(val);
}

function onStart (val) {
  OfflineReasoningDialogRef.value.show(val);
}

async function fetchTableData (page) {
  try {
    state.loading = true;
    if (modelVersion.value) {
      const pager = TableContainerRef.value.pager;
      const currentPage = page || pager.page;
      const response = await getDeployModels(
        route.query.modelId,
        currentPage,
        pager.size,
      );
      const { records, current, size, total } = response;
      state.tableData = records;
      pager.size = size;
      pager.page = current;
      pager.total = total;
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}
const emits = defineEmits(['JobDetail']);
function toDetail ({ jobId, fRole, fPartyId, projectId }) {
  // router.push({
  //   name: 'jobDetail',
  //   query: {
  //     jobId: fJobId,
  //     role: fRole,
  //     partyId: fPartyId,
  //     modelId: modelId.value,
  //     modelName: modelName.value,
  //     modelVersion: modelVersion.value,
  //   },
  // });
  const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))
  const partyId = JSON.parse(selfParties.tDomainEngineList.find(engine => engine.engine == '0')?.engineInfo ?? "{}").partyId

  const url = `/fateboard-ui/#/details?job_id=${jobId}&role=guest&party_id=${partyId}&from=Job%20overview&projectId=${route.query.projectId}&projectName=${route.query.projectName}`;
  // 给父组件传值
  emits('JobDetail', [url, false]);
}

function onPageChange (page) {
  fetchTableData(page);
}


/**
 * @description 获取项目授权的数据
*/
async function getProjectAuthData () {
  state.authDataList = await getAuthData(route.query.projectId)

}

</script>

<template>
  <ListContainer v-loading="state.loading"
                 title="模型推理记录">
    <div class="div-right">
      <el-button style="width: 90px; height: 30px"
                 @click="onDeploy(state.model)"
                 v-permission="'inference'">
        模型部署
      </el-button>
      <el-button style="width: 90px; height: 30px"
                 @click="onRun(state.model)">
        在线推理
      </el-button>
      <el-button style="width: 90px; height: 30px"
                 @click="onStart(state.model)"
                 v-permission="'deploy'">
        离线推理
      </el-button>
    </div>
    <ListContainerItem title="基本信息"
                       style="margin-top: 25px">
      <el-form ref="ModelInfoRef"
               :inline="true"
               label-width="80px">
        <el-form-item label="模型名称">
          <el-input v-model="state.model.modelName"
                    disabled />
        </el-form-item>
        <el-form-item label="模型版本">
          <el-input v-model="state.model.modelVersion"
                    disabled />
        </el-form-item>
        <el-form-item label="作业ID">
          <el-input v-model="state.model.jobId"
                    disabled />
        </el-form-item>
        <el-form-item label="收藏时间">
          <el-input v-model="state.model.createdTime"
                    disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input v-model="state.model.updatedTime"
                    disabled />
        </el-form-item>
        <el-form-item label="收藏人">
          <el-input v-model="state.model.creator"
                    disabled />
        </el-form-item>
        <el-form-item label="服务标识">
          <el-input v-model="state.model.serviceId"
                    disabled />
        </el-form-item>
        <el-form-item label="部署后模型版本">
          <el-input v-model="state.model.deployedModelVersion"
                    disabled />
        </el-form-item>
        <el-form-item label="备注"
                      class="entire-line">
          <el-input v-model="state.model.remarks"
                    type="textarea"
                    disabled />
        </el-form-item>
      </el-form>
    </ListContainerItem>
    <ListContainerItem title="离线推理记录">
      <TableContainer ref="TableContainerRef"
                      :show-filter="false"
                      @page-change="onPageChange">
        <el-table :data="state.tableData">
          <el-table-column label="作业ID"
                           min-width="200px"
                           fixed>
            <template #default="{ row }">
              <el-link type="primary"
                       @click="toDetail(row)">{{ row.jobId }}
              </el-link>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="modelVersion" label="部署后模型版本" min-width="200px"></el-table-column> -->
          <el-table-column prop="startTime"
                           label="开始时间"
                           min-width="180px"></el-table-column>
          <el-table-column prop="endTime"
                           label="结束时间"
                           min-width="180px"></el-table-column>
          <el-table-column prop="fStatus"
                           label="运行状态"
                           min-width="100px">
            <template #default="{ row }">{{
              Status.getLabel(row.status)
            }}</template>
          </el-table-column>
        </el-table>
      </TableContainer>
    </ListContainerItem>
    <OnlineReasoningDialog :authDataList="state.authDataList"
                           ref="OnlineReasoningDialogRef"></OnlineReasoningDialog>
    <OfflineReasoningDialog :hostNamespace="state.authDataList"
                            ref="OfflineReasoningDialogRef"
                            @doAfter="afterDeployModelDialog"></OfflineReasoningDialog>
  </ListContainer>
</template>
<style scoped>
.div-right {
  float: right;
  width: 300px;
  height: 25px;
}
</style>
