<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import ListContainer from '../../../layouts/ListContainer.vue';
import { FormType } from '../../../utils/const';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import AlgorithmForm from './AlgorithmForm.vue';
import { getDetailById } from '../../../apis/workspace/algorithm.api';

const router = useRouter();
const AlgorithmFormRef = ref(null);
const action = computed(() => route.query.action);
const route = useRoute();
const state = reactive({
  model: {},
  search: {},
});
onMounted(() => {
  fetchData();
});

const algorithmId = computed(() => route.query.id);
watch(
  () => algorithmId.value,
  () => {
    fetchData();
  },
  {
    immediate: false,
  },
);

async function fetchData() {
  try {
    state.loading = true;
    if (algorithmId.value) {
      state.model = await getDetailById(algorithmId.value);
    }
  } finally {
    state.loading = false;
  }
}

function onSave() {
  AlgorithmFormRef.value.save();
  router.push({
    name: route.name,
    query: {
      ...route.query,
      action: FormType.READ,
    },
  });
}

function onCancel() {
  AlgorithmFormRef.value.cancel();
}

function onEdit() {
  router.push({
    name: route.name,
    query: {
      algorithmName: state.model.name,
      id: state.model.id,
      action: FormType.EDIT,
    },
  });
}
</script>

<template>
  <ListContainer loading="state.loading" title="算法信息">
    <template #header-tool> </template>
    <ListContainerItem title="算法详情">
      <!--      <template #header-tool>-->
      <!--        <template v-if='FormType.EDIT === action'>-->
      <!--          <el-button type='text' @click='onSave'>保存</el-button>-->
      <!--          <el-button type='text' @click='onCancel'>取消</el-button>-->
      <!--        </template>-->
      <!--        <template v-else-if='FormType.READ === action'>-->
      <!--          <el-button type='text' @click='onEdit'>-->
      <!--            <el-icon>-->
      <!--              <Edit />-->
      <!--            </el-icon>-->
      <!--            编辑-->
      <!--          </el-button>-->
      <!--        </template>-->
      <!--      </template>-->
      <AlgorithmForm ref="AlgorithmFormRef" :defaultModel="state.model" :formType="action" :inline="true" />
    </ListContainerItem>
  </ListContainer>
</template>

<style scoped></style>
