<script setup>
import { watch, reactive, nextTick } from 'vue';
import { getComponentPara } from '../../apis/workspace/job.api';
import ListContainerItem from '../../layouts/ListContainerItem.vue';

const props = defineProps({
  jobId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  partyId: {
    type: String,
    required: true,
  },
  component: {
    type: Object,
    required: true,
  },
});
const state = reactive({
  loading: false,
  paramList: [],
  parameterCount: 0,
  expandAll: true,
  isShowTree: true,
});

watch(
  () => props.component.name,
  () => {
    if (props.component.status === 'success') {
      fetchParams();
    } else {
      state.paramList = [];
      state.parameterCount = 0;
    }
  },
);

async function fetchParams() {
  try {
    state.loading = true;
    const { jobId, role, partyId } = props;
    const response = await getComponentPara({
      job_id: jobId,
      role: role,
      party_id: partyId,
      component_name: props.component.name,
    });

    const data = JSON.parse(response.data);
    state.paramList = checkLevels(data);
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

function checkLevels(obj) {
  const finalParameter = [];
  for (const key in obj) {
    const midObj = {};
    if (obj[key] === null) {
      midObj.label = key + ': null';
      state.parameterCount++;
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      midObj.label = key;
      midObj.children = checkLevels(obj[key]);
    } else {
      if (Array.isArray(obj[key])) {
        let hasObject = false;
        for (const val of obj[key]) {
          if (typeof val === 'object' && val) {
            hasObject = true;
            break;
          }
        }
        if (hasObject) {
          midObj.label = key + ': [';
          const middle = {};
          let index = 0;
          for (const val of obj[key]) {
            middle[index] = val;
            index++;
          }
          midObj.children = checkLevels(middle);
          midObj.children.push({ label: ']' });
        } else {
          midObj.label = key + ': [' + obj[key].join(', ') + ']';
        }
      } else {
        midObj.label = key + ': ' + obj[key].toString();
      }
      state.parameterCount++;
    }
    if (key === 'module') {
      finalParameter.unshift(midObj);
    } else {
      finalParameter.push(midObj);
    }
  }
  return finalParameter;
}

async function onSwitchExpand() {
  state.expandAll = !state.expandAll;
  state.isShowTree = false;
  await nextTick();
  state.isShowTree = true;
}
</script>

<template>
  <ListContainerItem
    :title="`参数列表(${state.parameterCount})`"
    :loading="state.loading"
  >
    <template #header-tool>
      <el-button
        type="text"
        :disabled="state.paramList.length === 0"
        @click="onSwitchExpand"
        >{{ state.expandAll ? '折叠' : '展开' }}全部
      </el-button>
    </template>
    <el-tree
      v-if="state.isShowTree"
      :data="state.paramList"
      :default-expand-all="state.expandAll"
    />
  </ListContainerItem>
</template>

<style scoped>
:deep .el-tree {
  height: 100%;
}
</style>
