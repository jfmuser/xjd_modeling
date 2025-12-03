<script setup>
import _ from 'lodash';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createCanvasProject } from '../../../apis/manager/managerApi'
import useConfigStore from '../../../stores/workspace/config.store';
import useSecretflowFn from '@/hooks/useSecretflowFn.js'
import useSiteStore from '../../../stores/dept/site.store'
import * as Base64 from 'js-base64'

const { createSecretflowProject } = useSecretflowFn()
const FormRef = ref(null);
const router = useRouter();
const route = useRoute();
const siteStore = useSiteStore()

const emit = defineEmits(['done'])

const checkNodeTagList = (rule, value, callback) => {
  if (value.length < 2) {
    callback(new Error('最少选择两个主体'))
  } else {
    callback()
  }
}

const state = reactive({
  type: '',
  visible: false,
  loading: false,
  model: {},
  partyId: '',
  role: '',
  rules: {
    projectName: [
      { required: true, message: '请输入项目名称', trigger: 'change' },
      { max: 30, message: '最多只能输入30个字符', trigger: 'change' },
    ],
    core: [
      { required: true, message: '请选择主体', trigger: 'blur' }
    ],
    guest: [{ required: true, message: '请选择业务方', trigger: 'change' }],
    host: [{ required: true, message: '请选择数据方', trigger: 'change' }],
    nodeTag: [{ validator: checkNodeTagList, message: '最少选择两个主体', trigger: 'blur' }],
    remarks: [{ max: 16, message: '最多只能输入16个字符', trigger: 'change' }]
  },
});

const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))


const nodeTagList = ref(null)
const nodeIdList = ref([])
const roleList = ref([])
const configInfo = siteStore.mySite;
const secretflowEngineInfo = ref()

const selfSites = computed(() => {
  if (configInfo.fateInfo && configInfo.fateInfo !== '{}') {
    const selfInfo = siteStore.mySite;
    state.partyId = JSON.parse(configInfo.fateInfo).partyId;
    return selfInfo;
  } else if (configInfo.innovateInfo && configInfo.innovateInfo !== '{}') {
    state.partyId = JSON.parse(configInfo.innovateInfo).partyId;
  }
  return null;
});
const otherSites = computed(() => {
  if (configInfo) {
    return configInfo.otherSiteList;
  }
  return null;
});
const arbiterSites = computed(() => {
  if (configInfo) {
    return configInfo.arbiterList;
  }
  return null;
});
const title = computed(() => `${state.type}项目`);

const onClose = () => {
  FormRef.value.resetFields();
  state.visible = false;
  emit('done')
};

const show = (type) => {
  state.visible = true;
  state.type = type;
};

const onConfirm = async () => {
  const isValid = await FormRef.value.validate().catch(() => { });
  if (!isValid) {
    return;
  }

  if (state.model.core == '1') {
    localStorage.setItem('graphInfo', null)
    localStorage.setItem('projectParams', null)
    const nodeIdArr = []
    if (nodeIdList.value.length > 0) {
      for (let i = 0; i < siteStore.otherSite.length; i++) {
        const currentSite = siteStore.otherSite[i].tDomainEngineList.find(engine => engine.engine == '1')
        if (currentSite && nodeIdList.value.some(item => JSON.parse(currentSite.engineInfo).nodeId === item.id)) {
          nodeIdArr.push(siteStore.otherSite[i].id)
        }
      }
    }
    const data = await createSecretflowProject(state.model.projectName, state.model.nodeTag)
    const param = {
      projectName: state.model.projectName,
      participants: nodeIdArr,
      platform: state.model.core,
      secretPadProjectId: data.projectId,
      secretPadGraphId: data.graphId
    }

    await createCanvasProject(param)
    await ElMessage({
      message: '添加成功',
      type: 'success',
    })
    onClose()
  } else if (state.model.core == '4') {
    const projectInfo = {
      algorithmParams: {

      },
      algorithmParams: {},
      selectedAlgorithm: {},
      projectName: state.model.projectName,
      platform: state.model.core,
      projectJson: {},
      participants: state.model.alg == 'one-shot' ? state.model.nodeTag : [siteStore.mySite.id]
    }
    projectInfo.algorithmParams[state.model.alg] = {}
    projectInfo.projectJson[state.model.alg] = {}
    createCanvasProject(projectInfo)
    onClose()
  } else {

    let projectInfo = _.pick(state.model, [
      'id',
      'projectName',
      'remarks',
      'projectJson',
      'arbiter',
    ]);
    _.set(projectInfo, 'projectJson.job_runtime_conf', {
      dsl_version: 2,
      job_parameters: {
        common: {
          job_type: 'train',
        },
      },
    });
    // }
    console.log({ projectInfo })
    projectInfo = Base64.encode(JSON.stringify(projectInfo))
    // _.set(projectInfo, 'nodeTag', [...state.model.nodeTag]);
    createCanvasProject({ projectName: state.model.projectName, participants: state.model.nodeTag, platform: state.model.core, projectJson: projectInfo })
    localStorage.setItem('projectInfo', JSON.stringify(projectInfo));
    localStorage.setItem('projectParams', null);
    localStorage.setItem('projectConfigInfo', null);
    await ElMessage({
      message: '添加成功',
      type: 'success',
    })
    onClose()
  }

  // router.push({
  //   name: route.name,
  //   query: {
  //     edit: true,
  //     projectName: state.model.projectName,
  //     id: state.model.id,
  //     type: state.model.core,
  //   },
  // });
  onClose();
};

