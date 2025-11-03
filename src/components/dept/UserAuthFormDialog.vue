<!-- 
  dept
  用户管理 创建/修改 用户信息
-->
<script setup>
import { reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { FormType, UsageStatus } from '../../utils/const';
import { createUser, updateUser } from '../../apis/dept/auth.api';
import AES from '@/utils/aesCrypto';
const defaultModel = { status: 0, username: '' };
const formRef = ref();
const state = reactive({
  visible: false,
  loading: false,
  formModel: { ...defaultModel },
  formType: new FormType(FormType.CREATE),
});
const rules = computed(() => ({
  nickname: [
    {
      required: state.formType.isCreate,
      message: '不能为空',
    },
    {
      max: 16,
      message: '最多只能输入16个字符',
      trigger:'change'
    },
  ],
  username: [
    {
      required: state.formType.isCreate,
      message: '不能为空',
    },
    {
      max: 16,
      message: '最多只能输入16个字符',
      trigger:'change'
    }
  ],
  password: [
    {
      validator: (rule, value, callback) => {
        if (state.formType.isCreate) {
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
  remarks: [
    {max:50,message:'最多只能输入50个字符',trigger:'change'}
  ]
}));

function show(data) {
  if (data) {
    state.formModel = { ...data };
    state.formType = new FormType(FormType.EDIT);
  } else {
    state.formModel = { ...defaultModel };
    state.formType = new FormType(FormType.CREATE);
  }
  state.visible = true;
}

defineExpose({ show });
const emits = defineEmits(['done']);

function onClose() {
  formRef.value.resetFields();
  state.visible = false;
}

// 创建用户
async function onConfirm() {
  try {
    const isValid = await formRef.value.validate().catch(() => {});
    if (!isValid) {
      return;
    }

    state.loading = true;
    // 添加
    if (state.formType.isCreate) {
      const AesUserName = AES.encrypt(state.formModel.username);
      const AesUserPassword = AES.encrypt(state.formModel.password);
      // 这个问题解决的是 一旦密码不符合规范 回显不正常问题
      const deepCopy = JSON.parse(JSON.stringify(state.formModel));
      deepCopy.username = AesUserName;
      deepCopy.password = AesUserPassword;
      await createUser(deepCopy);
    } else {
      // 修改
      const AesUserName = AES.encrypt(state.formModel.username);
      const AesUserPassword = AES.encrypt(state.formModel.password);
      // 这个问题解决的是 一旦密码不符合规范 回显不正常问题
      const deepCopys = JSON.parse(JSON.stringify(state.formModel));
      deepCopys.username = AesUserName;
      deepCopys.password = AesUserPassword;
      console.log(state.formModel);
      await updateUser(deepCopys);
      // return
    }

    ElMessage.success('操作成功');
    emits('done');
    onClose();
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    state.loading = false;
  }
}
</script>
<template>
  <el-dialog
    v-model="state.visible"
    :before-close="onClose"
    :title="`${state.formType.label}用户`"
    :show-close="false"
    :destroy-on-close="true"
  >
    <el-form
      ref="formRef"
      label-width="80px"
      :model="state.formModel"
      :rules="rules"
      :validate-on-rule-change="false"
    >
      <el-form-item label="名称" prop="nickname">
        <el-input v-model="state.formModel.nickname"></el-input>
      </el-form-item>
      <el-form-item
        v-if="state.formType.isCreate"
        label="登录名"
        prop="username"
      >
        <el-input v-model="state.formModel.username"></el-input>
      </el-form-item>
      <el-form-item
        label="密码"
        prop="password"
        :required="state.formType.isCreate"
      >
        <el-input
          v-model="state.formModel.password"
          show-password
          autocomplete="new-password"
        ></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="state.formModel.status">
          <el-radio
            v-for="item in UsageStatus.options"
            :key="item.value"
            :label="item.value"
            >{{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="有效期" prop="expireTime">
        <el-date-picker
          v-model="state.formModel.expireTime"
          format="YYYY-MM-DD HH:mm:ss"
          :disabledDate="
            (time) => {
              return dayjs(time).isBefore(
                dayjs(new Date()).hour(0).minute(0).second(0).millisecond(0),
              );
            }
          "
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="state.formModel.remarks" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>
<style scoped></style>
