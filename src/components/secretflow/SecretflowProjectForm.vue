<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { FormType } from '@/utils/const';
import { useRoute, useRouter } from 'vue-router';


const router = useRouter();
const route = useRoute();
const FormRef = ref(null);

const state = reactive({
    model: {},
    loading: false,
    selfSites: [],
    otherSites: [],
    arbiterSites: [],
});

const props = defineProps({
    defaultModel: {
        type: Object,
        // default: () => ({}),
        required: true
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
        console.log(state.model,'MODEL');
    },
    { immediate: true },
);

onMounted(() => {

});

function cancel() {
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

function validate() {
    return FormRef.value.validate().catch(() => { });
}

function getModel() {
    return state.model;
}

async function save() { }

defineExpose({ cancel, validate, getModel, save, FormRef, state });
</script>

<template>
    <el-form ref="FormRef" :model="state.model" :label-width="props.labelWidth" :inline="props.inline">
        <el-form-item v-show="false" label="ID">
            <el-input v-model="state.model.id" placeholder="" :disabled="props.formType === FormType.READ" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="state.model.projectName" placeholder="请输入项目名称"
                :disabled="props.formType === FormType.READ" />
        </el-form-item>
        <!-- <el-form-item label="内置引擎" prop="projectName">
            <el-input v-model="state.model.platform" placeholder="请输入项目名称"
                disabled />
        </el-form-item> -->
        <el-form-item label="参与主体" prop="nodeTag">
            <el-input v-model="state.model.nodeTag" placeholder="请输入项目名称" disabled />
        </el-form-item>

        <el-form-item label="备注" prop="remarks" class="entire-line">
            <el-input v-model="state.model.remarks" type="textarea" placeholder=""
                :disabled="props.formType === FormType.READ" />
        </el-form-item>
    </el-form>
</template>

<style scoped lang="scss">
.alert-info {
    margin-bottom: 1rem;
}
</style>