function addRole () {
  roleList.value = siteStore.otherSite.filter((item) => {
    return state.model.nodeTag.some(id => item.id === id)
  })

}

onMounted(async () => {
  nodeTagList.value = siteStore.otherSite
  for (let i = 0; i < siteStore.otherSite.length; i++) {
    secretflowEngineInfo.value = siteStore.otherSite[i].tDomainEngineList.find(engine => engine.engine == '1')
    if (secretflowEngineInfo.value && JSON.parse(secretflowEngineInfo.value.engineInfo).nodeId) {
      nodeIdList.value.push({
        name: siteStore.otherSite[i].name,
        id: JSON.parse(secretflowEngineInfo.value.engineInfo).nodeId
      })
    }
  }
})

defineExpose({ show });
</script>

<template>
  <el-dialog v-if="state.visible"
             :model-value="true"
             :before-close="onClose"
             :title="title"
             width="500px">
    <el-form ref="FormRef"
             v-loading="state.loading"
             :model="state.model"
             label-width="100px"
             :rules="state.rules">
      <el-form-item label="项目名称"
                    prop="projectName">
        <el-input v-model="state.model.projectName"
                  placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="内置引擎"
                    prop="core">
        <el-select v-model="state.model.core">
          <el-option :label="engine.name"
                     :value="engine.engine"
                     v-for="engine in configInfo.tDomainEngineList"
                     :key="engine.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="参与主体"
                    prop="nodeTag"
                    v-if="state.model.core == '1' && state.model.core != '4'">
        <el-select v-model="state.model.nodeTag"
                   multiple
                   :multiple-limit="10"
                   @change="addRole">
          <el-option v-for="item in nodeIdList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="参与主体"
                    prop="nodeTag"
                    v-if="state.model.alg == 'one-shot' || state.model.core != '1' && state.model.core != '4'">
        <el-select v-model="state.model.nodeTag"
                   multiple
                   :multiple-limit="10"
                   @change="addRole">
          <el-option v-for="item in nodeTagList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="选择要使用的算法"
                    prop="alg"
                    v-show="state.model.core == '4'">
        <el-select v-model="state.model.alg"
                   :multiple-limit="10"
                   @change="addRole">
          <!-- <el-option v-for="item in nodeTagList" :key="item.id" :label="item.name" :value="item.id" /> -->
          <el-option label="一次联邦提升树算法"
                     value="one-shot" />
          <el-option label="隐私数据泄露审查算法"
                     value="grna" />
          <el-option label="差分隐私算法（DP）"
                     value="fake" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="业务方" prop="guest" v-if="state.model.core === 'FATE' || state.model.core === 'INNOVATE'">
        <el-select v-model="state.model.guest">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name"
            :value="state.model.core === 'FATE' ? JSON.parse(item.fateInfo).partyId : JSON.parse(item.innovateInfo).partyId" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据方" prop="host" v-if="state.model.core === 'FATE' || state.model.core === 'INNOVATE'">
        <el-select v-model="state.model.host" multiple>
          <el-option v-for="item in roleList" :key="item.id" :label="item.name"
            :value="state.model.core === 'FATE' ? JSON.parse(item.fateInfo).partyId : JSON.parse(item.innovateInfo).partyId" />
        </el-select>
      </el-form-item>
      <el-form-item label="聚合方" prop="arbiter" v-if="state.model.core === 'FATE' || state.model.core === 'INNOVATE'">
        <el-select v-model="state.model.arbiter">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name"
            :value="state.model.core === 'FATE' ? JSON.parse(item.fateInfo).partyId : JSON.parse(item.innovateInfo).partyId" />
        </el-select>
      </el-form-item> -->

      <el-form-item label="备注"
                    prop="remarks">
        <el-input v-model="state.model.remarks"
                  type="textarea"
                  placeholder="" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary"
                 @click="onConfirm">确认</el-button>
      <el-button @click="onClose"> 取消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
