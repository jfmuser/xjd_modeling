<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { FormType, FieldType } from '@/utils/const';
const TableDataRef = ref(null);
const props = defineProps({
    dataModel: { type: Object, required: true },
    formType: { type: String, required: true },
    changeShow: { type: Boolean },
});

const state = reactive({
    loading: false,
    tableData: [],
    selectedData: [],
    search: {},
});

watch(
    () => props.dataModel.id,
    () => {
        fetchTableData();
    },
);

onMounted(() => {
    fetchTableData();
});

async function fetchTableData() {
    try {
        state.loading = true;
        if (props.dataModel.id) {
            state.tableData = props.dataModel.schema
        }
    } catch (error) {
        console.error(error);
    } finally {
        state.loading = false;
    }
}

function getRowKeys(row) {
    return row.id;
}

function getSelectedData() {
    return state.selectedData;
}

function getAllData() {
    return state.tableData;
}

function fieldTypeChange(val, id) {
    state.tableData.find((item) => item.id === id).fieldType = val;
}

function fieldInfoChange(val, id) {
    state.tableData.find((item) => item.id === id).fieldInfo = val;
}

defineExpose({
    TableDataRef,
    getSelectedData,
    getAllData,
    state,
    fetchTableData,
    onMounted,
});

</script>

<template>
    <el-table ref="TableDataRef" v-loading="state.loading" :data="state.tableData" :row-key="getRowKeys"
        @selection-change="handleSelectionChange" style="margin-top: 15px;">
        <el-table-column type="selection" width="55" v-if="checkShow" />
        <el-table-column v-if="props.formType === FormType.PUBLISH" type="selection" width="55" :reserve-selection="true" />
        <el-table-column header-align="center" align="center" label="字段名称" prop="colName" />
        <el-table-column header-align="center" align="center" label="字段类型" prop="colType">
            <template #default="{ row }">
                <el-select :model-value="row.colType" :disabled="props.formType !== FormType.EDIT"
                    @change="(value) => fieldTypeChange(value, row.id)">
                    <el-option v-for="item in FieldType.options" :key="item.value" :label="item.value"
                        :value="item.value" />
                </el-select>
            </template>
        </el-table-column>
        <el-table-column header-align="center" align="center" label="字段说明" prop="colComment">
            <template #default="{ row }">
                <el-input :model-value="row.colComment" :disabled="props.formType !== FormType.EDIT"
                    @input="(value) => fieldInfoChange(value, row.id)" />
            </template>
        </el-table-column>
    </el-table>
</template>

<style scoped lang="scss">
.zindex {
    z-index: 999;
}
</style>
