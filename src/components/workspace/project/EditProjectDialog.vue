<script setup>
import _ from 'lodash';
import { reactive, ref } from 'vue';
import { updateProjectJson } from '../../../apis/workspace/project.api';
import { ElMessage } from 'element-plus';
import * as Base64 from 'base-64'

const FormRef = ref(null);
const checkProjectJson = (rule, value, callback) => {
  if (!value) {
    callback(new Error('项目配置不能为空'));
    return;
  }
  try {
    JSON.parse(value);
  } catch (e) {
    callback(new Error('请输入标准JSON格式数据'));
    return;
  }

  callback();
};
const state = reactive({
  visible: false,
  loading: false,
  model: {},
  rules: {
    projectJson: [{ validator: checkProjectJson, trigger: 'blur' }],
  },
});
const cord = '2'
const emits = defineEmits(['done']);
const onClose = () => {
  FormRef.value.resetFields();
  state.visible = false;
  emits('done');
};

const show = (data) => {
  if (!data) {
    // 防止点击添加，项目配置里有上一个项目的东西
    state.model.projectJson = '';
    state.model.projectName = '';
    state.model.remarks = '';
    state.model.id = '';
    state.visible = true;
    return
  }
  console.log(data, 'KKJSON');
  if (!data.projectJson.includes('{')) {
    data.projectJson = Base64.decode(data.projectJson)
  }
  const projectJson = JSON.stringify(JSON.parse(data.projectJson), null, 4);
  state.model = _.pick(data, ['id', 'projectName', 'remarks']);
  state.model.projectJson = projectJson;
  // console.log(projectJson, '【【【【【【');
  state.visible = true;
};

const onConfirm = async () => {
  const isValid = await FormRef.value.validate().catch(() => { });
  console.log(isValid);
  if (!isValid) {
    return;
  }
  try {
    state.loading = true;
    state.model.projectJsonObj = Base64.encode(state.model.projectJson)
    state.model.projectJson = Base64.encode(state.model.projectJson)
    await updateProjectJson(state.model);
    ElMessage.success('操作成功');
    state.loading = false;
    onClose();
  } catch (e) {
    ElMessage.error('操作失败');
    state.loading = false;
  }
};
defineExpose({ show });
</script>
<template>
  <el-dialog v-if="state.visible" :model-value="true" :before-close="onClose" :title="state.model.id ? '项目配置编辑' : '新增项目'"
    width="1000px">
    <el-form ref="FormRef" v-loading="state.loading" :model="state.model" label-width="100px" :rules="state.rules">
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="state.model.projectName" placeholder="请输入项目名称" />
      </el-form-item>
      <!-- <el-form-item label="内置引擎" prop="projectName">
        <el-select v-model="cord" class="m-2" placeholder="Select" size="large">
          <el-option label="自研" value="2" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="备注">
        <el-input v-model="state.model.remarks" type="textarea" placeholder="请输入项目备注" />
      </el-form-item>
      <el-form-item label="项目配置" prop="projectJson">
        <el-input v-model="state.model.projectJson" type="textarea" :rows="15" placeholder="请输入项目配置，JSON格式" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm">确认</el-button>
      <el-button @click="onClose"> 取消</el-button>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss"></style>
