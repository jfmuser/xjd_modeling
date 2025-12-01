<!--
 Author: YangWuLong
 Date: 2023.4
 作业详情页面
 -->
<script setup>
import _ from 'lodash';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, watch, defineEmits } from 'vue';
import ListContainer from '../../../layouts/ListContainer.vue';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import { FormType, LOG_DEAL_STATUS, SourceType } from '../../../utils/const';
import JobTable from './JobTable.vue';
import ProjectForm from './ProjectForm.vue';
import { ElMessage, ElSelect } from 'element-plus';
import useConfigStore from '../../../stores/workspace/config.store';
import {
  getProjectById,
  createJob,
  updateProject,
} from '../../../apis/workspace/project.api';


import { formattedFormResult } from '../../../views/workspace/project/algorithmUtil';
import { getOperator } from '../../../apis/manager/managerApi';
import useSiteStore from '../../../stores/dept/site.store';
import { getAuthData } from '../../../apis/manager/managerApi';
import { dpProjectTasks05Form, refreshDatas, dpProjectForm } from '../../../apis/dp/api'

const router = useRouter();
const route = useRoute();
const ProjectFormRef = ref(null);
const JobTableRef = ref(null);
const siteStore = useSiteStore();
const state = reactive({
  loading: false,
  model: {},
  search: {},
  tableData: [],
  partyId: '',
  role: '',
  projectDetail: {},
  authData: '',
});
const authDataList = ref([]);
const dialogVisible = ref(false);
const formInline = reactive({
  realPath: '',
  party1: '',
  party2: '',
});

onMounted(() => {
  getSiteInfo();
  // fetchData();
});

const projectName = computed(() => route.query.projectName);
const projectId = computed(() => route.query.id);
const type = computed(() => route.query.type);
const action = computed(() => route.query.action);
const configInfo = useConfigStore().configInfo;
watch(
  () => projectName.value,
  () => {
    fetchData();
  },
  {
    immediate: true,
  },
);

function getSiteInfo () {
  if (
    siteStore.mySite.tDomainEngineList &&
    siteStore.mySite.tDomainEngineList.some((item) => item.engine == '0')
  ) {
    state.partyId = JSON.parse(
      siteStore.mySite.tDomainEngineList.find((item) => item.engine == '0')
        .engineInfo ?? '{}',
    )?.partyId;
  }
}

async function fetchData () {
  try {
    state.loading = true;
    if (projectId.value && type.value != '1') {
      const res = await dpProjectTasks05Form({ id: projectId.value });
      const { taskName, prjId, outterTaskId = '{}' } = res.dpProjectTasks05 || {}
      const prjRes = await dpProjectForm({ id: prjId.id })
      const outter = JSON.parse(outterTaskId)
      const { projectJson, projectId: sprj, graphId, status, voteId, dependencyData, configData, edgeData } = outter
      console.log({ prjRes, projectJson })
      const dpOutterId = { graphId, status, voteId, projectId: sprj }
      let participants = JSON.stringify(prjRes?.dpProject?.dpProjectPartysList?.map(item => {
        // const party = siteStore.otherSite.find(it => {
        //   return it.nodeId == item?.partyId?.id
        // })
        // console.log({ party: siteStore.otherSite })
        return siteStore.getByNodeId(item?.partyId?.id).id
        // return party?.id
      }) || [])
      console.log({ participants, dependencyData, configData, edgeData, projectJson: JSON.parse(projectJson) })
      const detail = { ...(res.dpProjectTasks05 || {}), projectName: taskName, participants, projectJson, platform: 0, secretflowPrjId: sprj, outterTaskId: dpOutterId, tProjectAlgConfig: { dependencyData, configData, edgeData } }
      state.projectDetail = detail
    }
  } finally {
    state.loading = false;
  }
}

