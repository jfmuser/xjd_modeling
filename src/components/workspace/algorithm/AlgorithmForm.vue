<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { FormType } from '../../../utils/const';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  algorithmVerList,
  nameList,
  updateAlgorithm,
  createAlgorithm,
} from '../../../apis/workspace/algorithm.api';
import { AlgorithmCategory } from '../../../utils/const';
import { getArithmeticList } from '../../../apis/manager/managerApi'
import * as Base64 from 'js-base64'

const FormRef = ref(null);
const RefFile = ref(null);
const router = useRouter();
const route = useRoute();
const state = reactive({
  model: {
    parameterConf: ''
  },
  algorithmNameList: [],
  algorithmVerList: [],
  algorithmTreeList: [],
  defaultCheckedKyes: []
});

const checkoriginConf = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('参数配置不能为空'));
  } else {
    try {
      JSON.parse(value);
      callback();
    } catch (e) {
      return callback(new Error('请输入标准JSON格式数据'));
    }
  }
};
const rules = reactive({
  labelName: [
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  name: [
    { max: 60, message: '最多只能输入60个字符', trigger: 'change' },
    { pattern: /^[0-9a-zA-Z_]*$/g, message: '数据名称只能为英文格式', trigger: 'blur' },
  ],
  algorithmVersion: [
    { max: 16, message: '最多只能输入16个字符', trigger: 'change' }
  ],
  // description: [
  //   { max: 150, message: '最多只能输入150个字符', trigger: 'change' }
  // ],
  originConf: [{ validator: checkoriginConf, trigger: 'blur' }],
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
  algorithmLibId: {
    type: String,
    required: true
  }
});



onMounted(async () => {
  await getAlgorithmNameList();
  // 如果state.model.originConf没有数据就不处理
  if (state.model.parameterConf === undefined) return
  // 以下是对json展示的处理
  state.model.parameterConf = JSON.parse(state.model.parameterConf)
  // 这里不进行判断，查看哪些格式不乱的算子的时候，就会报错
  if (typeof state.model.parameterConf.param === 'string') {
    state.model.originConf.parameterConf = JSON.parse(state.model.parameterConf.param)
  }
  state.model.parameterConf = JSON.stringify(state.model.parameterConf, null, 4)
});
watch(
  () => props.defaultModel,
  () => {
    state.model = { ...props.defaultModel };
  },
  { immediate: true },
);

watch(
  () => state.model.parameterConf,
  () => {
    if (state.model.parameterConf === '') return
    // 以下是对json展示的处理
    // 这里不进行判断，查看哪些格式不乱的算子的时候，就会报错
    if (typeof state.model.parameterConf === 'string' && state.model.parameterConf.includes('{')) {
      console.log(state.model.parameterConf,'state.model.parameterConf');
      
      
      state.model.parameterConfig = JSON.parse(state.model.parameterConf)
      state.model.parameterConfig = JSON.stringify(state.model.parameterConfig, null, 4)
    } else if(typeof state.model.parameterConf === 'string' && !state.model.parameterConf.includes('{')) {
      state.model.parameterConf = Base64.decode(state.model.parameterConf)
      state.model.parameterConfig = JSON.stringify(state.model.parameterConf, null, 4)
    } else {

      state.model.parameterConfig = JSON.stringify(state.model.parameterConf, null, 4)
    }
  },
  { immediate: true },
);

async function getAlgorithmNameList() {
  state.algorithmTreeList = await getArithmeticList(props.algorithmLibId)
  state.algorithmTreeList.forEach(item => {
    state.defaultCheckedKyes.push(item.children.find(algorithm => algorithm.bindState == 1)?.id)
  })
  // state.algorithmNameList = await nameList();
}

async function save() {
  console.log(props.formType);
  try {
    state.loading = true;
    if (props.formType === FormType.CREATE) {
      await createAlgorithm(state.model);
      ElMessage.success('新增成功');
    } else {
      await updateAlgorithm(state.model);
      ElMessage.success('更新成功');
    }
  } catch (e) {
    cancel();
    ElMessage.error(e || '操作失败');
  } finally {
    state.loading = false;
  }
}

function cancel() {
  router.push({
    name: route.name,
    query: {
      algorithmName: state.model.name,
      id: state.model.id,
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

async function selectVerList() {
  state.algorithmVerList = await algorithmVerList(state.model.name);
}

function fileLoad() {
  const selectedFile = RefFile.value.files[0];
  state.model.file = selectedFile;
  const reader = new FileReader();
  reader.readAsText(selectedFile);
  reader.onload = (e) => {
    state.model.originConf = e.target.result;
  };
}

function clickLoad() {
  RefFile.value.dispatchEvent(new MouseEvent('click'));
}

function nodeChange(node, check) {
  if (check) {
    node.bindState = 1
  } else {
    node.bindState = 0
  }
}

defineExpose({ save, cancel, validate, getModel, FormRef, state });
</script>

<template>
  <div v-if="props.formType === FormType.CREATE" class="alert-info">
    优先使用输入的信息，不输入将默认使用参数配置文件中的对应信息
  </div>
  <!-- <el-form v-if="props.formType === FormType.BIND" ref="FormRef" :model="state.model" :rules="rules" label-width="100px"
    :inline="props.inline" :class="{ inline: props.inline }">
    <el-form-item v-show="false" label="ID">
      <el-input v-model="state.model.id" />
    </el-form-item>
    <el-form-item label="算法名称" placeholder="请选择算法名称">
      <el-select v-model="state.model.name" @change="selectVerList">
        <el-option v-for="item in state.algorithmNameList" :key="item.name" :label="item.labelName" :value="item.name" />
      </el-select>
    </el-form-item>
    <el-form-item label="算法版本" placeholder="请选择算法版本">
      <el-select v-model="state.model.algorithmVersion">
        <el-option v-for="item in state.algorithmVerList" :key="item.algorithmVersion" :value="item.algorithmVersion" />
      </el-select>
    </el-form-item>
  </el-form> -->
  <el-tree v-if="props.formType === FormType.BIND" style="max-width: 600px" :data="state.algorithmTreeList"
    show-checkbox node-key="id" :default-checked-keys="state.defaultCheckedKyes" @check-change="nodeChange"
    default-expand-all>
    <template #default="{ data }">
      <div class="custom-tree-node">
        <div>
          {{ data.algorithmVersion || data.labelName }}
        </div>
      </div>
    </template>
  </el-tree>

  <el-form v-else ref="FormRef" :model="state.model" :rules="rules" label-width="100px" :inline="props.inline">
    <el-form-item label="算法名称" prop="labelName">
      <el-input v-model="state.model.labelName" placeholder="默认使用参数配置中的信息"
        :disabled="props.formType === FormType.READ" />
    </el-form-item>
    <el-form-item label="模块" prop="module">
      <el-input v-model="state.model.module" placeholder="默认使用参数配置中的信息" :disabled="true" />
    </el-form-item>
    <el-form-item label="英文名称" prop="name">
      <el-input v-model="state.model.name" placeholder="请输入算法别名" :disabled="props.formType === FormType.READ" />
    </el-form-item>
    <el-form-item label="版本" prop="algorithmVersion">
      <el-input v-model="state.model.algorithmVersion" placeholder="请输入算法版本"
        :disabled="props.formType === FormType.READ" />
    </el-form-item>
    <el-form-item label="类型" prop="category">
      <el-select v-model="state.model.category" :disabled="props.formType === FormType.READ">
        <el-option v-for="item in AlgorithmCategory.options" :key="item.value" :label="item.label"
          :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item label="描述" prop="description" style="width: 80%">
      <el-input v-model="state.model.description" type="textarea" autosize placeholder=""
        :disabled="props.formType === FormType.READ" />
    </el-form-item>

    <el-form-item v-if="props.formType === FormType.CREATE" label="参数配置" prop="originConf">
      <el-button type="success" @click="clickLoad">点击选择</el-button>
      <input ref="RefFile" type="file" accept=".json" style="display: none" @change="fileLoad" />
      <span v-if="state.model.file" style="margin-left: 1rem">
        {{ state.model.file.name }}
      </span>
    </el-form-item>
    <el-form-item v-else label="参数配置" prop="parameterConf" style="width: 80%">
      <el-input v-model="state.model.parameterConfig" type="textarea" :rows="15" placeholder=""
        :disabled="props.formType === FormType.READ" />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.alert-info {
  margin-bottom: 1rem;
}
</style>
