<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import ListContainer from '../../../layouts/ListContainer.vue';
import { FormType } from '../../../utils/const';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import AlgorithmTable from './AlgorithmTable.vue';
import AlgorithmLibraryForm from './AlgorithmLibraryForm.vue';
import {getAlglibraryInfo} from '../../../apis/manager/managerApi'
import CreateAlgorithmDialog from './CreateAlgorithmDialog.vue';
import BindAlgorithmDialog from './BindAlgorithmDialog.vue';
import {
  getVersionManagementById,
  publish,
} from '../../../apis/workspace/algorithm.api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const CreateAlgorithmDialogRef = ref(null);
const BindAlgorithmDialogRef = ref(null);
const AlgorithmLibraryFormRef = ref(null);
const AlgorithmTableRef = ref(null);
const state = reactive({
  loading: false,
  model: {},
  search: {},
  tableData: [],
  algLibInfo:[]
});
onMounted(() => {
  fetchData();
});

const libraryName = computed(() => route.query.libraryName);
const verId = computed(() => route.query.id);
const action = computed(() => route.query.action);
watch(
  () => libraryName.value,
  () => {
    fetchData();
  },
  {
    immediate: true,
  },
);

async function fetchData() {
  try {
    state.loading = true;
    if (verId.value) {
      state.model = await getVersionManagementById(verId.value);
      state.algLibInfo = await getAlglibraryInfo(verId.value);
    }
  } finally {
    state.loading = false;
  }
}

function onBindAlgorithm() {
  BindAlgorithmDialogRef.value.show(state.model);
}

function onCreateAlgorithm() {
  CreateAlgorithmDialogRef.value.show(state.model);
}

function afterCreateAlgorithm() {
  AlgorithmTableRef.value.fetchTableData();
}

function afterBindAlgorithm() {
  AlgorithmTableRef.value.fetchTableData();
}

function onSave() {
  AlgorithmLibraryFormRef.value.save();
  router.push({
    name: route.name,
    query: {
      ...route.query,
      action: FormType.READ,
    },
  });
}

function onCancel() {
  AlgorithmLibraryFormRef.value.cancel();
}

function onEdit() {
  router.push({
    name: route.name,
    query: {
      libraryName: state.model.name,
      id: state.model.id,
      action: FormType.EDIT,
    },
  });
}

async function onPublish() {
  try {
    state.loading = true;
    await publish(state.model.id);
    ElMessage.success('发布成功');
    await fetchData();
  } catch (error) {
    ElMessage.error('发布失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <ListContainer loading="state.loading" title="算法库信息">
    <!--    <template #header-tool>-->
    <!--      <template-->
    <!--        v-if="AlgorithmLibPublishType.canEdit(state.model.publishState)"-->
    <!--      >-->
    <!--        <el-button type="text" @click="onPublish">-->
    <!--          <el-icon-->
    <!--            ><img src="../../../assets/workspace/publish.png" alt=""-->
    <!--          /></el-icon>-->
    <!--          发布-->
    <!--        </el-button>-->
    <!--      </template>-->
    <!--    </template>-->
    <ListContainerItem title="算法库详情">
      <!--      <template #header-tool>-->
      <!--        <template v-if="FormType.EDIT === action">-->
      <!--          <el-button type="text" @click="onSave">保存</el-button>-->
      <!--          <el-button type="text" @click="onCancel">取消</el-button>-->
      <!--        </template>-->
      <!--        <template v-else-if="FormType.READ === action">-->
      <!--          <el-button type="text" @click="onEdit">-->
      <!--            <el-icon>-->
      <!--              <Edit />-->
      <!--            </el-icon>-->
      <!--            编辑-->
      <!--          </el-button>-->
      <!--        </template>-->
      <!--      </template>-->
      <AlgorithmLibraryForm ref="AlgorithmLibraryFormRef" :defaultModel="state.algLibInfo" :formType="action" />
    </ListContainerItem>
    <ListContainerItem title="绑定算法列表">
      <!--      <template-->
      <!--        v-if="AlgorithmLibPublishType.canEdit(state.model.publishState)"-->
      <!--        #header-tool-->
      <!--      >-->
      <!--        <el-button type="text" class="add" @click="onCreateAlgorithm">-->
      <!--          <el-icon>-->
      <!--            <Plus />-->
      <!--          </el-icon>-->
      <!--          新增算法-->
      <!--        </el-button>-->
      <!--        <el-button type="text" class="add" @click="onBindAlgorithm">-->
      <!--          <el-icon-->
      <!--            ><img src="../../../assets/workspace/bind.svg" alt=""-->
      <!--          /></el-icon>-->
      <!--          绑定算法-->
      <!--        </el-button>-->
      <!--      </template>-->
      <AlgorithmTable ref="AlgorithmTableRef" :verId="verId" :publishState="state.model" />
    </ListContainerItem>
  </ListContainer>
  <BindAlgorithmDialog ref="BindAlgorithmDialogRef" @done="afterBindAlgorithm" />
  <CreateAlgorithmDialog ref="CreateAlgorithmDialogRef" @done="afterCreateAlgorithm" />
</template>

<style scoped></style>
