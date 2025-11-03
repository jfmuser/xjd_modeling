<template>
      <!-- 第一次登陆强制修改修改密码 -->
      <el-dialog v-model="props.visible" :before-close="onClose" title="首次登录修改密码" :show-close="false" :close-on-click-modal="false"
        :destroy-on-close="true" width="600px" :center="true">
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
</template>
<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { updataPassword } from '../../apis/dept/auth.api';
import AES from '@/utils/aesCrypto';
import useAuthStore from '../../stores/auth.store';

const props = defineProps({
    visible: {
        type: Boolean,
        default:false
    }
})

const emit = defineEmits(['updataPasswordSucceed'])
const authStore = useAuthStore()
const router = useRouter()
const state = reactive({
    formModel: {
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
})

const onConfirm = async () => {
    const AesUserPassword = AES.encrypt(state.formModel.password);
    const AesUserNewPassword = AES.encrypt(state.formModel.newPassword);
    // 这个问题解决的是 一旦密码不符合规范 回显不正常问题
    const deepCopy = JSON.parse(JSON.stringify(state.formModel));
    deepCopy.password = AesUserPassword;
    deepCopy.newPassword = AesUserNewPassword;
    delete deepCopy.newPasswordConfirm;
    await updataPassword(deepCopy);
    // 修改密码后 重新登录
    logOut();
};

const logOut = async () => {
    await authStore.logout(() => {
        router.push({ name: 'login' });
        localStorage.clear();
    });
    emit('updataPasswordSucceed')
};


</script>