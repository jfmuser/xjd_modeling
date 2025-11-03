<script setup>
import { useRoute, useRouter } from 'vue-router';
import {
    computed,
    onMounted,
    reactive,
    ref,
    watch,
    onBeforeMount,
    onUnmounted,
    nextTick,
} from 'vue';
import { getRunConfigLog, runDataSourceConfig } from '../../../apis/manager/managerApi'
import ListContainer from '@/layouts/ListContainer.vue';
// import { FormType, DataStatus, SourceType } from '@/utils/const';
import ListContainerItem from '@/layouts/ListContainerItem.vue';
import useSecretflowStore from '../../../stores/secretflow/secretflowInfo.store'
import useSiteStore from '../../../stores/dept/site.store';
import * as Base64 from 'js-base64'

const SecretflowStore = useSecretflowStore()
const siteStore = useSiteStore()
let dataStatusInterval;
let needUpload = false;
const router = useRouter();
const DataFormRef = ref(null);
const runConfigForm = ref(null)
const runConfigLogList = ref('');
const action = computed(() => route.query.action);
const dataId = computed(() => route.query.id);
const selfParties = JSON.parse(sessionStorage.getItem('selfParties'))
const authDialogVisible = ref(false)
const route = useRoute();
const state = reactive({
    model: {},
    search: {},
    dataConfig: {},
    runConfig: { mateInfo: [] }
});
const dialogVisible = ref(false)
const rules = reactive({
    tableName: [
        { required: true, message: '请填写数据表名', trigger: 'blur' },
        { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
    ],
    namespace: [
        { required: true, message: '请填写命名空间', trigger: 'blur' },
        { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
    ]
})

const tableTypeList = [
    { value: 'int', label: 'integer' },
    { value: 'float', label: 'float' },
    { value: 'str', label: 'string' },
]

watch(
    () => dataId.value,
    async () => {
        await nextTick();
        needUpload = true;
        await fetchData();
        getDataStatus();
    },
    {
        immediate: false,
    },
);

onBeforeMount(async () => {
    if (dataStatusInterval) {
        clearInterval(dataStatusInterval);
    }
    await fetchData();
});


onUnmounted(() => {
    clearInterval(dataStatusInterval);
});

function getDataStatus() {
    if (needUpload && !dataStatusInterval) {
        dataStatusInterval = setInterval(() => {
            setTimeout(() => {
                fetchData();
            }, 0);
        }, 3000);
    }
}

async function fetchData() {
    try {
        needUpload = false;
        state.loading = true;
        for (let i = 0; i < SecretflowStore.dataSourceList.length; i++) {
            if (SecretflowStore.dataSourceList[i].id === dataId.value) {
                state.model = SecretflowStore.dataSourceList[i]

                state.dataConfig = JSON.parse(state.model.dataConfig)
                state.dataConfig.dbName = state.dataConfig.dbName && Base64.decode(state.dataConfig.dbName)
                state.dataConfig.dbPort = state.dataConfig.dbPort && Base64.decode(state.dataConfig.dbPort)
                state.dataConfig.dbUsername = state.dataConfig.dbUsername && Base64.decode(state.dataConfig.dbUsername)
                state.dataConfig.dbSql = state.dataConfig.dbSql && Base64.decode(state.dataConfig.dbSql)
                state.dataConfig.mppbName = state.dataConfig.mppbName && Base64.decode(state.dataConfig.mppName)
                state.dataConfig.dbPort = state.dataConfig.mppPort && Base64.decode(state.dataConfig.mppPort)
                state.dataConfig.mppUsername = state.dataConfig.mppUsername && Base64.decode(state.dataConfig.mppUsername)
                state.dataConfig.mppSql = state.dataConfig.mppSql && Base64.decode(state.dataConfig.mppSql)
            }
        }
        const { records } = await getRunConfigLog(dataId.value)
        runConfigLogList.value = records
    } finally {
        state.loading = false;
    }
}

function closeDialog() {
    authDialogVisible.value = false
}

function openDialog() {
    // SecretflowDataAuthRef.value.init()
    // authDialogVisible.value = true
    dialogVisible.value = true
}

function resetForm() {
    state.runConfig = {mateInfo: []}
    dialogVisible.value = false
}

async function onSubmit(formEl) {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
    if (valid) {
        try {
            const reg = /^[0-9a-zA-Z_-]*$/
            state.runConfig.mateInfo.forEach(item => {
                if (!reg.test(item.featureName)) {
                    // ElMessage.error('特征名称只能为英文格式')
                    throw new Error('特征名称只能为英文格式')
                } else if (item.featureName.length > 30) {
                    
                    throw new Error('特征名称最多只能30个字符')
                }
                if (item.featureDescription && item.featureDescription.length > 50) {
                    
                    throw new Error('特征描述最多只能50个字符')
                }
            })
            await runDataSourceConfig({ ...state.runConfig, configId: dataId.value })
            ElMessage({
                message: '运行成功.',
                type: 'success',
            })
            dialogVisible.value = false
          fetchData()
          resetForm()
        } catch (error) {
            ElMessage.error(`${error}`)
        }
    } else {
        console.log('error submit!', fields)
    }
  })
}

