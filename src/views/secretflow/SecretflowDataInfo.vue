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
import ListContainer from '@/layouts/ListContainer.vue';
// import { FormType, DataStatus, SourceType } from '@/utils/const';
import ListContainerItem from '@/layouts/ListContainerItem.vue';
import secretflowDataForm from '../../components/secretflow/secretflowDataForm.vue';
import useSecretflowStore from '../../stores/secretflow/secretflowInfo.store'
import SecretflowDataAuth from '../../components/secretflow/SecretflowDataAuth.vue';
import { queryDataAuth } from '../../apis/manager/managerApi'
import { getDatatable } from '../../apis/secretflow/secretflow.api'

const SecretflowStore = useSecretflowStore()
let dataStatusInterval;
let needUpload = false;
const router = useRouter();
const DataFormRef = ref(null);
const core = computed(() => route.query.core);
const datatableId = computed(() => route.query.datatableId);
const nodeId = computed(() => route.query.nodeId);
const action = computed(() => route.query.action);
const dataId = computed(() => route.query.id);
const authDialogVisible = ref(false)
const route = useRoute();
const SecretflowDataAuthRef = ref(null)
const state = reactive({
    model: {},
    search: {},
});
const authProjectList = ref('')
const dataStatus = {
    running: '上传中',
    succeeded: '成功',
    failed: '失败'
}

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

onBeforeMount(() => {
    if (dataStatusInterval) {
        clearInterval(dataStatusInterval);
    }
});
onMounted(async () => {
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
        state.model = SecretflowStore.dataList.find(item => item.id === dataId.value)
        for (let i = 0; i < SecretflowStore.dataList.length; i++) {
            if (SecretflowStore.dataList[i] === dataId.value) {
                state.model = SecretflowStore.dataList[i]
                state.model.status = dataStatus[state.model.status]
            }

        }
        // if (core.value === 'SECRETFLOW') {
        //     const data = await getDatatable({ datatableId: datatableId.value, nodeId: nodeId.value })
        //     authProjectList.value = data.authProjects?.reverse()
        // } else {
            authProjectList.value = await queryDataAuth(dataId.value)
        // }
    } finally {
        // if (DataStatus.canUpload(state.model.status)) {
        //     needUpload = true;
        //     DataFormRef.value.refresh();
        // } else {
        //     // DataFormRef.value.refresh();
        // }
        // if (!needUpload && dataStatusInterval) {
        //     clearInterval(dataStatusInterval);
        // }
        // getDataStatus();
        state.loading = false;
    }
}

function closeDialog() {
    authDialogVisible.value = false
    fetchData()
}

function openDialog() {
    SecretflowDataAuthRef.value.init()
    authDialogVisible.value = true
}
</script>

<template>
    <ListContainer loading="state.loading" title="数据详情">
        <template #header-tool>
            <el-button type="text" @click="openDialog" v-if="!!state.model?.name" >数据授权</el-button>
        </template>
        <ListContainerItem title="基本信息">
            <secretflowDataForm ref="DataFormRef" :defaultModel="state.model" :formType="action" :inline="true" />
        </ListContainerItem>
        <ListContainerItem title="授权列表">
            <el-table :data="authProjectList" style="width: 100%">
                <el-table-column prop="name" label="项目名称" width="180">

                    <template #default="{ row }">
                        {{ row.project?.projectName || row.name }}
                    </template>
                </el-table-column>
            </el-table>
        </ListContainerItem>
    </ListContainer>
    <SecretflowDataAuth ref="SecretflowDataAuthRef" :authDialogVisible="authDialogVisible" @close="closeDialog" />
</template>

<style scoped></style>
