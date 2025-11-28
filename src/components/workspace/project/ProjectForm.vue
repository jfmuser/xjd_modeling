<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { FormType } from '../../../utils/const';
import { useRoute, useRouter } from 'vue-router';
import useConfigStore from '../../../stores/workspace/config.store';
import useSiteStore from '../../../stores/dept/site.store';

const router = useRouter();
const route = useRoute();
const FormRef = ref(null);
const configInfo = useConfigStore().configInfo;
const siteStore = useSiteStore()
console.log(configInfo, 'configInfo121212');
const state = reactive({
  model: {},
  loading: false,
  selfSites: [],
  otherSites: [],
  arbiterSites: [],
});


const subjectList = ref(null)

const props = defineProps({
  defaultModel: {
    type: Object,
    default: () => ({}),
  },
  formType: {
    type: String,
    required: true,
  },
  inline: {
    type: Boolean,
    default: true,
  },
  labelWidth: {
    type: String,
    default: '100px',
  },
});

watch(
  () => props.defaultModel,
  () => {
    state.model = { ...props.defaultModel };
    console.log({ otherSite: siteStore.otherSite })
    if (!state.model.participants) return
    //把参与主体的ID映射成名称，需要拿到所有主体筛选
    const subjectIdList = JSON.parse(state.model.participants)
    console.log(33, { otherSite: siteStore.otherSite })
    subjectList.value = siteStore.otherSite.filter((subject) => {
      return subjectIdList.some((id) => id === subject.id)
    })
    console.log({ subjectList })
    subjectList.value = subjectList.value.map((item) => {
      return item.name
    })
  },
  { immediate: true },
);

onMounted(() => {
  if (configInfo) {
    state.selfSites = configInfo.selfSiteList;
    state.otherSites = configInfo.otherSiteList;
    state.arbiterSites = configInfo.arbiterList;
  }
  console.log(props.defaultModel, '看这里');
});

function cancel () {
  router.push({
    name: route.name,
    query: {
      ...route.query,
      action: FormType.READ,
    },
  });
  FormRef.value.resetFields();
  state.model = { ...props.defaultModel };
}

function validate () {
  return FormRef.value.validate().catch(() => { });
}

function getModel () {
  return state.model;
}

async function save () { }

defineExpose({ cancel, validate, getModel, save, FormRef, state });
</script>

<template>
  <el-form ref="FormRef"
           :model="state.model"
           :label-width="props.labelWidth"
           :inline="props.inline">
    <el-form-item v-show="false"
                  label="ID">
      <el-input v-model="state.model.id"
                placeholder=""
                :disabled="props.formType === FormType.READ" />
    </el-form-item>
    <el-form-item label="项目名称"
                  prop="projectName">
      <el-input v-model="state.model.projectName"
                placeholder="请输入项目名称"
                :disabled="props.formType === FormType.READ" />
    </el-form-item>
    <!-- <el-form-item label="内置引擎" prop="">
      <el-input v-model="platform[state.model.platform]" placeholder="" disabled />
    </el-form-item> -->
    <el-form-item label="参与主体"
                  prop="">
      <el-input v-model="subjectList"
                placeholder=""
                disabled />
    </el-form-item>
    <!-- <el-form-item label="业务方" prop="guest">
      <el-select v-model="state.model.guest" :disabled="props.formType === FormType.READ">
        <el-option v-for="selfSite in state.selfSites" :key="selfSite.partyId" :label="selfSite.siteName"
          :value="selfSite.partyId" />
      </el-select>
    </el-form-item>
    <el-form-item label="数据方" prop="host">
      <el-select v-model="state.model.host" multiple :disabled="props.formType === FormType.READ">
        <el-option v-for="otherSite in state.otherSites" :key="otherSite.partyId" :label="otherSite.siteName"
          :value="otherSite.partyId" />
      </el-select>
    </el-form-item>
    <el-form-item label="聚合方" prop="arbiter">
      <el-select v-model="state.model.arbiter" :disabled="props.formType === FormType.READ">
        <el-option v-for="arbiterSite in state.arbiterSites" :key="arbiterSite.partyId" :label="arbiterSite.siteName"
          :value="arbiterSite.partyId" />
      </el-select>
    </el-form-item> -->

    <el-form-item label="备注"
                  prop="remarks"
                  class="entire-line">
      <el-input v-model="state.model.remarks"
                type="textarea"
                placeholder=""
                :disabled="props.formType === FormType.READ" />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.alert-info {
  margin-bottom: 1rem;
}
</style>