// function verify() {
// }

function addMateInfo() {
    state.runConfig.mateInfo.push({})
}
</script>

<template>
    <ListContainer loading="state.loading" title="数据详情">
        <template #header-tool>
            <el-button type="text" @click="openDialog">数据源运行</el-button>
        </template>
        <ListContainerItem title="基本信息">
            <el-form ref="FormRef" :model="state.model" label-width="120px" :inline="true">
                <el-form-item label="数据名称" prop="datatableName">
                    <el-input v-model="state.model.dataName" placeholder="数据名称" :disabled="true" />
                </el-form-item>
                <el-form-item label="数据类型" prop="dataType">
                    <el-input v-model="state.model.dataType" placeholder="数据类型" :disabled="true" />
                </el-form-item>
                <el-form-item label="数据库名称" prop="dbName" v-if="state.dataConfig?.dbName">
                    <el-input v-model="state.dataConfig.dbName" placeholder="数据库名称" :disabled="true" />
                </el-form-item>
                <el-form-item label="数据库用户名" prop="dbUsername" v-if="state.dataConfig?.dbUsername">
                    <el-input v-model="state.dataConfig.dbUsername" type="textarea" autosize placeholder=""
                        :disabled="true" />
                </el-form-item>
                <el-form-item label="数据库密码" prop="dbPassword" v-if="state.dataConfig?.dbPassword">
                    <el-input v-model="state.dataConfig.dbPassword" type="password" autosize placeholder=""
                        :disabled="true" />
                </el-form-item>
                <el-form-item label="数据库查询语句" prop="dbSql" v-if="state.dataConfig?.dbSql">
                    <el-input v-model="state.dataConfig.dbSql" autosize placeholder="" type="password" :disabled="true" />
                </el-form-item>
                <el-form-item label="数据库连接信息" prop="dbPort" v-if="state.dataConfig?.dbPort">
                    <el-input v-model="state.dataConfig.dbPort" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="kafka密码" prop="kafkaPassword" v-if="state.dataConfig?.kafkaPassword">
                    <el-input v-model="state.dataConfig.kafkaPassword" placeholder="kafka密码" type="password"
                        :disabled="true" />
                </el-form-item>
                <el-form-item label="kafka端口" prop="description" v-if="state.dataConfig?.kafkaPort">
                    <el-input v-model="state.dataConfig.kafkaPort" type="textarea" autosize placeholder=""
                        :disabled="true" />
                </el-form-item>
                <el-form-item label="kafka连接" prop="dataCheckState" v-if="state.dataConfig?.kafkaUrl">
                    <el-input v-model="state.dataConfig.kafkaUrl" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="kafka用户名" prop="dataCheckState" v-if="state.dataConfig?.kafkaUsername">
                    <el-input v-model="state.dataConfig.kafkaUsername" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="mpp数据库名" prop="mppName" v-if="state.dataConfig?.mppName">
                    <el-input v-model="state.dataConfig.mppName" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="mpp密码" prop="mppPassword" v-if="state.dataConfig?.mppPassword">
                    <el-input v-model="state.dataConfig.mppPassword" autosize type="password" placeholder=""
                        :disabled="true" />
                </el-form-item>
                <el-form-item label="mpp端口" prop="mppPort" v-if="state.dataConfig?.mppPort">
                    <el-input v-model="state.dataConfig.mppPort" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="mpp查询语句" prop="mppSql" v-if="state.dataConfig?.mppSql">
                    <el-input v-model="state.dataConfig.mppSql" type="password" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="mpp连接" prop="mppUrl" v-if="state.dataConfig?.mppUrl">
                    <el-input v-model="state.dataConfig.mppUrl" autosize placeholder="" :disabled="true" />
                </el-form-item>
                <el-form-item label="mpp数据库用户名" prop="mppUsername" v-if="state.dataConfig?.mppUsername">
                    <el-input v-model="state.dataConfig.mppUsername" autosize placeholder="" :disabled="true" />
                </el-form-item>
            </el-form>
        </ListContainerItem>
        <ListContainerItem title="执行配置记录列表">
            <el-table :data="runConfigLogList" style="width: 100%">
                <el-table-column prop="tableName" label="表名" />
                <el-table-column prop="namespace" label="命名空间" />
                <el-table-column prop="platform" label="引擎名称">
                    <template #default="{row}">
                        {{ selfParties?.tDomainEngineList?.find(engine => engine.engine == row.platform).name }}
                    </template>
                </el-table-column>
                <el-table-column prop="remarks" label="描述" />
                <el-table-column prop="status" label="状态" />
            </el-table>
        </ListContainerItem>
    </ListContainer>
    <el-dialog v-model="dialogVisible" title="执行配置" @close="resetForm">
        <el-form ref="runConfigForm" :model="state.runConfig" :rules="rules" label-width="120px">
            <el-form-item label="数据表名" prop="tableName">
                <el-input v-model="state.runConfig.tableName" placeholder="请填写数据表名" />
            </el-form-item>
            <el-form-item label="表头信息" prop="mateInfo">
                <el-descriptions title="" direction="vertical">
                    <el-descriptions-item label="特征名称">

                        <el-input v-model="item.featureName" placeholder="请填写特征名称"
                            v-for="(item, index) in state.runConfig.mateInfo" style="margin: 4px 0;padding: 0 4px;"
                            :key="index"/>

                    </el-descriptions-item>
                    <el-descriptions-item label="类型">
                        <el-select v-model="item.featureType" class="m-2" placeholder="请选择"
                            v-for="(item, index) in state.runConfig.mateInfo" :key="index"
                            style="margin: 4px 0;padding: 0 4px;">
                            <el-option v-for="item in tableTypeList" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-descriptions-item>
                    <el-descriptions-item label="描述(可选)">
                        <el-input v-model="item.featureDescription" placeholder="请输入"
                            v-for="(item, index) in state.runConfig.mateInfo" :key="index"
                            style="margin: 4px 0;padding: 0 4px;" />
                    </el-descriptions-item>
                </el-descriptions>
                <el-button type="text" @click="addMateInfo">添加</el-button>

            </el-form-item>
            <el-form-item label="内置引擎" prop="dataType">
                <el-select v-model="state.runConfig.platform" style="width: 100%" :teleported="false">
                    <el-option :label="engine.name" :value="engine.engine"
                        v-for="engine in siteStore.mySite.tDomainEngineList" :key="engine.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="命名空间" prop="namespace" v-if="state.runConfig.platform == '0'">
                <el-input v-model="state.runConfig.namespace" placeholder="命名空间" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="onSubmit(runConfigForm)">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped></style>
