<script setup>
import { reactive, ref, watch } from 'vue';
import { FormType, DataStatus, SourceType } from '@/utils/const';
import { engineType } from '@/utils';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import useSiteStore from '../../stores/dept/site.store';
import Log from '../workspace/job-details/dialog/component/Log.vue';
// import secretflowHeaderDataTable from './secretflowHeaderDataTable.vue';
// import { createData, updateData } from '../../../apis/workspace/data.api';

const FormRef = ref(null);
const HeaderDataTableRef = ref(null);
const router = useRouter();
const route = useRoute();
const state = reactive({
    model: {},
    tableData: [],
});

const props = defineProps({
    defaultModel: {
        type: Object,
        default: () => ({}),
    },
    formType: {
        type: String,
        default: FormType.READ,
    },
    inline: {
        type: Boolean,
        default: true,
    },
});

watch(
    () => props.defaultModel,
    () => {
        state.model = { ...props.defaultModel };
    },
    { immediate: true },
);

function refresh() {
    HeaderDataTableRef.value.fetchTableData();
}



function cancel() {
    router.push({
        name: route.name,
        query: {
            dataName: state.model.dataName,
            id: state.model.id,
            action: FormType.READ,
        },
    });
    FormRef.value.resetFields();
    state.model = { ...props.defaultModel };
    console.log(state.model,'是A1');
}

function validate() {
    return FormRef.value.validate().catch(() => { });
}

function getModel() {
    return state.model;
}

defineExpose({ cancel, validate, getModel, FormRef, state, refresh });
</script>

<template>
    <el-form ref="FormRef" :model="state.model" label-width="100px" :inline="props.inline">
        <el-form-item label="数据名称" prop="datatableName">
            <el-input v-model="state.model.name" placeholder="数据名称" :disabled="true" />
        </el-form-item>
        <el-form-item label="命名空间" prop="datatableName" v-if="state.model.platform == '0'">
            <el-input v-model="state.model.namespace" placeholder="数据名称" :disabled="true" />
        </el-form-item>
        <el-form-item label="内置引擎" prop="nodeName">
            <el-input v-model="engineType[state.model.platform]" placeholder="引擎名称" :disabled="true" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="state.model.describeText" type="textarea" autosize placeholder="" :disabled="true" />
        </el-form-item>
        <el-form-item label="创建人" prop="creator">
            <el-input v-model="state.model.creator"  placeholder="" :disabled="true" />
        </el-form-item>
        <el-form-item label="状态" prop="dataCheckState">
            <el-select v-model="state.model.status" :disabled="true">
                <el-option v-for="item in DataStatus.options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </el-form-item>
    </el-form>
    <!-- <secretflowHeaderDataTable ref="HeaderDataTableRef" :dataModel="state.model" :formType="props.formType"
        @done="refresh" /> -->
</template>

<style scoped lang="scss">
.alert-info {
    margin-bottom: 1rem;
}
</style>
