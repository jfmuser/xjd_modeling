<script setup>
import { reactive, ref, computed, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getCodes } from '../apis/dept/auth.api.js';
import { login as deptLogin, getSystemConfig } from '../apis/dept/auth.api.js';
import { ElMessage } from 'element-plus';
import useEnv from '../hooks/useEnv.js';
import useAuthStore from '../stores/auth.store';
import ActiveAccount from '../components/dept/ActiveAccount.vue';
import AES from '../utils/aesCrypto';
import useSiteStore from '../stores/dept/site.store.js';
import UpdataPasswordDialog from '../components/workspace/UpdataPasswordDialog.vue';

const { VITE_APP, VITE_APP_TITLE } = useEnv();
const router = useRouter();
const route = useRoute();
const siteStore = useSiteStore();
//  / 
const form = reactive({ username: 'admin', password: 'admin', verificationCode: '' });
const formRef = ref(null);
const activeAccountRef = ref(null);
const loading = ref(false);
const authStore = useAuthStore();
const inputStyle = { backgroundColor: 'transparent', color: '#fff' };
// const inputStyle = { backgroundColor: 'transparent', color: '#000' };
const state = reactive({
  // 验证码图片
  codeImg: '',
  // 随验证码一起带进登录请求的字段
  batch: '',
});
const visible = ref(localStorage.getItem('code') === '10101' ? true : false);

// code unicode
onBeforeMount(async () => {
  // 随机验证码 调用后端getcode
  await WorkinitGetHouCode();
  // 自动登录
  onLogin();
});
// 后端请求 workspace
const WorkinitGetHouCode = async () => {
  // 后端生成验证码
  const data = await getCodes();
  state.codeImg = data.img;
  state.batch = data.batch;
};

async function onLogin () {
  const valid = await formRef.value.validate().catch(() => { });
  if (!valid) {
    return;
  }
  try {
    loading.value = true;
    let response;
    const AesUserName = AES.encrypt(form.username);
    const AesUserPassword = AES.encrypt(form.password);
    response = await deptLogin(
      //
      AesUserName,
      AesUserPassword,
      form.verificationCode,
      state.batch,
    );
    console.log({ response })
    localStorage.setItem('code', response.code);
    localStorage.setItem(
      'token',
      response.data ? response.data.token : response.token,
    );
    if (response.code == '1' || response.code == '10107') {
      ElMessage.info(response.desc);
      return;
    }
    if (response.code === '10101') {
      authStore.fetchCurrentUser();
      visible.value = true;
      return;
    }

    if (response.desc) {
      ElMessage.info(response.desc);
    }
    ElMessage.success('登录成功');

    // authStore.setIsLogin(true);

    authStore.userInfo = null;

    const redirect = route.query?.redirect || '/data';
    console.log(redirect)
    router.push(redirect);
    // router.push({ name: 'home' });
  } catch (error) {
    await WorkinitGetHouCode();
    // ElMessage.error(error);
  } finally {
    loading.value = false;
  }
}

const rules = {
  username: [
    {
      required: true,
      message: '请输入账号',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
    },
  ],
  verificationCode: [
    {
      required: true,
      message: '请输入验证码',
    },
  ],
};

onBeforeMount(() => {
  if (localStorage.getItem('code') === '10101') return;
  // 如果有token自动登录
  if (localStorage.getItem('token')) {
    localStorage.setItem('autoLogin', 'on');
  }

  const authLogin = localStorage.getItem('autoLogin') === 'on';
  if (!authLogin) {
    return;
  }
  authStore.setIsLogin(true);
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  const redirect = route.query?.redirect || '/data';
  router.push(redirect);
});

async function updataPasswordSucceed () {
  visible.value = false;
  form.password = '';
  form.username = '';
  form.verificationCode = '';
  await WorkinitGetHouCode();
}
</script>
<template>
  <div v-loading="loading"
       class="login-area">
    <div class="title">{{ VITE_APP_TITLE }}</div>
    <div class="title-bottom"></div>
    <el-form ref="formRef"
             :model="form"
             :rules="rules">
      <el-form-item prop="username">
        <el-input v-model.trim="form.username"
                  placeholder="请输入账号"
                  autocomplete="off"
                  :input-style="inputStyle"
                  clearable
                  disabled>
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <!-- <el-input v-model.trim="form.password" show-password placeholder="请输入密码" autocomplete="new-password" -->
        <el-input v-model.trim="form.password"
                  show-password
                  placeholder="请输入密码"
                  autocomplete="off"
                  :input-style="inputStyle"
                  @keydown.enter="onLogin">
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <!-- <el-form-item prop="verificationCode" class="verificationCode">
        <el-input
          v-model.trim="form.verificationCode"
          placeholder="请输入验证码"
          :input-style="inputStyle"
          @keydown.enter="onLogin"
          style="width: 60%"
        >
          <template #prefix>
            <el-icon>
              <Warning />
            </el-icon>
          </template>
        </el-input>
        <img
          class="verificationCodeImg"
          :src="`data:image/png;base64,${state.codeImg}`"
          @click="WorkinitGetHouCode"
        />
      </el-form-item> -->
      <el-form-item>
        <div class="help">
          <!-- <el-checkbox
                                                                                                                                    label="自动登录"
                                                                                                                                    @change="onAutoLoginChange"
                                                                                                                                  ></el-checkbox> -->
          <el-button v-if="false"
                     type="text">忘记密码</el-button>
        </div>
      </el-form-item>
      <el-form-item class="active-account">
        主体尚未注册?
        <el-link type="success"
                 :underline="false"
                 @click="() => activeAccountRef.show()">点此注册
        </el-link>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   class="login-button"
                   @click="onLogin">
          下一步
        </el-button>
      </el-form-item>
    </el-form>
    <!-- <div class="tip">您将开始构建联邦应用</div> -->
  </div>

  <ActiveAccount ref="activeAccountRef" />
  <UpdataPasswordDialog @updataPasswordSucceed="updataPasswordSucceed"
                        :visible="visible" />
</template>
<style scoped lang="scss">
$width: 370px;

.login-area {
  width: $width;
  border-radius: 6px;
  border: 1.12px solid;
  box-shadow: inset 0px 0px 16px 0px rgba(255, 255, 255, 0.2);
  // background-image: url(../assets/login-bg.png);
  padding: 35px;
  // background-color: #fff;
  color: #fff;
  // color: #000;

  .title {
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }

  .title-bottom {
    width: 165px;
    height: 1px;
    border: 1px solid;
    margin: 10px 0 25px 0;
    border-image: linear-gradient(
        117deg,
        rgb(255, 255, 255),
        rgba(255, 255, 255, 0)
      )
      1 1;
  }

  :deep .el-checkbox__label,
  .el-button--text {
    color: #000;
  }

  .help {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 150px;

    :deep .el-checkbox__label,
    .el-button--text {
      color: #000;
    }
  }

  .active-account {
    :deep .el-form-item__content {
      justify-content: center;
    }
  }

  .login-button {
    width: 100%;
  }

  .tip {
    width: 100%;
    overflow-wrap: break-word;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    white-space: nowrap;
    text-align: center;
  }

  :deep .el-input {
    background-color: transparent;
  }

  :deep .el-input__wrapper {
    background-color: transparent;
  }

  .verificationCodeImg {
    width: 100px;
    height: 50px;
  }

  .verificationCode {
    :deep .el-form-item__content {
      flex-wrap: nowrap;
      justify-content: space-between;
    }
  }
}
</style>
