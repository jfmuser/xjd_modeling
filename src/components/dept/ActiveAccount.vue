<script setup>
import { reactive, ref } from 'vue';
import { registerSelfParties } from '../../apis/manager/managerApi'
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
// import { activateAccount } from '../../apis/dept/auth.api';
// import AES from '../../utils/aesCrypto'

const formRef = ref(null);

const state = reactive({
  visible: false,
  loading: false,
  model: {},
});
const router = useRouter()
const route = useRoute();

const rules = reactive({
  // link: [{ required: true, message: '请输入激活链接' }],
  // username: [{ required: true, message: '请输入管理员名称' }],
  // password: [{ required: true, message: '请输入密码' }],
  // url: [{ required: true, message: '部门管理链接' }],
  name: [
    { required: true, message: '请输入主体名称', trigger: 'blur' },
    {max:16,message:'最多只能输入16个字符',trigger:'change'}
  ]
});

function show() {
  state.visible = true;
}

defineExpose({ show });

// function onClose() {
//   formRef.value.resetFields();
//   state.visible = false;
// }

// async function onConfirm() {
//   try {
//     const isValid = await formRef.value.validate().catch(() => { });
//     if (!isValid) {
//       return;
//     }

//     // 加密前账号密码
//     const AesUserName = AES.encrypt(state.model.username);
//     const AesUserPassword = AES.encrypt(state.model.password);
//     state.loading = true;
//     await activateAccount({
//       username: AesUserName,
//       password: AesUserPassword,
//       link: state.model.link,
//       url: state.model.url
//     });
//     ElMessageBox.alert('现在您可以使用该管理员账号登录部门管理', '激活成功', {
//       type: 'success',
//       showClose: false,
//       callback: () => {
//         onClose();
//       },
//     });
//   } catch (error) {
//     ElMessageBox.alert('请重新填写激活信息', '激活失败', {
//       type: 'error',
//       showClose: false,
//     });
//   } finally {
//     state.loading = false;
//   }
// }

/**
 * @description 注册本参与方
*/
async function onConfirm() {
  try {
    await registerSelfParties({ name: state.model.name })
    ElMessage({
      message: `注册成功`,
      type: 'success',
    })
    closeDialog()
  } catch (error) {
    ElMessage.error(`${error}`)
  }
}

function closeDialog() {
  localStorage.clear()
  state.visible = false
  router.push({ path: '/', query: {redirect: route.path} })
}
</script>

<template>
  <el-dialog v-model="state.visible" :before-close="onClose" title="主体注册" width="550px" @close="closeDialog">
    <el-form ref="formRef" label-width="120px" :model="state.model" :rules="rules">
      <!-- <el-form-item label="链接" prop="link">
        <el-input v-model.trim="state.model.link" placeholder="请输入联邦管理平台提供的管理员激活链接" clearable />
      </el-form-item>
      <el-form-item label="账号" prop="username">
        <el-input v-model.trim="state.model.username" placeholder="请绑定一个管理员账号" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model.trim="state.model.password" placeholder="请输入密码" clearable show-password />
      </el-form-item>
      <el-form-item label="部门管理链接" prop="url">
        <el-input v-model.trim="state.model.url" placeholder="请输入部门管理链接" clearable />
      </el-form-item> -->
      <el-form-item label="主体名称" prop="url">
        <el-input v-model.trim="state.model.name" placeholder="请输入主体名称" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