async function onSaveProjectBaseInfo () {
  console.log('onSaveProjectBaseInfo');
  if (type.value == '4') {
    // 如果是python项目，获取授权数据并打开弹框
    authDataList.value = await getAuthData(state.projectDetail.id);
    dialogVisible.value = true;
    return;
  }
  // 这一步在获取当前项目的基本信息(参与方，项目名，画布信息)
  state.model = ProjectFormRef.value.getModel();
  let projectJson = JSON.parse(state.model.projectJson);
  console.log(projectJson, 'UUUUUIIIIII');
  projectJson = projectJson.projectJson ? projectJson.projectJson : projectJson;
  console.log(state.model, 'STATE.MODEL');
  // 这个方法在筛选出我要的数据生成新对象
  const projectInfo = _.pick(state.model, [
    'id',
    'projectName',
    'remarks',
    'projectJson',
    'arbiter',
  ]);
  console.log(projectInfo, '>>>projectInfo');
  _.set(projectInfo, 'projectJson.job_runtime_conf', {
    dsl_version: 2,
    job_parameters: {
      common: {
        job_type: 'train',
      },
    },
  });
  _.set(projectInfo, 'nodeTag', JSON.parse(state.model.participants));

  if (projectJson.job_runtime_conf.role) {
    _.set(projectInfo, 'projectJson.job_runtime_conf.role', {
      guest: [parseInt(projectJson.job_runtime_conf.role.guest)],
      host: projectJson.job_runtime_conf.role.host,
    });
    console.log({ host: projectJson.job_runtime_conf.role.host })
    _.set(projectInfo, 'host', projectJson.job_runtime_conf.role.host);

    _.set(projectInfo, 'guest', [
      parseInt(projectJson.job_runtime_conf.role.guest),
    ]);
    console.log({ arbiter: projectJson.job_runtime_conf.role.arbiter })
    if (projectJson.job_runtime_conf.role.arbiter) {
      _.set(projectInfo, 'arbiter', [
        parseInt(projectJson.job_runtime_conf.role.arbiter),
      ]);
      _.set(projectInfo, 'projectJson.job_runtime_conf.role.arbiter', [
        parseInt(projectJson.job_runtime_conf.role.arbiter),
      ]);
    }
  }
  _.set(
    projectInfo,
    'dependencyData',
    state.model.tProjectAlgConfig?.dependencyData,
  );
  // if (state.model.arbiter) {
  //   _.set(projectInfo, 'projectJson.job_runtime_conf.role.arbiter', [
  //     parseInt(state.model.arbiter),
  //   ]);
  // }
  console.log(state, 'initiator');

  _.set(projectInfo, 'projectJson.job_runtime_conf.initiator', {
    party_id: parseInt(state.partyId),//parseInt(state.partyId),
    role: 'guest',
  });
  _.set(projectInfo, 'secretflowPrjId', state.projectDetail.secretflowPrjId);
  _.set(projectInfo, 'outterTaskId', state.projectDetail.outterTaskId);
  localStorage.setItem('projectInfo', JSON.stringify(projectInfo));
  if (state.model.id) {
    // 查询项目的算法信息
    // const projectAlgorithms = await getOperator(state.model.id); 
    const projectAlgorithms = Object.keys(JSON.parse(state?.projectDetail?.tProjectAlgConfig?.dependencyData || '{}').component_module) || []
    console.log({ projectAlgorithms, projectDetail: state.projectDetail, route: route.name })
    // 判断画布上有没有东西，没有就不做数据处理
    if (projectAlgorithms.length === 0) {
      await router.push({
        name: route.name,
        query: {
          edit: true,
          projectName: state.model.projectName,
          id: state.model.id,
          type: state.projectDetail.platform,
        },
      });
      return;
    }
    // 查询项目算法参数的取值信息
    const projectParams = {};
    const hostProjectParams = {};
    const hostProjectParamsObj = {};
    const guestProjectParams = {};
    const commonProjectParams = {};
    const arbiterProjectParams = {};
    // const algorithmParams = await getSelectAlgorithmParams(state.model.id);
    const algorithmParams = JSON.parse(
      state.model.tProjectAlgConfig.configData,
    );
    console.log('algorithmParams::', algorithmParams);
    if (projectAlgorithms && projectAlgorithms.length > 0 && algorithmParams) {
      // const response = JSON.parse(state.model.tProjectAlgConfig.edgeData)
      // const versionIds = [];
      // const componentNames = [];
      // // 这个循环在匹配数据，把数据的名字和id匹配放到一一对应的数组里
      // projectAlgorithms.forEach((algorithm) => {
      //   const paramVersion = algorithmParams.find((param) => {
      //     return param.componentName === algorithm;
      //   });
      //   versionIds.push(paramVersion.paramVersionId);
      //   componentNames.push(paramVersion.componentName);
      // });
      // // 这一步在获取算子的所有数据信息
      // const promises = versionIds.map((item) =>
      //   getAlgorithmParamsByVersionId(item),
      // );
      // const response = await Promise.all(promises);

      // const algorithmParamsObj = await algorithmParamsSort(algorithmParams, response)
      // console.log(response, 'promises123');
      // console.log(algorithmParamsObj, '333');
      // 设置项目算法参数初始值
      for (let i = 0; i < projectAlgorithms.length; i++) {
        // let params = response[i]?.tAlgorithmParamVersions;
        // console.log(params, algorithmParams, 'OIOIIOIO');
        let componentName = projectAlgorithms[i];
        const Params = _.cloneDeep(
          setDefaultValue(
            algorithmParams[componentName],
            componentName,
            projectInfo.host,
          ),
        );
        console.log(Params, 'host');
        // 这一步在给这个对象添加已经处理好的算子
        projectParams[componentName] = [
          ...Params[0][`hostVitalParamList0`],
          ...Params[1],
          ...Params[2],
          ...Params[3],
        ];
        console.log(Params, 'Params');
        hostProjectParamsObj[componentName] = Params[0];
        hostProjectParams[componentName] = Params[0][`hostVitalParamList0`];
        guestProjectParams[componentName] = Params[1];
        commonProjectParams[componentName] = Params[2];
        arbiterProjectParams[componentName] = Params[3];
        // 这一步会得到应该拼接在common里的数据
        const formattedForm = formattedFormResult(_.cloneDeep(Params[2]));
        const projectCfg = {
          [componentName]: JSON.stringify(formattedForm)
            .trim()
            .slice(1, -1)
            .replaceAll(new RegExp('},+{', 'gm'), ',')
            .replaceAll('[{', '{')
            .replaceAll('}]', '}')
            .replaceAll('[]', '{}'),
        };
        const ProjectConfigInfo = {
          ...JSON.parse(localStorage.getItem('ProjectConfigInfo')),
          ...projectCfg,
        };
        localStorage.setItem(
          'ProjectConfigInfo',
          JSON.stringify(ProjectConfigInfo),
        );
      }
    }
    const dependencyData = state.model.tProjectAlgConfig?.dependencyData;
    // 构造默认参数
    dependencyData &&
      JSON.parse(dependencyData).projectParamsVersion &&
      sessionStorage.setItem(
        'projectParamsVersion',
        JSON.parse(dependencyData).projectParamsVersion,
      );
    localStorage.setItem('projectParams', JSON.stringify(projectParams));
    localStorage.setItem(
      'hostProjectParams',
      JSON.stringify(hostProjectParams),
    );
    localStorage.setItem(
      'hostProjectParamsObj',
      JSON.stringify(hostProjectParamsObj),
    );
    localStorage.setItem(
      'guestProjectParams',
      JSON.stringify(guestProjectParams),
    );
    localStorage.setItem(
      'commonProjectParams',
      JSON.stringify(commonProjectParams),
    );
    localStorage.setItem(
      'arbiterProjectParams',
      JSON.stringify(arbiterProjectParams),
    );
    // TODO 设置默认参数
  } else {
    sessionStorage.setItem('projectParamsVersion', null);
    localStorage.setItem('projectParams', null);
    localStorage.setItem('hostProjectParams', null);
    localStorage.setItem('hostProjectParamsObj', null);
    localStorage.setItem('guestProjectParams', null);
    localStorage.setItem('arbiterProjectParams', null);
    localStorage.setItem('ProjectConfigInfo', null);
  }
  await router.push({
    name: route.name,
    query: {
      edit: true,
      projectName: state.model.projectName,
      id: state.model.id,
      type: state.projectDetail.platform,
    },
  });

}

