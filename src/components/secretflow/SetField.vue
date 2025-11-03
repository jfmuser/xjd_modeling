<template>
    <el-dialog :model-value="true" title="设置字段" width="30%" class="dialog_box" @close="() => emit('closeSetField')">
        <div class="main">
            <div class="left_box">{{ JSON.stringify(leftData).replace('[', '').replace(']', '') }}</div>
            <div class="right_box">
                <el-tree :data="treeData" show-checkbox node-key="id" :default-checked-keys="[...CheckedKeys]"
                    default-expand-all @check-change="changeCheckbox" />
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="() => emit('closeSetField')">取消</el-button>
                <el-button type="primary" @click="() => emit('save', leftData)">
                    确定
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>

import { onBeforeMount, ref } from 'vue'
import { getProjectDatatable, getOutputData } from '@/apis/secretflow/secretflow.api.js'
import { useRoute } from 'vue-router';

const emit = defineEmits(['closeSetField', 'save']);
const props = defineProps({
    projectInfo: {
        type: Object,
        required: true
    },
    field: {
        type: Object,
        required: true
    },
    operatorName: {
        type: String,
        required: true
    }
})
const route = useRoute()

const treeData = ref(null)
const leftData = ref([])
const CheckedKeys = ref([])
const graphInfo = JSON.parse(localStorage.getItem('graphInfo'))

async function handleFieldData() {
    const fieldInfo = []
    const typeList = []
    let currentGraphNodeId = ''
    let sourceGraphEdgeId = ''
    let sourceAnchor = ''
    graphInfo.nodes.forEach(item => {
        if (item.label === props.operatorName) {
            currentGraphNodeId = item.graphNodeId
        }
    })
    graphInfo.edges.forEach(item => {
        if (item.target === currentGraphNodeId) {
            sourceGraphEdgeId = item.source
            sourceAnchor = item.sourceAnchor
        }
    })
    // 获取上一个节点的输出
    try {
        if (sourceGraphEdgeId && sourceAnchor) {
            const sourceNode = graphInfo.nodes.find(item => item.graphNodeId === sourceGraphEdgeId)
            const index = sourceNode.nodeDef.attrPaths.indexOf('pred_name')
            index === -1 ? "" : fieldInfo.push({ colType: 'float', colName: sourceNode.nodeDef.attrs[index]?.s ?? '' })
            
            // const outputData = await getOutputData({
            //     graphId: route.query.graphId,
            //     graphNodeId: sourceGraphEdgeId,
            //     outputId: sourceAnchor,
            //     projectId: props.projectInfo.projectId
            // })
            // console.log(fieldInfo,'resRES');
            // if (outputData?.meta) {
            //     outputData?.meta.rows.forEach(item => {
            //         if (item.fields && item.fields.split(',').length > 0) {
            //             const fieldsArr = item.fields.split(',')
            //             const fieldTypes = item.fieldTypes.split(',')
            //             fieldTypes.forEach((item, i) => fieldInfo.push({ colType: fieldTypes[i], colName: fieldsArr[i] }))
            //         }
            //     })
            // }
        }
    } catch (error) {
        console.log(error);
    }

    //获取当前画布里所有的样本表算子
    const datatableList = graphInfo.nodes.filter(node => {
        return node.codeName.includes('datatable')
    })
    for (let i = 0; i < props.projectInfo.nodes.length; i++) {
        if (!props.projectInfo.nodes[i].datatables) continue
        //筛选出当前样本表所使用的数据id
        const currentDatatable = props.projectInfo.nodes[i].datatables.find(datatable => datatableList.some(data => data.nodeDef.attrs[0].s == datatable.datatableId))
console.log(currentDatatable,'currentDatatable')
        const res = await getProjectDatatable({ projectId: props.projectInfo.projectId, datatableId: currentDatatable.datatableId, nodeId: props.projectInfo.nodes[i].nodeId })
        
        fieldInfo.push(...res.configs)
    }
    fieldInfo.forEach(item => {
        if (typeList.includes(item.colType)) return
        typeList.push(item.colType)
    })
    treeData.value = typeList.map((type, i) => {
        const obj = { children: [], id: i }
        obj.label = type

        fieldInfo.forEach((field, i) => {
            if (field.colType === type && !obj.children.some(data => data.label === field.colName)) {
                obj.children.push({
                    label: field.colName,
                    id: i + 3
                })
            }
        })
        return obj
    })
    console.log(treeData.value,fieldInfo,'treeData.value')
}



function changeCheckbox(data, checked, indeterminate) {
    console.log(data, checked);
    if (!data.children && checked) {
        leftData.value.push(data.label)
    } else if (!data.children && checked === false) {
        const index = leftData.value.indexOf(data.label)
        const idx = CheckedKeys.value.indexOf(data.id)
        console.log(index, 'DOOD');
        leftData.value.splice(index, 1)
        CheckedKeys.value.splice(idx, 1)
        console.log(leftData.value, 'LEFTFATA');
    }
}

async function backflowField() {
    treeData.value.forEach(data => {
        data.children.forEach(item => {
            if (props.field.ss.includes(item.label)) {
                CheckedKeys.value.push(item.id)
                console.log(typeof item.id);
            }
        })
    })
}

onBeforeMount(async () => {
    console.log(props.field, 'leftData');
    await handleFieldData()
    if (JSON.stringify(props.field) === '{}') return
    await backflowField()
})
</script>
<style lang="scss" scoped>
.main {
    display: flex;
    height: 500px;

    .left_box,
    .right_box {
        flex: 1;
        height: 500px;
        overflow: auto;
    }

    // :deep .el-tree {
    //     height: 500px;
    // }
}
</style>