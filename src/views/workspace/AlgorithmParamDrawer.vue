<script setup>
import { reactive, onMounted, ref, onBeforeMount, nextTick, watchEffect } from 'vue';
import AlgorithmParamTree from './project/AlgorithmParamTree.vue';
import useAlgorithmParam from '../../hooks/useAlgorithmParam';
import { useRoute } from 'vue-router';
import _ from 'lodash';


const {
  getInEffectAlgorithmParams,
  changeParams,
  vitalParamList,
  commonVitalParamList,
  hostVitalParamList,
  hostVitalParamListObj,
  guestVitalParamList,
  arbiterVitalParamList,
  constraintList,
  optionParamList,
  defaultVitalParamList,
  optionParam,
  selectParamVersion,
  paramVersionList,
  paramVersion,
  handleCheckChange,
  onSaveNode,
} = useAlgorithmParam();
const emit = defineEmits(['close']);
const state = reactive({ loading: false, data: {} });
const props = defineProps({ operator: { type: Object, required: true }, info: { type: Object, required: true } });
const route = useRoute()
const selectedParamVersion = reactive({});
const projectInfo = ref({})
  
onBeforeMount(async () => {
  projectInfo.value = JSON.parse(localStorage.getItem('projectInfo'))
  console.log(props.operator,'OPERATOR');
  // const label = props.operator.algorithm_name ?? props.operator.component_name;
  const label = props.operator.label;
  let componentName = label;
  let reg = /._\d$/;
  if (reg.test(label)) {
    componentName = label;
  }
  await getInEffectAlgorithmParams(componentName, projectInfo.value.host, route.query.id);
  selectedParamVersion.id = paramVersion.value.param_version;
  add();
  // cloneVitalParamList()
  console.log(guestVitalParamList,'AKSKSKDO')
})

watchEffect(handleVitalParamList)

// onMounted(async () => {
//   const label = props.operator.label;
//   let componentName = label;
//   let reg = /._\d$/;
//   if (reg.test(label)) {
//     componentName = label;
//   }
//   await getInEffectAlgorithmParams(componentName);
//   selectedParamVersion.id = paramVersion.value.id;
//   add();
// });

function handleClose() {
  emit('close');
}
const changeValues = ref([]);
const staticParams = ref([]);
const add = async () => {
  console.log('paramVersionList',paramVersionList.value);
  const firstParm = vitalParamList.value.find(
    (item) => item.inputStyle != 'level',
  );
  const vars = {
    keyPath: firstParm?.key,
    operatorName: props.operator.label,
    value: firstParm?.defaultValue,
  };
  console.log('varsw', vars);
  changeParams(vars);
};


function handleVitalParamList() {
  // 如果有hostVitalParamListObj对象里有一个属性就默认host已经克隆添加完
  if (hostVitalParamListObj.value[`hostVitalParamList0`] && hostVitalParamListObj.value[`hostVitalParamList0`][0]) {
    // 这块是在控制这条参数是否显示(把模板hostVitalParamList的isVitalParam赋值给克隆出的host数据)
    projectInfo.value.host.forEach((item, i) => {
      hostVitalParamList.value.forEach((vitalParam, idx) => {
        if (vitalParam.inputStyle === 'level') {
          const hostVitalParam = hostVitalParamListObj.value[`hostVitalParamList${i}`].find((item) => item.key === vitalParam.key)
          handleLevelParam(hostVitalParam.subParams, vitalParam.subParams)
        } else {
          if(!hostVitalParamListObj.value[`hostVitalParamList${i}`][idx]) return
          hostVitalParamListObj.value[`hostVitalParamList${i}`][idx].isVitalParam = vitalParam.isVitalParam
        }
      })
    })
  }
}

function handleLevelParam(hostVitalparam, subParams) {
  subParams.forEach((param, i) => {
    if (param.inputStyle === 'level') {
      handleLevelParam(hostVitalparam.subParams, param.subParams)
    } else {
      hostVitalparam[i].isVitalParam = param.isVitalParam
    }
  })
}

