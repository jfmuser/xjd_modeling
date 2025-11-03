<template>
    <el-dialog v-model="props.showAddEngineDialog" title="添加引擎" width="30%" @close="resetForm">
        <el-form :label-position="left" label-width="auto" :model="formData" style="max-width: 600px" :rules="rules" ref="ruleFormRef">
            <el-form-item label="引擎名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入引擎名称" />
            </el-form-item>
            <el-form-item label="引擎类型" prop="engine">
                <el-select v-model="formData.engine" placeholder="请选择引擎类型" style="width: 100%;">
                    <el-option :label="engineType[0]" value="0" />
                    <el-option :label="engineType[1]" value="1" />
                    <el-option :label="engineType[2]" value="2" />
                    <el-option :label="engineType[3]" value="3" />
                    <el-option :label="engineType[4]" value="4" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="resetForm">取消</el-button>
                <el-button type="primary" @click="createEngine(ruleFormRef)">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { addEngine } from '../../apis/manager/managerApi'
import { engineType } from '../../utils'

const props = defineProps({
    showAddEngineDialog: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['close'])

const ruleFormRef = ref(null)
const formData = reactive({
    name: '',
    engine: ''
})
const rules = reactive({
    name: [
        { required: true, message: '请输入引擎名称', trigger: 'blur' },
        { max:16, message: '最多输入16个字符', trigger: 'change' }
    ],
    engine: [
        { required: true, message: '请选择引擎类型', trigger: 'blur' },
        { max: 16, message: '最多输入16个字符', trigger: 'change' }
    ]
})

async function createEngine(formEl) {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                const selfInfo = JSON.parse(sessionStorage.getItem('selfParties'))
                await addEngine({ ...formData, domainId: selfInfo.id })
                resetForm()
                ElMessage({
                    message: '添加成功',
                    type: 'success'
                })
            } catch (error) {
                console.error(error);
                // ElMessage.error(error)
            }
        } else {
            console.log('添加失败',fields);
        }
    })
}

function resetForm() {
    formData.name = ''
    formData.engine = ''
    emit('close')
}
</script>
<style scoped>
:deep .el-form-item__label {
   color: #000 !important;
;
}

:deep .el-form-item {
  color: #000;
}
</style>
