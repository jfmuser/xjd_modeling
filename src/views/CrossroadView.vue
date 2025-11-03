<script setup>
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getWorkspace, updataPassword } from '../apis/dept/auth.api';
import useAuthStore from '@/stores/auth.store';
import AES from '@/utils/aesCrypto';
const router = useRouter();
const authStore = useAuthStore();
const state = reactive({
  loading: false,
  platforms: [],
  formModel: {
    // username: authStore.loginName,
    password: '',
    newPassword: '',
    newPasswordConfirm: '',
  },
  rules: {
    password: [
      {
        validator: (rule, value, callback) => {
          if (state.formModel.password) {
            if (!value) {
              callback(new Error('不能为空'));
              return;
            }
          }
        },
      },
    ],
    newPassword: [
      {
        validator: (rule, value, callback) => {
          if (state.formModel.password == state.formModel.newPassword) {
            callback(new Error('新旧密码不能相同'));
            return;
          }
          if (state.formModel.newPassword) {
            if (!value) {
              callback(new Error('不能为空'));
              return;
            }
          }

          if (value && (value.length < 8 || value.length > 16)) {
            callback(
              new Error(
                '密码需包含大小写字母和数字和特殊字符组合，且密码长度在8位与16位之间',
              ),
            );
            return;
          }

          callback();
        },
      },
    ],
    newPasswordConfirm: [
      {
        validator: (rule, value, callback) => {
          if (
            state.formModel.newPassword !== state.formModel.newPasswordConfirm
          ) {
            callback(new Error('两次填写的密码不一致'));
            return;
          }
          if (state.formModel.newPasswordConfirm) {
            if (!value) {
              callback(new Error('不能为空'));
              return;
            }
          }
          callback();
        },
      },
    ],
  },
});

// 是否显示弹框
const visible = ref(false);
onMounted(() => {
  initCodeShow();
  fetchApps();
});
const initCodeShow = () => {
  const code = localStorage.getItem('code');
  if (code === '10101') {
    visible.value = true;
  } else {
    visible.value = false;
  }
};
async function fetchApps() {
  try {
    const response = await getWorkspace();
    state.platforms = response.systemInfoList;
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '服务器出错');
  }
}
// 登录
function onClick(val) {
  if (val.systemType === 'MANAGER') {
    // router.push({ name: 'deptManagement' });
    const { href } = router.resolve({ path: '/home' })
    window.open(href, '_blank')
  } else {
    const url = `${val.remarks}/#/?token=${localStorage.getItem('token')}`;
    // const url = `http://localhost:5555/#/?token=${localStorage.getItem('token')}`;
    window.open(url, '_blank');
  }
}
// 修改密码
const onConfirm = async () => {
  const AesUserPassword = AES.encrypt(state.formModel.password);
  const AesUserNewPassword = AES.encrypt(state.formModel.newPassword);
  // 这个问题解决的是 一旦密码不符合规范 回显不正常问题
  const deepCopy = JSON.parse(JSON.stringify(state.formModel));
  deepCopy.password = AesUserPassword;
  deepCopy.newPassword = AesUserNewPassword;
  delete deepCopy.newPasswordConfirm;
  await updataPassword(deepCopy);
  visible.value = false;
  // 修改密码后 重新登录
  logOut();
};
const logOut = async () => {
  await authStore.logout(() => {
    router.push({ name: 'login' });
    localStorage.clear();
  });
};
</script>

<template>
  <div class="crossroad-wrapper">
    <div class="title" v-show="!visible">选择登录平台</div>
    <div v-loading="state.loading" class="platform-list" v-show="!visible">
      <el-card v-for="item in state.platforms" :key="item.id" shadow="hover" class="platform-item">
        <div v-if="item.systemType !== 'MANAGER'" class="name">部门名称:</div>
        <el-link :underline="false" class="name" @click="onClick(item)">
          {{ item.systemType === 'MANAGER' ? '管理平台' : item.name }}
        </el-link>
      </el-card>
      <div v-if="state.platforms.length === 0" class="tip">
        请联系管理员添加权限
      </div>
    </div>
    <el-dialog v-model="visible" :before-close="onClose" title="首次登录修改密码" :show-close="false"
      :close-on-click-modal="false" :destroy-on-close="true" width="600px" :center="true">
      <el-form ref="formRef" label-width="90px" :model="state.formModel" :rules="state.rules"
        :validate-on-rule-change="false">
        <el-form-item label="旧密码">
          <el-input v-model="state.formModel.password" prop="password" show-password
            autocomplete="new-password"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="state.formModel.newPassword" show-password autocomplete="new-password"></el-input>
        </el-form-item>
        <el-form-item label="重复新密码" prop="newPasswordConfirm">
          <el-input v-model="state.formModel.newPasswordConfirm" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <!-- <el-button @click="onClose">取消</el-button> -->
        <el-button type="primary" @click="onConfirm">重置密码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.crossroad-wrapper {
  height: 100%;
  background-image: url('../assets/bg.png');
  background-repeat: no-repeat;
  background-size: cover;
}

.title {
  width: 100%;
  text-align: center;
  padding: 100px;
  font-size: 30px;
  color: #fff;
}

.platform-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;

  .platform-item {
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);

    .name {
      font-size: 16px;
      color: #fff;
    }
  }

  .tip {
    font-size: 20px;
    color: #fff;
  }
}
</style>