function isShow(dataList, roleType) {
  let arr = [];
  dataList.forEach((item) => {
    if (item.inputStyle === 'level') {
      arr.push(...isShow(item.subParams, roleType));
    } else if (item.roleType.includes(roleType) && item.isVitalParam) {
      arr.push(item);
    }
  });
  return arr;
}
</script>

<template>
  <el-drawer v-loading="state.loading" :model-value="true" :before-close="handleClose" size="50%"
    @close="showEditDrawer = false">
    <template #default>
      <el-form label-width="150px">
        <div>
          <h3>数据版本</h3>
          <el-form-item v-show="paramVersionList.length > 0" label="参数版本" style="font-weight: bolder">
            <!--            <span slot="label">-->
            <!--              <span><strong>参数版本</strong></span>-->
            <!--            </span>-->
            <el-select v-model="selectedParamVersion.id" :disabled="paramVersionList.length === 1" @change="
              selectParamVersion(selectedParamVersion.id, props.operator.type, props.operator.label, projectInfo.host)
              " style="width: 80%" value-key="id">
              <el-option v-for="item in paramVersionList" :label="item.param_version_description" :value="item.param_version" :key="item.param_version" />
            </el-select>
          </el-form-item>

          <h3 v-if="isShow(guestVitalParamList, 'guest').length !== 0">
            生效参数:业务方</h3>
          <div>
            <AlgorithmParamTree v-if="isShow(guestVitalParamList, 'guest').length !== 0"
              v-for="vitalParam in guestVitalParamList" :key="vitalParam.id" :data="vitalParam"
              :operatorName="props.operator.label" :constraints="constraintList" :roleType="'guest'"
              @params-change="changeParams($event, 'guest')" />
          </div>

          <template v-for="(item, i) in projectInfo?.host">
            <h3 v-if="isShow(hostVitalParamList, 'host').length !== 0">
              生效参数:数据方</h3>
            <div>
              <AlgorithmParamTree v-if="isShow(hostVitalParamList, 'host').length !== 0"
                v-for="vitalParam in hostVitalParamListObj[`hostVitalParamList${i}`]" :key="vitalParam.id"
                :data="vitalParam" :operatorName="props.operator.label" :constraints="constraintList"
                @params-change="changeParams($event, 'host', hostVitalParamListObj, i)" :roleType="'host'" />
            </div>
          </template>

          <h3 v-if="isShow(commonVitalParamList, 'common').length !== 0">
            公共参数</h3>
          <div>
            <AlgorithmParamTree v-if="isShow(commonVitalParamList, 'common').length !== 0"
              v-for="vitalParam in commonVitalParamList" :key="vitalParam.id" :data="vitalParam"
              :operatorName="props.operator.label" :constraints="constraintList" :roleType="'common'"
              @params-change="changeParams($event, 'common')" />
          </div>

          <h3 v-if="isShow(arbiterVitalParamList, 'arbiter').length !== 0">
            生效参数:聚合方</h3>
          <div>
            <AlgorithmParamTree v-if="isShow(arbiterVitalParamList, 'arbiter').length !== 0"
              v-for="vitalParam in arbiterVitalParamList" :key="vitalParam.id" :data="vitalParam"
              :operatorName="props.operator.label" :constraints="constraintList" :roleType="'arbiter'"
              @params-change="changeParams($event, 'arbiter')" />
          </div>
        </div>
        <div>
          <h3>全部参数</h3>
          <div>
            <el-tree :data="optionParamList" :props="optionParam" node-key="key" show-checkbox default-expand-all="true"
              :default-checked-keys="defaultVitalParamList" @check-change="handleCheckChange"
              @paramsChange="handelparamsChange">
              <template #default="{ node, data }">
                <span>{{ data.label_zh }} </span>
                <span>({{ data.label_en }})</span>
              </template>
            </el-tree>
          </div>
        </div>
        <el-form-item>
          <el-button type="primary" @click="onSaveNode(props.operator, handleClose, hostVitalParamListObj)">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
.saveBtn {
  position: fixed;
  right: 5%;
  bottom: 2%;
}
</style>