// 这个方法会根据当前传入的算子名称返回这个算子的参数数据
// params:当前算子版本的算子参数
// defaultValues:当前项目配置的算子参数
// componentName:当前算子名称
// hostList:多方联邦时使用，代表这个项目有多少个host方
function setDefaultValue (params, componentName, hostList) {
  console.log(params, componentName, hostList, '33311111OOOO');
  const hostParams = {};
  const guestParams = [];
  const commonParams = [];
  const arbiterParams = [];
  let num = '';
  const projectParamsList = [guestParams, commonParams, arbiterParams];
  const roleTypeList = ['guest', 'common', 'arbiter'];
  hostList.forEach(() => {
    roleTypeList.unshift('host');
    projectParamsList.unshift([]);
  });

  roleTypeList.forEach((roleType, idx) => {
    if (Array.isArray(params) && params.length > 0) {
      let defaultValue = null;
      for (let i = 0; i < params.length; i++) {
        // 这块是寻找对应目标
        if (
          params[i].inputStyle === 'level' &&
          params[i].subParams.length > 0
        ) {
          // setSubParam(params[i].subParams, componentName, num)
          // 这块是分类
          params[i].subParams.find((item) => {
            for (let j = 0; j < roleTypeList.length; j++) {
              if (
                item.roleType.includes(roleTypeList[j]) &&
                !JSON.stringify(projectParamsList[j]).includes(params[i].key)
              ) {
                projectParamsList[j].push(_.cloneDeep(params[i]));
                return true;
              }
            }
          });
        } else {
          // defaultValue = defaultValues.find((val, index) => {
          //   if (val.paramId === params[i].id && val.componentName === componentName) {
          //     num = index
          //   }
          //   return val.paramId === params[i].id && val.componentName === componentName;
          // });
          // if (num !== '') {
          //   defaultValues.splice(num, 1)
          //   num = ''
          // };
          // if (!defaultValue) continue
          // // 这块是赋值
          // params[i].defaultValue = defaultValue.defaultValue;
          // params[i].isDefaultVital = defaultValue.isDefaultVital;
          // params[i].isVitalParam = defaultValue.isVitalParam;
          // console.log(params[i]);
          // 这块是分类
          // roleTypeList.forEach((roleType, idx) => {
          for (let j = 0; j < roleTypeList.length; j++) {
            if (
              params[i].roleType.includes(roleTypeList[j]) &&
              !projectParamsList[j].some((item) => item.key === params[i].key)
            ) {
              projectParamsList[j].push(_.cloneDeep(params[i]));
              break;
            }
          }
          // })
        }
      }
    }
  });

  for (let k = hostList.length; k > 0; k--) {
    hostParams[`hostVitalParamList${k - 1}`] = projectParamsList[0];
    projectParamsList.splice(0, 1);
  }

  projectParamsList.unshift(hostParams);
  return projectParamsList;
}

