<template>
    <el-dialog v-model="props.dialogVisible" title="修改登录名" width="30%">
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="demo-ruleForm" :size="formSize" status-icon>
            <el-form-item label="登录名" prop="username">
                <el-input v-model="ruleForm.username" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="() => emit('close')">取消</el-button>
                <el-button type="primary" @click="submit(ruleFormRef)">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { reactive,ref, watch } from 'vue'
import { updateUsername } from '../../apis/dept/auth.api'
import { useRouter } from 'vue-router';
import useAuthStore from '../../stores/auth.store';

const props = defineProps({
    dialogVisible: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        default:''
    },
    userId: {
        type: String,
        default:''
    }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const router = useRouter()
watch(() => props.username, (newVal) => {
    ruleForm.username = newVal
})

const ruleForm = reactive({
    username: ''
})
const ruleFormRef = ref(null)
const rules = reactive({
    username: [
        { required: true, message: '请输入登录名', trigger: 'blur' },
        { max: 16, message: '最多只能输入16个字符', trigger: 'change' },
        { pattern: /^[0-9a-zA-Z_]*$/g, message: '登录名只能为英文格式', trigger: 'change' },
    ]
})

async function submit(formEl) {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            await updateUsername({ id: props.userId, username: ruleForm.username })
            ElMessage({
                message: '修改登录名成功',
                type: 'success',
            })
            emit('close')
            if (props.userId === authStore.userInfo.id) {
                logout()
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}

async function logout() {
  await authStore.logout(() => {
    authStore.loginStatus = false
    localStorage.clear();
    sessionStorage.clear();
    let routerList = router.getRoutes()
    routerList.forEach(item => {
      if (item.name === 'login' || item.name === 'home' || item.name === 'crossroad' || item.name === '404') return
      router.removeRoute(item.name)
    })
    router.push({ name: 'login' });
  });
}
</script>