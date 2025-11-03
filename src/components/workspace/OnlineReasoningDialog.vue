<script setup>
import { reactive, ref, computed , watch} from 'vue';
import { onLineReasoning } from '../../apis/workspace/model.api';
import { ElMessage } from 'element-plus';
import { useRoute} from 'vue-router'
import useSiteStore from '../../stores/dept/site.store';

const route = useRoute()

const props = defineProps({
  authDataList: {
    type: Array,
    required: true
  }
})

const siteStore = useSiteStore()
const formRef = ref(null);
const mainKey = ref('')
const mainKeyValue = ref('')
const state = reactive({
  visible: false,
  loading: false,
  formModel: {},
    namespace: [],
  hostNamespace: [],
  hostTableName: [],
  rules: {
    featureData: [
      { required: true, message: '请输入数据', trigger: 'change' },
    ],
  },
});
const tableData = ref([])
const headers = ref([])
const dialogVisible = ref(false)
const title = computed(() => `在线推理`);

watch(() => props.authDataList,(newVal) => {
  state.namespace = []
  state.guestTableName = []
  state.hostTableName = []
  getNamespace()
}, {
  immediate:true
})

const onClose = () => {
  formRef.value.resetFields();
  state.hostNamespace = []
  state.hostTableName = []
  state.visible = false;
};

const onConfirm = async () => {
  const isValid = await formRef.value.validate().catch(() => {
  });
  if (!isValid) {
    return;
  }
  try {
    state.formModel.sendToRemoteFeatureData = {
      namespace: state.formModel.hostNamespace,
      table: state.formModel.hostTableName,
    }
    state.formModel.sendToRemoteFeatureData[mainKey.value] = mainKeyValue.value
    state.formModel.sendToRemoteFeatureData = JSON.stringify(state.formModel.sendToRemoteFeatureData)
    const onLineReasoningData = await onLineReasoning(state.formModel);
      tableData.value = []
    tableData.value.push(onLineReasoningData)
    headers.value = Object.keys(onLineReasoningData)
      dialogVisible.value = true
    ElMessage.success('推理成功');
    mainKey.value = ''
    mainKeyValue.value = ''
  } catch (e) {
    console.error(e);
    // ElMessage.error(e || '推理失败');
  } finally {
    onClose();
  }
};

async function selectHostTableName() {
   props.authDataList.forEach(item => {
     if (item.namespace === state.formModel.hostNamespace && siteStore.mySite.id != item.dataFromId) {
            state[`hostTableName`].push({
                label: item.name,
                value: item.name
            })
        }
   })
}

function show(data) {
  state.formModel = {
    ...data, featureData:
      `{
        x0: -1.759254,
        x1: -2.026241,
        x2: -1.771397,
        x3: -1.815799,
        x4: -0.924674
      }`,
    // sendToRemoteFeatureData:
    //   `{
    //     id: "123"
    //  }`,
  };
  state.visible = true;
}

/**
 * @description 处理项目授权数据，获取命名空间
*/
function getNamespace() {
props.authDataList.forEach(item => {
                if (!state.namespace.some(namespace => namespace === item.namespace)) {
                    state.namespace.push(item.namespace)
                }
})
}

defineExpose({ show });
</script>
<template>
  <el-dialog v-if='state.visible' :model-value='true' width='550px' :before-close='onClose' :title='title'>
    <el-form ref='formRef' v-loading='state.loading' :model='state.formModel' label-width='100px' :rules='state.rules'>
      <el-form-item prop='featureData' label='输入数据'>
        <el-input v-model='state.formModel.featureData' size='small' type='textarea' autosize maxlength='255' />
      </el-form-item>
      <el-form-item label='发送远程特征数据'>
        <!-- <el-input v-model='state.formModel.sendToRemoteFeatureData' size='small' type='textarea' autosize
          maxlength='255' /> -->
        <el-input v-model="mainKey" placeholder="请输入主键Key" size="small" />
        <el-input v-model="mainKeyValue" placeholder="请输入主键值" size="small" />
      </el-form-item>
      <el-form-item label='他方数据'>
        <el-select v-model='state.formModel.hostNamespace' placeholder='请选择命名空间' @change='selectHostTableName'>
          <el-option v-for='item in state.namespace' :key='item' :value='item' :label='item'>
          </el-option>
        </el-select>
        <el-select v-model='state.formModel.hostTableName' placeholder='请选择表名'>
          <el-option v-for='item in state.hostTableName' :key='item.value' :value='item.value' :label='item.label'>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label='' v-if="route.query.multi === 'true'">
        <el-select v-model='state.formModel.hostNamespace' placeholder='请选择命名空间' @change='selectHostTableName'>
          <el-option v-for='item in state.namespace' :key='item' :value='item' :label='item'>
          </el-option>
        </el-select>
        <el-select v-model='state.formModel.hostTableName' placeholder='请选择表名'>
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
  <!-- 展示在线推理结果 -->
   <el-dialog
    v-model="dialogVisible"
    title="在线推理结果展示"
    width="900px"
    :before-close="handleClose"
  >
   <el-table :data="tableData" style="width: 900px">
    <el-table-column :prop="head" :label="head" v-for="(head,i) in headers" :key="i"/>
  </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style scoped></style>
