<!-- Author: SDY
 Date: 2023.10
 作业详情页面 -->

<script setup>
import _ from 'lodash';
import { useRoute, useRouter } from 'vue-router';
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
  defineEmits,
  onBeforeMount,
} from 'vue';
import ListContainer from '@/layouts/ListContainer.vue';
import ListContainerItem from '@/layouts/ListContainerItem.vue';
import { FormType, SourceType } from '@/utils/const';
import SecretflowJobTable from '@/components/secretflow/SecretflowJobTable.vue';
import SecretflowProjectForm from '@/components/secretflow/SecretflowProjectForm.vue';
import { ElMessage } from 'element-plus';
import {
  listGraph,
  getGraphDetail,
  startGraph,
  getProject,
} from '@/apis/secretflow/secretflow.api.js';
import { getProjectById, createJob } from '../../apis/workspace/project.api';
import { dpProjectTasks05Form, refreshDatas } from '../../apis/dp/api';

import useSecretflowStore from '@/stores/secretflow/secretflowInfo.store.js';
import useSiteStore from '../../stores/dept/site.store';

const router = useRouter();
const route = useRoute();
const siteStore = useSiteStore();
const secretflowStore = useSecretflowStore();
const ProjectFormRef = ref(null);
const ScretflowJobTableRef = ref(null);
const graphInfo = ref('');
const scretflowProject = ref(null);
const state = reactive({
  loading: false,
  model: {},
  search: {},
  tableData: [],
  partyId: '',
  role: '',
});
onBeforeMount(async () => {
  // getSiteInfo();
  await fetchData();
});

const projectName = computed(() => route.query.projectName);
const projectId = computed(() => route.query.id);
const type = computed(() => route.query.type);
const graphId = ref('');
const action = computed(() => route.query.action);
const projectDetail = ref('');

watch(
  () => projectName.value,
  () => {
    fetchData();
  },
  {
    immediate: true,
  },
);

async function fetchData() {
  try {
    state.loading = true;
    if (projectId.value && type.value == '1') {
      const nodeTag = [];

      if (!projectId.value) return;
      const res = await dpProjectTasks05Form({ id: projectId.value });
      const outterTask = JSON.parse(res.dpProjectTasks05.outterTaskId);

      const scretflowProjectId = outterTask.projectId;
      const currentProject = await getProject({
        projectId: scretflowProjectId,
      });

      currentProject?.nodes.forEach((item) => {
        // item.nodeName
        siteStore.otherSite.forEach((site) => {
          if (
            site.tDomainEngineList &&
            site.tDomainEngineList.find((engine) => engine.engine == '1')
          ) {
            const secretflowInfo = JSON.parse(
              site.tDomainEngineList.find((engine) => engine.engine == '1')
                .engineInfo,
            );
            if (secretflowInfo.nodeId === item.nodeId) {
              nodeTag.push(site.name);
            }
          }
        });
      });
      console.log(nodeTag, 'NODETAG');
      const data = await listGraph({ projectId: scretflowProjectId });

      scretflowProject.value = currentProject;
      graphId.value = data[0]?.graphId;
      graphInfo.value = await getGraphDetail({
        projectId: scretflowProjectId,
        graphId: graphId.value,
      });
      state.model = {
        projectName: projectName.value,
        nodeTag,
        projectId: scretflowProjectId,
        graphId: graphId.value,
      };
    } else if (projectId.value && type.value == '3') {
      if (!projectId.value) return;
      projectDetail.value = await getProjectById(projectId.value);
      state.model = projectDetail.value;
      state.model.nodeTag = [];
      const participants = JSON.parse(projectDetail.value.participants);
      siteStore.otherSite.forEach((item) => {
        if (participants.includes(item.id)) {
          state.model.nodeTag.push(item.name);
        }
      });
    }
  } finally {
    state.loading = false;
  }
}

async function onSaveProjectBaseInfo() {
  if (projectId.value && type.value == '1') {
    if (!secretflowStore.secretflowSuccess) return;
    const paramObj = {};
    graphInfo.value.nodes.forEach((node) => {
      if (node.nodeDef.attrs) {
        const label = node.label;
        paramObj[label] = [...node.nodeDef.attrs];
      }
    });

    localStorage.setItem('projectInfo', JSON.stringify(state.model));
    localStorage.setItem('projectParams', JSON.stringify(paramObj));
    localStorage.setItem('graphInfo', JSON.stringify(graphInfo.value));
  } else if (projectId.value && type.value == '3') {
    const graphInfo = {
      projectJson: {},
      algorithmParams: {},
      dependencyData: {},
      selectedAlgorithm: {},
    };
    localStorage.setItem('projectInfo', JSON.stringify(state.model));

    localStorage.setItem('graphInfo', JSON.stringify(graphInfo));
  }
  await router.push({
    name: route.name,
    query: {
      edit: true,
      projectName: state.model.projectName,
      projectId: projectId.value,
      graphId: graphId.value,
      // core: '1',
      // type:'1'
      core: type.value,
      type: type.value,
    },
  });
}

async function onRun() {
  try {
    state.loading = true;
    // const nodes = graphInfo.value.nodes.map(node => node.graphNodeId)
    if (scretflowProject.value) {
      await refreshDatas(
        scretflowProject.value.nodes
          .filter((item) => item.datatables !== null)
          .map((item) => {
            return {
              domainId: item.nodeId,
              datalds: item.datatables.map((db) => db.datatableId),
            };
          }),
      );
    }

    const response = await startGraph({
      graphId: graphId.value,
      projectId: state.model.projectId,
      nodes: graphInfo.value.nodes.map((item) => item.graphNodeId),
    });
    ElMessage.success('操作成功');
    ScretflowJobTableRef.value.fetchTableData(1);
  } catch (error) {
    ElMessage.error(error);
  } finally {
    state.loading = false;
  }
}

function onCancel() {
  ProjectFormRef.value.cancel();
}

function onEdit() {
  router.push({
    name: route.name,
    query: {
      projectName: state.model.projectName,
      id: projectId.value,
      action: FormType.EDIT,
      type: type.value,
    },
  });
}
const emits = defineEmits(['ProjectDetail']);

// 接收第一次子组件传值 需要继续传值
const handelJobDetail = (val) => {
  // console.log('第一次接收值', val);
  emits('ProjectDetail', val);
};
</script>

<template>
  <ListContainer v-loading="state.loading" title="项目详情">
    <template #header-tool>
      <el-button type="text" @click="onRun" v-permission="'start'">
        <el-icon><img src="../../assets/workspace/play.svg" alt="" /></el-icon>
        运行
      </el-button>
    </template>
    <ListContainerItem title="基本信息">
      <template #header-tool>
        <template v-if="FormType.EDIT === action">
          <el-button type="text" @click="onSaveProjectBaseInfo"
            >下一步
          </el-button>
          <el-button type="text" @click="onCancel">取消</el-button>
        </template>
        <template v-else-if="FormType.READ === action">
          <el-button type="text" @click="onEdit" v-permission="'edit'">
            <el-icon>
              <Edit />
            </el-icon>
            编辑
          </el-button>
        </template>
      </template>
      <SecretflowProjectForm
        ref="ProjectFormRef"
        :defaultModel="state.model"
        :formType="action"
      />
    </ListContainerItem>
    <ListContainerItem title="作业概览">
      <SecretflowJobTable
        ref="ScretflowJobTableRef"
        :projectId="projectId"
        :projectName="projectName"
        @JobDetail="handelJobDetail"
      />
    </ListContainerItem>
  </ListContainer>
</template>

<style scoped></style>
