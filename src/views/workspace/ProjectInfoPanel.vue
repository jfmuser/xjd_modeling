<script setup>
import _ from 'lodash';
import { onMounted, reactive, computed,ref } from 'vue';
import { Edit } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import C2Transition from '../../components/C2Transition.vue';
// import useConfigStore from '../../stores/workspace/config.store';
import useSiteStore from '../../stores/dept/site.store';
const route = useRoute();

const emit = defineEmits(['edit']);
// const configInfo = useConfigStore().configInfo;
const siteStore = useSiteStore()
const state = reactive({
  guestSites: [],
  hostSites: [],
  arbiterSites: [],
  model:{host:[]}
});
const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const type = computed(() => {
  return route.query.type
});

const roleList = ref([])
const roleNameList = ref({})

onMounted(() => {
  if (type.value == '1' || type.value == '3') return
  console.log(props.info, 'OOIIOPOP');
  roleList.value = siteStore.otherSite.filter(item => {
    return props.info.nodeTag.includes(item.id)
  })
  roleList.value.forEach(role => {
    if(role.tDomainEngineList.length === 0) return
    roleNameList.value[JSON.parse(role.tDomainEngineList.find(engine => engine.engine == '0').engineInfo).partyId] = role.name

  })

  console.log(roleList.value,roleNameList.value);
  // state.model.guest = props.info.guest ? props.info.guest[0] :''
  state.model.guest = props.info.guest ? roleNameList.value[props.info.guest[0]] : ''
  console.log();
  
  props.info.host && props.info.host.forEach(partyId => state.model.host.push(roleNameList.value[partyId]))
  console.log(state.model.host);
  
  state.model.arbiter = props.info.arbiter ? roleNameList.value[props.info.arbiter[0]] :''
  console.log(state.model.guest,state.model.arbiter);
  
  
});

function selectChange(val, roleType) {
  const projectInfo = JSON.parse(localStorage.getItem('projectInfo'))
  const myPartyId =  JSON.parse(siteStore.mySite.tDomainEngineList.find(engine => engine.engine == '0').engineInfo).partyId 
  if (roleType === 'guest') {
    _.set(projectInfo, 'projectJson.job_runtime_conf.role.guest', [
      parseInt(val)
    ]);
  } else if (roleType === 'host') {
    _.set(projectInfo, 'projectJson.job_runtime_conf.role.host', 
    val.map(Number)
    );

    _.set(projectInfo, 'host', 
    val.map(Number)
    );
  } else if (roleType === 'arbiter') {
    _.set(projectInfo, 'projectJson.job_runtime_conf.role.arbiter', [
    parseInt(val)
  ]);
  }
  if (val === myPartyId || val.includes(myPartyId)) {
    _.set(projectInfo, 'projectJson.job_runtime_conf.initiator', {
    party_id: parseInt(myPartyId),
    role: 'guest',
  });
}
  localStorage.setItem('projectInfo',JSON.stringify(projectInfo))
  }

function onEdit() {
  emit('edit');
}
</script>

<template>
  <div class="project-info">
    <div class="header">
      <div class="title">项目信息</div>
      <C2Transition>
        <el-button v-show="!props.editable" type="text" :icon="Edit" class="edit-button" @click="onEdit">编辑
        </el-button>
      </C2Transition>
    </div>
    <div v-if="Object.keys(props?.info).length > 0" class="content">
      <el-descriptions :column="1">
        <el-descriptions-item  label="项目名称">{{ props.info.projectName }}
        </el-descriptions-item>
        <!-- <el-descriptions-item label="参与主体" v-if="type === '1'">
          {{ JSON.stringify(props.info.nodeTag).replaceAll('"', '') }}
        </el-descriptions-item> -->
      </el-descriptions>
          <el-form ref="FormRef"  :model="state.model" label-width="100px" :rules="state.rules">
      <el-form-item label="业务方" prop="guest" v-if="type == '0'">
        <el-select v-model="state.model.guest" @change="selectChange(state.model.guest,'guest')">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name"
            :value="item.tDomainEngineList.length === 0 ? null :JSON.parse(item.tDomainEngineList.find(engine => engine.engine == '0').engineInfo)?.partyId" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据方" prop="host" v-if="type == '0'">
        <el-select v-model="state.model.host" multiple @change="selectChange(state.model.host,'host')">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name"
            :value="item.tDomainEngineList.length === 0 ? null :JSON.parse(item.tDomainEngineList.find(engine => engine.engine == '0').engineInfo)?.partyId" />
        </el-select>
      </el-form-item>
      <el-form-item label="聚合方" prop="arbiter" v-if="type === '0'">
        <el-select v-model="state.model.arbiter" @change="selectChange(state.model.arbiter,'arbiter')">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name"
            :value="item.tDomainEngineList.length === 0 ? null : JSON.parse(item.tDomainEngineList.find(engine => engine.engine == '0').engineInfo).partyId" />
        </el-select>
      </el-form-item>
    </el-form>
        <el-descriptions-item label="备注">
          {{ props.info.remarks }}
        </el-descriptions-item>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-info {
  background-color: #fff;
  padding: 0 20px;

  .header {
    display: flex;
    align-items: center;

    height: 50px;
    border-bottom: 1px solid #4376ff1a;

    .title {
      position: relative;

      &::before {
        position: absolute;
        content: ' ';
        width: 13px;
        height: 13px;
        background-image: url('../../assets/title_1.svg');
        background-repeat: no-repeat;
        top: 5px;
        left: -10px;
      }
    }

    .edit-button {
      margin-left: auto;
    }
  }

  :deep .el-descriptions__label {
    &::after {
      content: ':';
    }
  }
}
</style>
