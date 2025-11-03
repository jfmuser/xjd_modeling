<template>
    <el-dialog v-model="props.authDialogVisible" :title="`「${dataName}」授权管理`" width="720px" @close="resetDialog">
        <el-descriptions :column="5">
            <el-descriptions-item>已授权项目</el-descriptions-item>
            <!-- <el-descriptions-item v-if="core === 'SECRETFLOW'">关联键</el-descriptions-item>
            <el-descriptions-item v-if="core === 'SECRETFLOW'">标签列</el-descriptions-item> -->
            <el-descriptions-item>授权时间</el-descriptions-item>
            <el-descriptions-item>操作</el-descriptions-item>
        </el-descriptions>
        <el-button plain style="width: 100%;" size="small" @click="addNewAuthProject">+
            添加授权</el-button>
        <div class="auth-info" v-for="(project, i) in newAuthProjectList" :key="i">
            <div class="item" style="width: 160px;">
                <el-select v-model="project.projectId" class="m-2" placeholder="授权项目">
                    <el-option v-for="item in allProject" :key="item.projectId" :label="item?.projectName || item.name"
                        :value="item.id" />
                </el-select>
            </div>
            <!-- <div class="item" style="width: 140px;" v-if="core === 'SECRETFLOW'">
                <el-select v-model="project.key" class="m-2" placeholder="关键键">
                    <el-option v-for="item in authProjectList.schema" :key="item.colName" :label="item.colName"
                        :value="item.colName" />
                </el-select>
            </div>
            <div class="item" style="width: 140px;" v-if="core === 'SECRETFLOW'">
                <el-select v-model="project.label" class="m-2" placeholder="标签列">
                    <el-option label="无" :value="true" />
                    <el-option v-for="item in authProjectList.schema" :key="item.colName" :label="item.colName"
                        :value="item.colName" />
                </el-select>
            </div> -->
            <div class="item" v-if="core == '1'">
                --
            </div>
            <div class="item" style="width: 120px;">
                <el-space wrap spacer="|">
                    <div>
                        <el-button type="text" @click="addAuth(project, i)">保存</el-button>
                    </div>
                    <div>
                        <el-button type="text" @click="() => newAuthProjectList.splice(i, 1)">取消</el-button>
                    </div>
                </el-space>
            </div>
        </div>
        <div class="auth-info" v-for="item in authProjectList.authProjects" :key="item.projectId">
            <div class="item" style="width: 180px;">
                {{ item.project?.projectName || item.name }}
            </div>
            <!-- <div class="item" style="width: 140px;margin-left: 15px;" v-if="core === 'SECRETFLOW'">
                {{ item.associateKeys[0] }}
            </div>
            <div class="item" style="width: 140px;" v-if="core === 'SECRETFLOW'">
                {{ item.labelKeys[0] }}
            </div> -->
            <div class="item" style="width: 180px;">
                {{ item.createdTime || formatTimestamp(item.gmtCreate) }}
            </div>
            <div class="item" style="width: 120px;">
                <el-space wrap>
                    <div>
                        <el-popconfirm :title="`你确定要取消对「${item.project?.projectName || item.name}」的授权吗?`"
                            @confirm="delAuthProject(item)">
                            <template #reference>
                                <el-button type="text">取消授权</el-button>
                            </template>
                        </el-popconfirm>
                    </div>
                </el-space>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getDatatable, listProject, addProjectDatatable, deleteProjectDatatable } from '../../apis/secretflow/secretflow.api'
import { formatTimestamp } from '../../utils'
import { queryAllProject, createProjectAuth, queryDataAuth, delDataAuth ,queryDataObject} from '../../apis/manager/managerApi'
import { createTeeDataProjectAuth } from '../../apis/data/data.api'
import { getProjectById } from '../../apis/workspace/project.api'
import useAuthStore from '../../stores/auth.store'

const route = useRoute()

const emit = defineEmits(['close'])
const props = defineProps({
    authDialogVisible: {
        type: Boolean,
        required: true
    }
})
const authStore = useAuthStore()
const core = computed(() => {
    return route.query.core
})

onBeforeMount(async () => {
    init()
    if (core.value == '1') {
        allProject.value = await listProject({})

    } else {
        // if(!authStore.IsUKey) return
        const { records } = await queryAllProject({
            "pageRequest": {
                "pageNumber": 1,
                "pageSize": 999
            }
        })
        allProject.value = records
    }
    // await createCanvasProject({ participants: ["1", "2"], platform: 'SECRETFLOW', secretPadGraphId: '1', secretPadProjectId: '1', projectName: 'text' })
})

const dataName = computed(() => route.query.dataName)
const datatableId = computed(() => route.query.datatableId);
const nodeId = computed(() => route.query.nodeId);
const dataId = computed(() => route.query.id);
const type = computed(() => route.query.type);
const projectInfo = ref({})

const newAuthProjectList = ref([])
const authProjectList = ref([])
const allProject = ref([])

async function init() {
    // if (core.value === 'SECRETFLOW') {
    // authProjectList.value = await getDatatable({ datatableId: datatableId.value, nodeId: nodeId.value })
    // authProjectList.value.authProjects = authProjectList.value.authProjects?.reverse()
    // console.log(authProjectList.value.authProjects,'authProjectList.value.authProjects');
    // } else {
    authProjectList.value = await queryDataAuth(dataId.value)
    authProjectList.value.authProjects = authProjectList.value
    // }
}

async function addAuth(project, index) {
//     if (core.value === '3') {
//         console.log(project, 'KKKOOOOOKKKOO');
// const res = await queryDataObject(dataId.value)
//         await createTeeDataProjectAuth({
//             "dataName": dataName.value,
//             "columns": [
//                 res.mates
//             ],
//             "opNames": [
//                 "psi",
//                 "train_test_split",
//                 "xgb_train",
//                 "xgb_predict",
//                 "biclassification_eval"
//             ]
//         })
//     } else {
        await createProjectAuth({
            projectId: project.projectId,
            dataId: dataId.value
        })
    // }


    ElMessage({
        message: '授权成功',
        type: 'success',
    })
    init()
    newAuthProjectList.value.splice(index, 1)
}

function addNewAuthProject() {
    newAuthProjectList.value.push({
        projectId: undefined,
        key: undefined,
        label: undefined
    })
}

async function delAuthProject(project) {
    // if (core.value === 'SECRETFLOW') {
    // await deleteProjectDatatable({ datatableId: datatableId.value, nodeId: nodeId.value, projectId: project.projectId })
    // } else {
    console.log(project, 'PROJECT');
    await delDataAuth({ id: project.id })
    // }
    ElMessage({
        message: '取消成功',
        type: 'success',
    })
    init()
}

function resetDialog() {
    newAuthProjectList.value = []
    authProjectList.value = []
    emit('close')
}

defineExpose({ init })
</script>

<style lang="scss" scoped>
.auth-info {
    display: flex;
    padding: 3px 0;
    border-bottom: 1px solid #eee;
    justify-content: space-between;

    .item {
        display: flex;
        overflow: hidden;
        box-sizing: border-box;
        align-items: center;
        padding: 0 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>