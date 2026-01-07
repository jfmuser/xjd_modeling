<template>
  <el-dialog
    :model-value="true"
    title="设置字段"
    width="30%"
    class="dialog_box"
    @close="() => emit('closeSetField')"
  >
    <div class="main">
      <div class="left_box">
        {{ JSON.stringify(leftData).replace('[', '').replace(']', '') }}
      </div>
      <div class="right_box">
        <el-tree
          ref="treeRef"
          :data="treeData"
          show-checkbox
          node-key="id"
          :default-checked-keys="[...CheckedKeys]"
          default-expand-all
          @check-change="changeCheckbox"
        />
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
import { onBeforeMount, ref } from 'vue';
import {
  getProjectDatatable,
  getOutputData,
} from '@/apis/secretflow/secretflow.api.js';
import { useRoute } from 'vue-router';

const emit = defineEmits(['closeSetField', 'save']);
const props = defineProps({
  projectInfo: {
    type: Object,
    required: true,
  },
  field: {
    type: Object,
    required: true,
  },
  operatorName: {
    type: String,
    required: true,
  },
});
const route = useRoute();

const treeRef = ref();
const treeData = ref(null);
const leftData = ref([]);
const CheckedKeys = ref([]);
const graphInfo = JSON.parse(localStorage.getItem('graphInfo'));

async function handleFieldData() {
  const fieldInfo = [];
  const typeList = [];
  let currentGraphNodeId = '';
  let sourceGraphEdgeId = '';
  let sourceAnchor = '';
  graphInfo.nodes.forEach((item) => {
    if (item.label === props.operatorName) {
      currentGraphNodeId = item.graphNodeId;
    }
  });
  graphInfo.edges.forEach((item) => {
    if (item.target === currentGraphNodeId) {
      sourceGraphEdgeId = item.source;
      sourceAnchor = item.sourceAnchor;
    }
  });
  // 获取上一个节点的输出
  try {
    if (sourceGraphEdgeId && sourceAnchor) {
      const sourceNode = graphInfo.nodes.find(
        (item) => item.graphNodeId === sourceGraphEdgeId,
      );
      const index = sourceNode.nodeDef.attrPaths.indexOf('pred_name');
      index === -1
        ? ''
        : fieldInfo.push({
            colType: 'float',
            colName: sourceNode.nodeDef.attrs[index]?.s ?? '',
          });

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
  const datatableList = graphInfo.nodes.filter((node) => {
    return node.codeName.includes('datatable');
  });
  for (let i = 0; i < props.projectInfo.nodes.length; i++) {
    if (!props.projectInfo.nodes[i].datatables) continue;
    //筛选出当前样本表所使用的数据id
    const currentDatatable = props.projectInfo.nodes[i].datatables.find(
      (datatable) => {
        let result = datatableList.some((data) => {
          console.log({
            attrs: data.nodeDef.attrs[0].s,
            datatableId: datatable.datatableId,
          });
          return data.nodeDef.attrs[0].s == datatable.datatableId;
        });
        console.log({ result });
        return result;
      },
    );
    if (!currentDatatable) continue;
    console.log(currentDatatable, 'currentDatatable');
    const res = await getProjectDatatable({
      projectId: props.projectInfo.projectId,
      datatableId: currentDatatable.datatableId,
      nodeId: props.projectInfo.nodes[i].nodeId,
    });

    fieldInfo.push(...res.configs);
  }
  fieldInfo.forEach((item) => {
    if (typeList.includes(item.colType)) return;
    typeList.push(item.colType);
  });
  treeData.value = typeList.map((type, i) => {
    const obj = { children: [], id: i };
    obj.label = type;

    fieldInfo.forEach((field, i) => {
      if (
        field.colType === type &&
        !obj.children.some((data) => data.label === field.colName)
      ) {
        obj.children.push({
          label: field.colName,
          id: i + 3,
        });
      }
    });
    return obj;
  });
  console.log(treeData.value, fieldInfo, 'treeData.value');
}

function changeCheckbox(data, checked, indeterminate) {
  console.log(data, checked, '看看字段的取消是啥');

  // 处理叶子节点（没有children的节点）
  if (!data.children) {
    if (checked) {
      // 添加到左侧显示列表（避免重复添加）
      if (!leftData.value.includes(data.label)) {
        leftData.value.push(data.label);
      }
      // 添加到已选中的keys中（避免重复添加）
      if (!CheckedKeys.value.includes(data.id)) {
        CheckedKeys.value.push(data.id);
      }
    } else {
      // 从左侧显示列表移除
      const indexInLeft = leftData.value.indexOf(data.label);
      if (indexInLeft > -1) {
        leftData.value.splice(indexInLeft, 1);
      }

      // 从已选中keys中移除
      const indexInChecked = CheckedKeys.value.indexOf(data.id);
      if (indexInChecked > -1) {
        CheckedKeys.value.splice(indexInChecked, 1);
      }
      console.log(leftData.value, 'LEFTFATA');
    }
  }
  // 处理父节点（有children的节点）
  else {
    // 如果父节点被选中，则选中所有子节点
    if (checked) {
      data.children.forEach((child) => {
        if (!leftData.value.includes(child.label)) {
          leftData.value.push(child.label);
        }
        if (!CheckedKeys.value.includes(child.id)) {
          CheckedKeys.value.push(child.id);
        }
      });
    }
    // 如果父节点被取消选中，则只取消那些没有被单独选中的子节点
    else {
      data.children.forEach((child) => {
        // 获取el-tree实例来检查子节点的实际选中状态
        const childNode = treeRef.value.getNode(child.id);

        // 只有当子节点没有被单独选中时，才从左侧数据中移除
        if (childNode && !childNode.checked) {
          const indexInLeft = leftData.value.indexOf(child.label);
          if (indexInLeft > -1) {
            leftData.value.splice(indexInLeft, 1);
          }

          const indexInChecked = CheckedKeys.value.indexOf(child.id);
          if (indexInChecked > -1) {
            CheckedKeys.value.splice(indexInChecked, 1);
          }
        }
      });
      console.log(leftData.value, 'LEFTFATA');
    }
  }
}

async function backflowField() {
  treeData.value.forEach((data) => {
    data.children.forEach((item) => {
      if (props.field.ss.includes(item.label)) {
        CheckedKeys.value.push(item.id);
        console.log(typeof item.id);
      }
    });
  });
}

onBeforeMount(async () => {
  console.log(props.field, 'leftData');
  await handleFieldData();
  if (JSON.stringify(props.field) === '{}') return;
  await backflowField();
});
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
