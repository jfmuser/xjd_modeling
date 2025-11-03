<script setup>
import { reactive, ref, watch, computed, onMounted } from 'vue';
import { offlineReasoning } from '../../apis/workspace/model.api';
import { getProjectById } from '../../apis/workspace/project.api'
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router'
import useSiteStore from '../../stores/dept/site.store';

const route = useRoute()

const emits = defineEmits(['doAfter']);
const props = defineProps({
  hostNamespace: {
    type: Array,
    required: true
  }
})

const siteStore = useSiteStore()
const formRef = ref(null);
const state = reactive({
  visible: false,
  loading: false,
  formModel: {},
  namespace: [],
  guestTableName: [],
  hostNamespace: [],
  hostTableName: [],
  multi: false
  // rules: {
  //   guestTableName: [
  //     { required: true, message: '请选择', trigger: 'change' },
  //   ],
  //   hostTableName: [
  //     { required: true, message: '请选择', trigger: 'change' },
  //   ],
  // },
});
const authData = ref(null)
onMounted(() => {
  getNamespace();
  // getHostNamespace();
});

watch(() => props.hostNamespace, async (newVal) => {
  state.namespace = []
  state.guestTableName = []
  state.hostTableName = []
  getNamespace()
  // const projectInfo = await getProjectById(route.query.projectId)
  // const projectJSON = JSON.parse(projectInfo.projectJson)
  // console.log(projectJSON.job_runtime_conf.role.host);
  // state.multi = projectJSON.job_runtime_conf.role.host.length > 1 ? false : true
}, {
  immediate: true
})

const title = computed(() => `离线推理`);
const onClose = () => {
  formRef.value.resetFields();
  state.visible = false;
  // state.namespace = []
  // state.guestTableName = []
  // state.hostTableName = []
};

const onConfirm = async () => {
  const isValid = await formRef.value.validate().catch(() => {
  });
  if (!isValid) {
    return;
  }
  try {
    state.loading = true;
    if (state.multi) {
      state.formModel.hostNamespace = `${state.formModel.hostNamespace},${state.formModel.hostNamespaces}`
      state.formModel.hostTableName = `${state.formModel.hostTableName},${state.formModel.hostTableNames}`
    }
    await offlineReasoning(state.formModel);
    ElMessage.success('推理成功');
    emits('doAfter');
  } catch (e) {
    ElMessage.error(e || '推理失败');
  } finally {
    state.loading = false;
    onClose();
  }
};

async function getNamespace() {
  props.hostNamespace.forEach(item => {
    if (!state.namespace.some(namespace => namespace === item.namespace)) {
      state.namespace.push(item.namespace)
    }
  })
}



async function getTableName(type, namespace) {
  if (type === 'guest') {
    state.guestTableName = []
  } else if (type === 'host') {
    state.hostTableName = []
  }
  props.hostNamespace.forEach(item => {

    if (item.namespace === namespace && type === 'guest' && siteStore.mySite.id === item.dataFromId) {
      state[`guestTableName`].push({
        label: item.name,
        value: item.name
      })
    }
    if (item.namespace === namespace && type === 'host' && siteStore.mySite.id != item.dataFromId) {
      state[`hostTableName`].push({
        label: item.name,
        value: item.name
      })
    }
  })
}


function show(data) {
  // data.fjobId = data.jobId
  // data.fmodelId = data.modelId
  state.formModel = data;
  state.visible = true;
}

defineExpose({ show });
</script>
<template>
  <el-dialog v-if='state.visible' :model-value='true' width='600px' :before-close='onClose' :title='title'>
    <el-form ref='formRef' v-loading='state.loading' :model='state.formModel' label-width='90px' :rules='state.rules'>
      <el-form-item label='本方数据' prop='guestTableName'>
        <el-select @change="getTableName('guest', state.formModel.guestNamespace)"
          v-model='state.formModel.guestNamespace' placeholder='请选择命名空间'>
          <el-option v-for='item in state.namespace' :key='item' :value='item' :label='item'>
          </el-option>
        </el-select>
        <el-select v-model='state.formModel.guestTableName' placeholder='请选择表名'>
          <el-option v-for='item in state.guestTableName' :key='item.value' :value='item.value' :label='item.label'>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label='他方数据' prop='hostTableName'>
        <el-select v-model='state.formModel.hostNamespace' @change="getTableName('host', state.formModel.hostNamespace)"
          placeholder='请选择命名空间'>
          <el-option v-for='item in state.namespace' :key='item' :value='item' :label='item'>
          </el-option>
        </el-select>
        <el-select v-model='state.formModel.hostTableName' placeholder='请选择表名'>
          <el-option v-for='item in state.hostTableName' :key='item.value' :value='item.value' :label='item.label'>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label='' prop='hostTableName' v-if="route.query.multi === 'true'">
        <el-select v-model='state.formModel.hostNamespaces' @change="getTableName('host', state.formModel.hostNamespace)"
          placeholder='请选择命名空间'>
          <el-option v-for='item in state.namespace' :key='item' :value='item' :label='item'>
          </el-option>
        </el-select>
        <el-select v-model='state.formModel.hostTableNames' placeholder='请选择表名'>
          <el-option v-for='item in state.hostTableName' :key='item.value' :value='item.value' :label='item.label'>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type='primary' @click='onConfirm'>确认</el-button>
      <el-button @click='onClose'> 取消</el-button>
    </template>
  </el-dialog>
</template>
<style scoped></style>
