//通用
<script setup>
import * as Base64 from 'js-base64';
import { reactive, ref, onMounted, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { useRoute } from 'vue-router';
import ListContainer from '../../../layouts/ListContainer.vue';
import {
  getHiveTables,
} from '../../../apis/workspace/data.api';
import { analysisCsv, parseDataTableColumns } from '../../../utils'
// import { secretflowCreateData } from '../../../apis/secretflow/secretflow.api'
import { creationData, getDataTypes, createDataSource, uploadGoData } from '../../../apis/manager/managerApi'
import { parseCsv } from '../../../apis/data/data.api'
// 签名方法
import useGetConfig from "@/utils/changeParams"
import { getCsvHead } from '../../../apis/secretflowApi/secretflow.api'


const props = defineProps({
  nodeList: { type: Array, default: [] }
})
const route = useRoute()
const DataFormRef = ref(null);
const token = localStorage.getItem('token')

const state = reactive({
  visible: false,
  loading: false,
  model: {},
  dataTypes: [],
  uploadWay: 0,
  selectFileName: '',
  hiveDbs: []
});
const rules = reactive({
  dataName: [
    { required: true, message: '请输入数据名称', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_.]*$/g, message: '数据名称只能为英文格式', trigger: 'blur' },
    { max: 30, message: '最多只能输入30个字符', trigger: 'change' },
  ],
  core: [
    { required: true, message: '请选择内置引擎', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'blur' },
  ],
  dataPartitions: [
    { required: true, message: '请填写分区数', trigger: 'blur' },
    { pattern: /^[0-9]+$/g, message: '分区数只能为正整数', trigger: 'change' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  namespace: [
    { required: true, message: '请填写命名空间', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '命名空间只能为英文格式', trigger: 'blur' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  dbUrl: [
    { required: true, message: '请填写数据库地址', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_.-]*$/g, message: '请输入正确的数据库地址', trigger: 'change' },
    { max: 50, message: '最多只能输入50个字符', trigger: 'change' }
  ],
  dbPort: [
    { required: true, message: '请填写数据库端口', trigger: 'blur' },
    { pattern: /^[0-9]\d*$/, message: '请输入正确的端口号', trigger: 'change' },
    { max: 8, message: '最多只能输入8个字符', trigger: 'change' }
  ],
  dbName: [
    { required: true, message: '请填写数据库名称', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '请输入正确的数据库名称', trigger: 'change' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  dbUsername: [
    { required: true, message: '请填写数据库用户名', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '请输入正确的数据库用户名', trigger: 'change' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  dbPassword: [
    { required: true, message: '请填写数据库密码', trigger: 'blur' },
    // { pattern: /^[0-9a-zA-Z_]*$/g, message: '数据库密码只能为英文', trigger: 'change' },
    { max: 26, message: '最多只能输入26个字符', trigger: 'change' }
  ],
  tableName: [
    { required: true, message: '请填写查询语句', trigger: 'blur' },
    // { pattern: /^[0-9a-zA-Z_* ]*$/g, message: '查询语句只能为英文格式', trigger: 'blur' },
  ],
  mppUrl: [
    { required: true, message: '请填写数据库地址', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_.-]*$/g, message: '请输入正确的数据库地址', trigger: 'change' },
    { max: 50, message: '最多只能输入50个字符', trigger: 'change' }
  ],
  mppPort: [
    { required: true, message: '请填写数据库端口', trigger: 'blur' },
    { pattern: /^[0-9]\d*$/, message: '请输入正确的端口号', trigger: 'blur' },
    { max: 8, message: '最多只能输入8个字符', trigger: 'change' }
  ],
  mppName: [
    { required: true, message: '请填写数据库名称', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '数据库名称只能为英文格式', trigger: 'blur' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  mppUsername: [
    { required: true, message: '请填写数据库用户名', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '数据库用户名只能为英文格式', trigger: 'blur' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  mppPassword: [
    { required: true, message: '请填写数据库密码', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '数据库密码只能为英文格式', trigger: 'change' },
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  mppSql: [
    { required: true, message: '请填写查询语句', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z_* ]*$/g, message: '查询语句只能为英文格式', trigger: 'change' },
  ],

})

const isDataSource = computed(() => {
  if (route.query.type) {
    return route.query.type
  } else {
    return location.href.includes('dataSource') ? 'dataSource' : 'data'
  }
  // return route.query.type ?? location.href.includes('data-source') ? 'data-source' : 'data'
})
const hashUrl = location.hash
const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))

const formData = ref(new FormData())
const secretflowData = reactive({
  schemaTypeList: [
    { value: 'int', label: 'integer' },
    { value: 'float', label: 'float' },
    { value: 'str', label: 'string' },
  ],
  isShow: true
})



const uploadHeaders = computed(() => {
  return {
    authorization: localStorage.getItem('token'),
  };
});


function show(data) {
  if (data) {
    state.model = data;
  }
  state.visible = true;
}

defineExpose({ show });
const emits = defineEmits(['done']);

onMounted(async () => {
  await fetchDataTypes();
  await fetchHiveDbs();
});

//获取下拉框信息
async function fetchDataTypes() {
  try {
    state.dataTypes = await getDataTypes();
    state.dataTypes = state.dataTypes.filter(item => {
      return item.code === '1' || item.code === '5'
    })
  } catch (error) {
    console.error(error);
  }
}

//获取下拉框信息
async function fetchHiveTables(id) {
  try {
    state.hiveTables = await getHiveTables(id);
  } catch (error) {
    console.error(error);
  }
}


//获取下拉框信息
async function fetchHiveDbs() {
  try {
    // state.hiveDbs = await getHiveDbs();
  } catch (error) {
    console.error(error);
  }
}

function onUploadSuccess(response, file) {
  state.model.uploadPath = response;
  state.selectFileName = file.name;
  DataFormRef.value.validateField('file');

}

function onClose() {
  DataFormRef.value.resetFields();
  secretflowData.renderCavList = []
  state.visible = false;
  state.model.namespace = ''
  secretflowData.isShow = true
}
// 保存
async function onConfirm() {
  let res;
  try {
    let isValid = await DataFormRef.value.validate().catch(() => { });
    if (!isValid) {
      return;
    }
    const dataModel = { ...state.model };

    // 类型为mysql时以及其他数据库类型都走
    if (state.model.dataType == 1 || state.model.dataType == 2) {
      dataModel.dataName = state.model.dataName;
      dataModel.dataType = state.model.dataType;
      dataModel.head = state.model.head;
      dataModel.dataPartitions = state.model.dataPartitions;
      dataModel.namespace = state.model.namespace;
      dataModel.dbUrl = Base64.encode(state.model.dbUrl);
      dataModel.dbName = Base64.encode(state.model.dbName);
      dataModel.dbPort = Base64.encode(state.model.dbPort);
      dataModel.dbPassword = Base64.encode(state.model.dbPassword);
      dataModel.dbUsername = Base64.encode(state.model.dbUsername);
      dataModel.dbSql = Base64.encode(state.model.tableName);
      // dataModel.dbUrl = window.btoa(state.model.dbUrl);
      // dataModel.dbName = window.btoa(state.model.dbName);
      // dataModel.dbPort = window.btoa(state.model.dbPort);
      // dataModel.dbPassword = window.btoa(state.model.dbPassword);
      // dataModel.dbUsername = window.btoa(state.model.dbUsername);
      // dataModel.tableName = window.btoa(state.model.tableName);
    } else if (state.model.dataType == 3) {
      dataModel.dataName = state.model.dataName;
      dataModel.dataType = state.model.dataType;
      dataModel.head = state.model.head;
      dataModel.dataPartitions = state.model.dataPartitions;
      dataModel.namespace = state.model.namespace;
      dataModel.dbUrl = state.model.dbUrl;
      dataModel.dbPort = state.model.dbPort;
      dataModel.dbPassword = state.model.dbPassword;
      dataModel.dbUsername = state.model.dbUsername;
      dataModel.dbSql = Base64.encode(state.model.tableName);
    } else if (state.model.dataType == 5) {
      dataModel.dataName = state.model.dataName;
      dataModel.dataType = state.model.dataType;
      dataModel.head = state.model.head;
      dataModel.dataPartitions = state.model.dataPartitions;
      dataModel.namespace = state.model.namespace;
      dataModel.mppUrl = Base64.encode(state.model.mppUrl);
      dataModel.mppPort = Base64.encode(state.model.mppPort);
      dataModel.mppPassword = Base64.encode(state.model.mppPassword);
      dataModel.mppUsername = Base64.encode(state.model.mppUsername);
      dataModel.mppName = Base64.encode(state.model.mppName);
      dataModel.mppSql = Base64.encode(state.model.mppSql);;
    } else if (state.model.dataType == 4) {
      // kafka
      dataModel.dataName = state.model.dataName;
      dataModel.dataType = state.model.dataType;
      dataModel.head = state.model.head;
      dataModel.dataPartitions = state.model.dataPartitions;
      dataModel.namespace = state.model.namespace;
      dataModel.numberOfReadBars = state.model.numberOfReadBars;
      dataModel.queueName = state.model.queueName;
      dataModel.kafkaUrl = state.model.kafkaUrl;
      dataModel.kafkaPort = state.model.kafkaPort;
    } else if (state.model.dataType == 6) {

    } else {
      dataModel.dataName = state.model.dataName;
      dataModel.dataType = state.model.dataType;
      dataModel.head = state.model.head;
      dataModel.dataPartitions = state.model.dataPartitions;
      dataModel.namespace = state.model.namespace;
      dataModel.uploadPath = state.model.uploadPath;

      state.loading = true;
      res = await createData(dataModel);
      ElMessage.success('操作成功');
      state.model = {};
      state.selectFileName = '';
      onClose();
      return;
    }

    state.loading = true;
    delete dataModel.tableName
    res = await createDataSource(dataModel);
    ElMessage.success('操作成功');
    // 解决数据重新添加不清空问题
    state.model = {};
    state.selectFileName = '';
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    emits('done', res);
    state.loading = false;
  }
}
// 下拉框选中事件
function selectChanged() { // 这个vId也就是value值
  state.hiveDbs.forEach(item => {
    if (item.hiveDb === state.model.hiveDb) {
      fetchHiveTables(item.hiveDbId)
    }
  })
}

// 限制文件上传的钩子函数
const beforeAvatarUpload = (file) => {
  console.log("file", file);
  var FileExt = file.name.replace(/.+\./, "");
  console.log("FileExt", FileExt);
  // "zip", "rar", "gz", ".apk"
  if (["csv"].indexOf(FileExt.toLowerCase()) === -1) {
    ElNotification({
      title: "文件格式出错",
      message: "文件上传出错,仅支持csv格式",
      type: "error",
    });
    return false;
  }
};

// const rules = reactive({

// })

// async function handleColCsvUpload(file, fileList) {
//   try {
//     console.log(file,'FILEFILEFILE')
//     const csvData = await analysisCsv(file, true)
//     const csvConfig = parseDataTableColumns(csvData)
//     secretflowData.renderCavList = csvConfig?.map((info) => ({
//       featureName: info.col,
//       featureType: info.type,
//       featureDescription: '',
//     }))
//   } catch (error) {
//     ElMessage.error('文件解析失败，请检查csv格式是否符合标准')
//   }
// }

async function success(res) {
  state.realName = res.data.realName
  state.name = res.data.name
  state.realPath = res.data.realName
  if (state.model.core == '1') {
    const csvConfig = await getCsvHead({ name: res.data.name })
    secretflowData.renderCavList = csvConfig?.map((info) => ({
      featureName: info.featureName,
      featureType: info.featureType,
      featureDescription: '',
    }))
    secretflowData.isShow = false
  } else if (state.model.core == '3') {
    state.realName = res.data.realPath
    state.name = res.data.dataName
    state.realPath = res.data.realPath
    console.log(res, 'D');

    const csvConfig = await parseCsv({ dataName: res.data.dataName })
    // const csvConfig = await getCsvHead({ dataName: res.data.dataName })
    console.log(csvConfig, 'csvConfig');

    secretflowData.renderCavList = csvConfig?.map((info) => ({
      featureName: info.featureName,
      featureType: info.featureType,
      featureDescription: '',
    }))
    secretflowData.isShow = false
  } else if (state.model.core == '4') {
    state.realPath = res.data.realPath
    state.realName = res.data.realPath
  }
}

async function onSecretflowConfirm(formEl) {
  if (!formEl) return
  // if (secretflowData.isShow) return ElMessage.error('请上传csv文件')
  // const reg = /^[0-9a-zA-Z_-]*$/
  secretflowData?.renderCavList?.forEach(item => {
    // if (!reg.test(item.featureName)) {
    //   ElMessage.error('特征名称只能为英文格式')
    //   throw new Error('特征名称只能为英文格式')
    // } else
    if (item.featureName.length > 30) {
      ElMessage.error('特征名称最多只能30个字符')
      throw new Error('特征名称最多只能30个字符')
    }
    if (item.featureDescription.length > 50) {
      ElMessage.error('特征描述最多只能50个字符')
      throw new Error('特征描述最多只能50个字符')
    }
  })
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      let res

      if (state.model.core == "2") {
        // const formData = new FormData()
        formData.value.set("name", state.model.dataName)
        formData.value.set("platform", state.model.core)
        formData.value.set("desc", state.model.description ?? '')
        res = await uploadGoData(formData.value)
      }  else {
        res = await creationData({
          realName: state.realName,
          realPath: state.realPath,
          data: {
            name: state.model.dataName,
            platform: state.model.core,
            namespace: state.model.namespace,
            mates: secretflowData.renderCavList
          }
        })
        state.realName = ''
        state.realPath = ''
      }
      onClose()
      emits('done', res);
      state.visible = false
    } else {
      console.log('提交失败', fields);

    }
  })

}

/**
 * @description GO类型下 上传文件时调用
*/
async function uploadChange(uploadFile) {
  console.log(uploadFile);

  formData.value.set("file", uploadFile)
  secretflowData.isShow = false
  return false
}

</script>
<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" title="添加数据" width="600px">
    <ListContainer>
      <!-- state.model.dataName state.model.dataType state.model.dataPartitions state.model.remarks-->
      <el-form ref="DataFormRef" :model="state.model" label-width="100px" :rules="rules">
        <el-form-item label="数据名称" prop="dataName">
          <el-input v-model="state.model.dataName" placeholder="请输入英文数据名称" />
        </el-form-item>
        <!-- 需要修改的地方 -->
        <el-form-item label="内置引擎" prop="core" v-if="isDataSource === 'data' || !hashUrl.includes('dataSource')">
          <!-- 默认选择下拉框数据 -->
          <el-select v-model="state.model.core" style="width: 100%">
            <el-option :label="engine.name" :value="engine.engine" v-for="engine in selfParties.tDomainEngineList"
              :key="engine.id" />
          </el-select>
        </el-form-item>
        <template v-if="isDataSource === 'dataSource' || hashUrl.includes('dataSource')">
          <el-form-item label="数据类型" prop="dataType">
            <!-- 默认选择下拉框数据 -->
            <el-select v-model="state.model.dataType" style="width: 100%">
              <el-option v-for="item in state.dataTypes" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否有表头" prop="head">
            <el-switch v-model="state.model.head" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="分区数" prop="dataPartitions">
            <el-input v-model="state.model.dataPartitions" />
          </el-form-item>
          <el-form-item label="命名空间" prop="namespace">
            <el-input v-model="state.model.namespace" />
          </el-form-item>
          <template v-if="state.model.dataType == 0">
            <el-form-item label="文件路径">
              <el-switch v-model="state.uploadWay" :active-value="1" :inactive-value="0" active-text="输入路径"
                inactive-text="" />
              <el-upload v-if="state.uploadWay === 0" action="/fate-api/api/uploadFile" :on-success="onUploadSuccess"
                :show-file-list="false" accept=".csv" :headers="uploadHeaders" :before-upload="beforeAvatarUpload">
                <el-button type="primary">点击上传</el-button>
                <span v-if="state.selectFileName" style="margin-left: 1rem">
                  {{ state.selectFileName }}
                </span>
              </el-upload>
              <el-input v-else v-model="state.model.filePath" />
            </el-form-item>
          </template>
          <!-- <template v-if="state.model.dataType === 0">
                    <el-form-item label="文件路径">
                      <el-input v-model="state.model.filePath" />
                    </el-form-item>
                  </template> -->
          <!-- ||state.model.dataType === 3||state.model.dataType === 4||state.model.dataType === 6 -->
          <template v-else-if="state.model.dataType == 1 || state.model.dataType == 2">
            <el-form-item label="数据库地址" prop="dbUrl">
              <el-input v-model="state.model.dbUrl" />
            </el-form-item>
            <el-form-item label="数据库端口" prop="dbPort">
              <el-input v-model="state.model.dbPort" />
            </el-form-item>
            <el-form-item label="数据库名称" prop="dbName">
              <el-input v-model="state.model.dbName" />
            </el-form-item>
            <el-form-item label="数据库用户名" prop="dbUsername">
              <el-input v-model="state.model.dbUsername" />
            </el-form-item>
            <el-form-item label="数据库密码" prop="dbPassword">
              <el-input v-model="state.model.dbPassword" type="password" />
            </el-form-item>
            <el-form-item label="查询语句" prop="tableName">
              <el-input v-model="state.model.tableName" />
            </el-form-item>
          </template>
          <template v-else-if="state.model.dataType == 3">
            <el-form-item label="数据库地址" prop="dbUrl">
              <el-input v-model="state.model.dbUrl" />
            </el-form-item>
            <el-form-item label="数据库端口" prop="dbPort">
              <el-input v-model="state.model.dbPort" />
            </el-form-item>
            <el-form-item label="数据库用户名" prop="dbUsername">
              <el-input v-model="state.model.dbUsername" />
            </el-form-item>
            <el-form-item label="数据库密码" prop="dbPassword">
              <el-input v-model="state.model.dbPassword" type="password" />
            </el-form-item>

            <el-form-item label="查询语句" prop="tableName">
              <el-input v-model="state.model.tableName" />
            </el-form-item>
          </template>
          <!-- kafka数据库 -->
          <template v-else-if="state.model.dataType == 4">
            <el-form-item label="行数" prop="numberOfReadBars">
              <el-input v-model="state.model.numberOfReadBars" />
            </el-form-item>
            <el-form-item label="队列名" prop="queueName">
              <el-input v-model="state.model.queueName" />
            </el-form-item>
            <!-- <el-form-item label="kafkaUsername" prop="kafkaUsername">
                      <el-input v-model="state.model.kafkaUsername" />
                    </el-form-item> -->
            <el-form-item label="kafka地址" prop="kafkaUrl">
              <el-input v-model="state.model.kafkaUrl" />
            </el-form-item>
            <el-form-item label="kafka端口" prop="kafkaPort">
              <el-input v-model="state.model.kafkaPort" />
            </el-form-item>
          </template>

          <template v-else-if="state.model.dataType == 5">
            <el-form-item label="数据库地址" prop="mppUrl">
              <el-input v-model="state.model.mppUrl" />
            </el-form-item>
            <el-form-item label="数据库端口" prop="mppPort">
              <el-input v-model="state.model.mppPort" />
            </el-form-item>
            <el-form-item label="数据库名称" prop="mppName">
              <el-input v-model="state.model.mppName" />
            </el-form-item>
            <el-form-item label="数据库用户名" prop="mppUsername">
              <el-input v-model="state.model.mppUsername" />
            </el-form-item>
            <el-form-item label="数据库密码" prop="mppPassword">
              <el-input v-model="state.model.mppPassword" type="password" />
            </el-form-item>

            <el-form-item label="查询语句" prop="mppSql">
              <el-input v-model="state.model.mppSql" />
            </el-form-item>
          </template>
          <!--        当数据类型为hive数据库时候-->
          <template v-else-if="state.model.dataType == 6">
            <el-form-item label="数据库" prop="hiveDb">
              <!-- 默认选择下拉框数据 -->
              <el-select @change="selectChanged" v-model="state.model.hiveDb" style="width: 100%">
                <el-option v-for="item in state.hiveDbs" :key="item.hiveDbId" :label="item.hiveDb" :value="item.hiveDb">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="数据表" prop="hiveTable">
              <!-- 默认选择下拉框数据 -->
              <el-select v-model="state.model.hiveTable" style="width: 100%">
                <el-option v-for="item in state.hiveTables" :key="item.tblId" :label="item.hiveTable"
                  :value="item.hiveTable">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="state.model.remarks" />
          </el-form-item>
        </template>
        <!-- 隐语上传框 -->
        <template v-else>
          <!-- <el-form-item label="数据主体">
            <el-select v-model="state.model.subject" class="m-2" placeholder="请选择">
              <el-option v-for="item in props.nodeList" :key="item.value" :label="item.nodeName" :value="item.nodeId" />
            </el-select>
          </el-form-item> -->
          <el-form-item label="命名空间" prop="namespace" v-if="state.model.core == '0'">
            <el-input v-model="state.model.namespace" />
          </el-form-item>
          <!-- <el-form-item label="加密方式" prop="encryption" v-if="state.model.core == '3'">
            <el-select v-model="state.model.encryption" placeholder="加密方式" style="width: 100%">
              <el-option label="RSA" value="RSA" />
            </el-select>
          </el-form-item> -->
          <el-form-item label="描述(选填)">
            <el-input v-model="state.model.description" />
          </el-form-item>
          <!-- TEE上传 -->
          <!-- <el-upload class="upload-demo" drag style="margin-left: 50px;"
            v-if="secretflowData.isShow && state.model.core == '3' && state.model.dataName" :on-success="success"
            :headers="{ authorization: token, timestamp: useGetConfig.getTime() }" action="/data/uploadAndEncrypt"
            :data="{ 'dataName': state.model.dataName }" :limit="1" accept=".csv">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到这里或 <em>单击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
              </div>
            </template>
          </el-upload> -->
          <!-- 隐语上传 -->
          <el-upload class="upload-demo" drag style="margin-left: 50px;"
            v-if="secretflowData.isShow && state.model.core == '1'||secretflowData.isShow && state.model.core == '3'" :on-success="success"
            :headers="{ authorization: token, timestamp: useGetConfig.getTime() }"
            action="/secretflow-api/api/domain-data/uploadToSecretPad" :data="{ 'Node-Id': state.model.subject }"
            :limit="1" accept=".csv">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到这里或 <em>单击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
              </div>
            </template>
          </el-upload>
          <!-- 自研上传 -->
          <el-upload class="upload-demo" drag style="margin-left: 50px;"
            v-if="secretflowData.isShow && state.model.core == '0'"
            :headers="{ authorization: token, timestamp: useGetConfig.getTime() }" :on-success="success"
            action="/innovate-api/api/data/upload" :data="{ 'Node-Id': state.model.subject }" :limit="1" accept=".csv">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到这里或 <em>单击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
              </div>
            </template>
          </el-upload>
          <!-- GO数据上传 -->
          <el-upload class="upload-demo" drag style="margin-left: 50px;" :before-upload="uploadChange"
            :headers="{ authorization: token, timestamp: useGetConfig.getTime() }"
            v-if="secretflowData.isShow && state.model.core == '2'" show-file-list :limit="1" accept=".csv">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到这里或 <em>单击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
              </div>
            </template>
          </el-upload>
          <!-- python数据上传 -->
          <el-upload class="upload-demo" drag style="margin-left: 50px;" action="/python-engine/data/upload"
            :data="{ 'dataName': state.model.dataName }"
            :headers="{ authorization: token, timestamp: useGetConfig.getTime() }" :on-success="success"
            v-if="secretflowData.isShow && state.model.core == '4' && state.model.dataName" show-file-list :limit="1"
            accept=".csv">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到这里或 <em>单击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
              </div>
            </template>
          </el-upload>
          <div class="table-box" v-if="!secretflowData.isShow">
            <div class="table-box_main">
              <el-descriptions title="数据表结构" direction="vertical">
                <el-descriptions-item label="特征名称">

                  <el-input v-model="item.featureName" placeholder="请填写特征名称"
                    v-for="(item, index) in secretflowData.renderCavList" style="margin: 4px 0;padding: 0 4px;"
                    :key="index" />

                </el-descriptions-item>
                <el-descriptions-item label="类型">
                  <el-select v-model="item.featureType" class="m-2" placeholder="请选择"
                    v-for="(item, index) in secretflowData.renderCavList" :key="index"
                    style="margin: 4px 0;padding: 0 4px;">
                    <el-option v-for="item in secretflowData.schemaTypeList" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>

                </el-descriptions-item>
                <el-descriptions-item label="描述(可选)">
                  <el-input v-model="item.featureDescription" placeholder="请输入"
                    v-for="(item, index) in secretflowData.renderCavList" :key="index"
                    style="margin: 4px 0;padding: 0 4px;" />

                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </template>
      </el-form>
    </ListContainer>

    <template #footer>
      <el-button type="primary" @click="onSecretflowConfirm(DataFormRef)" v-if="isDataSource === 'data'">确定</el-button>
      <el-button type="primary" @click="onConfirm(DataFormRef)" v-else>确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
