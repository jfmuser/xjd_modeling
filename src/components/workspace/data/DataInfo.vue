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
import ListContainer from '../../../layouts/ListContainer.vue';
import { FormType, DataStatus, SourceType } from '../../../utils/const';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import DataForm from './DataForm.vue';
import DataPublishDialog from './DataPublishDialog.vue';
import { getDataById } from '../../../apis/workspace/data.api';
import { getHeaderData } from '../../../apis/workspace/dataHeaders.api';

let dataStatusInterval;
let needUpload = false;
const router = useRouter();
const DataFormRef = ref(null);
const DataPublishDialogRef = ref(null);
const action = computed(() => route.query.action);
const dataId = computed(() => route.query.id);
const type = computed(() => route.query.type);
const route = useRoute();
const state = reactive({
  model: {},
  search: {},
});
onMounted(async () => {
  await fetchData();
});

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
    if (dataId.value && type.value === 'self-innovate') {
      state.model = await getDataById(dataId.value);
      let dataState = 'pending';
      if (state.model.dataCheckState) {
        dataState = state.model.dataCheckState;
      }
      const reg = /^pending.?/;
      if (reg.test(dataState)) {
        state.model.dataCheckState = 'pending';
      }
    }
  } finally {
    if (DataStatus.canUpload(state.model.dataCheckState)) {
      needUpload = true;
      DataFormRef.value.refresh();
    } else {
      // DataFormRef.value.refresh();
    }
    if (!needUpload && dataStatusInterval) {
      clearInterval(dataStatusInterval);
    }
    getDataStatus();
    state.loading = false;
  }
}

function onSave() {
  DataFormRef.value.save();
  router.push({
    name: route.name,
    query: {
      ...route.query,
      action: FormType.READ,
    },
  });
}

function onPublish() {
  DataPublishDialogRef.value.show(state.model);
}

function onCancel() {
  DataFormRef.value.cancel();
}

function onEdit() {
  router.push({
    name: route.name,
    query: {
      dataName: state.model.dataName,
      id: state.model.id,
      action: FormType.EDIT,
    },
  });
}
</script>

<template>
  <ListContainer loading="state.loading" title="数据详情">
    <template #header-tool>
      <el-button v-if="DataStatus.canPublish(state.model.dataCheckState) &&
        SourceType.isSelf(state.model.dataSourceType) &&
        action !== FormType.EDIT
        " type="text" @click="onPublish">
        <el-icon><img src="../../../assets/workspace/publish.png" alt="" /></el-icon>
        发布
      </el-button>
    </template>
    <ListContainerItem title="基本信息">
      <template #header-tool>
        <template v-if="FormType.EDIT === action">
          <el-button type="text" @click="onSave">保存</el-button>
          <el-button type="text" @click="onCancel">取消</el-button>
        </template>
        <template v-else-if="FormType.READ === action">
          <el-button type="text" @click="onEdit">
            <el-icon>
              <Edit />
            </el-icon>
            编辑
          </el-button>
        </template>
      </template>
      <DataForm ref="DataFormRef" :defaultModel="state.model" :formType="action" :inline="true" />
    </ListContainerItem>
  </ListContainer>
  <DataPublishDialog ref="DataPublishDialogRef" :titlemodel="state.model" />
</template>

<style scoped></style>