function setSubParam (params, componentName, num) {
  let defaultValue = null;
  params.forEach((subParam) => {
    // 避免level下面还有level
    if (subParam.inputStyle === 'level' && subParam.subParams.length > 0) {
      setSubParam(subParam.subParams, componentName, num);
    }
    defaultValue = defaultValues.find((val, index) => {
      if (val.key === subParam.key) {
        num = index;
      }
      console.log(val, subParam, 'KEY');
      return val.key === subParam.key;
    });

    console.log(defaultValue, 'defaultValue');
    if (num !== '') {
      defaultValues.splice(num, 1);
      num = '';
    }
    if (!defaultValue) return;
    // 这块是赋值
    subParam.defaultValue = defaultValue.defaultValue;
    subParam.isDefaultVital = defaultValue.isDefaultVital;
    subParam.isVitalParam = defaultValue.isVitalParam;
  });
}

async function onRun () {
  try {
    state.loading = true;
    const response = await createJob(route.query.id);
    ElMessage.success(response.retmsg || '操作成功');
    JobTableRef.value.fetchTableData();
  } catch (error) {
    ElMessage.error(error);
  } finally {
    state.loading = false;
  }
}

function onCancel () {
  ProjectFormRef.value.cancel();
}

function onEdit () {
  router.push({
    name: route.name,
    query: {
      projectName: route.query.projectName,
      id: route.query.id,
      action: FormType.EDIT,
      type: route.query.type,
    },
  });
}
const emits = defineEmits(['ProjectDetail']);

// 接收第一次子组件传值 需要继续传值
const handleJobDetail = (val) => {
  // console.log('第一次接收值', val);
  emits('ProjectDetail', val);
};

async function runPythonProject () {
  if (state.projectDetail.projectJson.includes('grna')) {
    const projectJson = JSON.parse(state.projectDetail.projectJson);
    projectJson.grna = {
      dataName: state.authData,
    };
    const param = {
      algorithmParams: {
        grna: {
          dataName: state.authData,
        },
      },
      dependencyData: {},
      selectedAlgorithm: {},
      projectJson,
      projectName: state.projectDetail.projectName,
      id: state.projectDetail.id,
    };
    await updateProject(param);
  } else if (state.projectDetail.projectJson.includes('fake')) {
    const projectJson = JSON.parse(state.projectDetail.projectJson);
    projectJson.fake = {
      dataName: state.authData,
    };
    const param = {
      algorithmParams: {
        grna: {
          dataName: state.authData,
        },
      },
      dependencyData: {},
      selectedAlgorithm: {},
      projectJson,
      projectName: state.projectDetail.projectName,
      id: state.projectDetail.id,
    };
    await updateProject(param);
  } else if (state.projectDetail.projectJson.includes('one-shot')) {
    const projectJson = JSON.parse(state.projectDetail.projectJson);
    projectJson['one-shot'] = formInline;
    const param = {
      algorithmParams: {
        'one-shot': formInline,
      },
      dependencyData: {},
      selectedAlgorithm: {},
      projectJson,
      projectName: state.projectDetail.projectName,
      id: state.projectDetail.id,
    };
    await updateProject(param);
  }
  dialogVisible.value = false;
}
</script>

<template>
  <ListContainer v-loading="state.loading"
                 title="项目详情">
    <!-- <el-button v-if="state.model.projectSourceType === SourceType.SELF" type="text" @click="onRun" -->
    <template #header-tool>
      <el-button type="text"
                 @click="onRun"
                 v-permission="'start'">
        <el-icon><img src="../../../assets/workspace/play.svg"
               alt="" /></el-icon>
        运行
      </el-button>
    </template>
    <ListContainerItem title="基本信息">
      <template #header-tool>
        <template v-if="FormType.EDIT === action">
          <el-button type="text"
                     @click="onSaveProjectBaseInfo">下一步
          </el-button>
          <el-button type="text"
                     @click="onCancel">取消</el-button>
        </template>
        <template v-else-if="FormType.READ === action">
          <el-button type="text"
                     @click="onEdit"
                     v-permission="'edit'">
            <el-icon>
              <Edit />
            </el-icon>
            编辑
          </el-button>
        </template>
      </template>
      <!-- 备注 -->
      <ProjectForm ref="ProjectFormRef"
                   :defaultModel="state.projectDetail"
                   :formType="action" />
    </ListContainerItem>
    <ListContainerItem title="作业概览">
      <JobTable ref="JobTableRef"
                :projectId="projectId"
                :projectName="projectName"
                @JobDetail="handleJobDetail" />
    </ListContainerItem>
  </ListContainer>
  <el-dialog v-model="dialogVisible"
             title="编辑python引擎项目"
             width="800px">
    <el-select v-model="state.authData"
               placeholder="选择要使用的数据"
               v-if="
        state.projectDetail.projectJson.includes('grna') ||
        state.projectDetail.projectJson.includes('fake')
      ">
      <el-option v-for="item in authDataList"
                 :key="item.id"
                 :label="item.name"
                 :value="item.name" />
    </el-select>
    <el-form :inline="true"
             :model="formInline"
             class="demo-form-inline"
             v-if="state.projectDetail.projectJson.includes('one-shot')">
      <el-form-item label="原始数据">
        <el-select v-model="formInline.realPath"
                   placeholder="请选择原始数据"
                   clearable>
          <el-option v-for="item in authDataList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="本方数据">
        <el-select v-model="formInline.party1"
                   placeholder="请选择本方数据"
                   clearable>
          <el-option v-for="item in authDataList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="他方数据">
        <el-select v-model="formInline.party2"
                   placeholder="请选择他方数据"
                   clearable>
          <el-option v-for="item in authDataList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.name" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="runPythonProject"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
