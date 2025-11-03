<template>
  <ListContainer title="系统配置">
    <template #header-tool>
      <el-button type="text" @click="() => { isShowDialog = true }">
        添加系统配置
      </el-button>
      <el-button type="text" @click="openUploadInput">
        上传签名文件
      </el-button>
      <input type="file" id="fileInput" @change="uploadVotingSing" accept=".yaml" required style="display: none;">
    </template>
    <div class="main">
      <!-- <TextButton title="添加系统配置" :click="()=>{isShowDialog = true}"  /> -->
      <el-collapse v-model="activeNames" @change="handleChange" v-for="(item, i) in tableData" :key="i"
        v-loading="loading">
        <el-collapse-item :title="item.type" name="1">
          <el-table :data="item.children" style="width: 100%">
            <el-table-column prop="configCode" label="配置编码" />
            <el-table-column prop="configName" label="配置名称" />
            <el-table-column prop="configValue" label="配置值" />
            <el-table-column prop="sort" label="排序" />
            <el-table-column prop="remarks" label="备注" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-space>
                  <el-button type="text" @click="handleEdit(row)">
                    编辑
                  </el-button>
                  <el-button type="text" @click="handleDel(row)">
                    删除
                  </el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- 添加系统配置的弹框 -->
    <el-dialog v-model="isShowDialog" title="添加系统配置" width="30%" @close="closeConfigDialog(ruleFormRef)">
      <el-form :model="systemConfigForm" :rules="rules" ref="ruleFormRef">
        <el-form-item label="配置类型" label-width="120px" prop="configType">
          <el-select v-model="systemConfigForm.configType" filterable allow-create default-first-option
            :reserve-keyword="false" style="width: 100%;">
            <el-option v-for="item in tableData" :key="item.type" :label="item.type" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置编码" label-width="120px" prop="configCode">
          <el-input v-model="systemConfigForm.configCode" autocomplete="off" :disabled="systemConfigForm.id" />
        </el-form-item>
        <el-form-item label="配置名称" label-width="120px" prop="configName">
          <el-input v-model="systemConfigForm.configName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="配置值" label-width="120px" prop="configValue">
          <el-input v-model="systemConfigForm.configValue" autocomplete="off" />
        </el-form-item>
        <el-form-item label="排序" label-width="120px" prop="sort">
          <el-input v-model="systemConfigForm.sort" autocomplete="off" />
        </el-form-item>
        <el-form-item label="备注" label-width="120px" prop="remarks">
          <el-input v-model="systemConfigForm.remarks" type="textarea" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeConfigDialog(ruleFormRef)">取消</el-button>
          <el-button type="primary" @click="handleAddConfig(ruleFormRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </ListContainer>
</template>
<script setup>
import { ref, onBeforeMount, reactive } from 'vue'
import ListContainer from '../../layouts/ListContainer.vue'
import { getConfigList, addConfigInfo, delConfigInfo, updateConfigInfo } from '../../apis/manager/managerApi.js'
import { uploadingVotingSign } from '../../apis/result/result.api.js'

// 展示的数据
const tableData = ref([])
// 系统配置的表单数据
const systemConfigForm = reactive({})
//控制dialog是否显示
const isShowDialog = ref(false)
// 折叠面板默认展开
const activeNames = ref(['1'])
// 是否显示加载动画
const loading = ref(false)
// 表单对象
const ruleFormRef = ref()
// 表单校验
const rules = reactive({
  configType: [
    { required: true, message: '系统配置类型不能为空', trigger: 'blur' },
    // { pattern: '^[A-Za-z]+$', message: '系统配置类型只能是英文', trigger: 'blur' }
  ],
  configCode: [
    { required: true, message: '系统配置编码不能为空', trigger: 'blur' },
    { pattern: '^[A-Za-z_]+$', message: '系统配置编码只能是英文和下划线', trigger: 'blur' }
  ],
  configName: [
    { required: true, message: '系统配置名称不能为空', trigger: 'blur' },
    { pattern: '^[\u4e00-\u9fa5A-Za-z0-9-]+$', message: '系统配置名称只能为中英文数字和横线', trigger: 'blur' }
  ],
  configValue: [
    { required: true, message: '系统配置值不能为空', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '系统配置排序不能为空', trigger: 'blur' },
    { pattern: '^[0-9]*$', message: '系统配置排序只能为数字', trigger: 'blur' }
  ]
})

onBeforeMount(async () => {
  tableDataInit()
})

/**
 * @description 初始化表格值
 * 
 * **/

const tableDataInit = async () => {
  const data = await getConfigList({ category: 'system' })
  //存储配置类型，如果有那就放在同一类型下
  const configTypeList = []
  data.forEach(async (item) => {
    if (configTypeList.includes(item.configType)) {
      await setTableData(item)
    } else {
      configTypeList.push(item.configType)
      tableData.value.push({ type: item.configType, children: [item] })
    }
  })
  console.log(tableData);
}


const setTableData = (item) => {
  tableData.value.forEach(configObj => {
    if (configObj.type === item.configType) {
      configObj.children.push(item)
    }
  })
}

/**
 * @description 添加系统配置
 * 
 * **/

const handleAddConfig = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    console.log(typeof systemConfigForm.sort);
    if (valid) {
      loading.value = true
      isShowDialog.value = false
      if (systemConfigForm.id) {
        await updateConfigInfo({ category: 'system', ...systemConfigForm })
        ElMessage({
          message: '修改成功',
          type: 'success',
        });
      } else {
        await addConfigInfo({ category: 'system', ...systemConfigForm })
        ElMessage({
          message: '添加成功',
          type: 'success',
        });
      }
      tableData.value = []
      await tableDataInit()
      loading.value = false
    } else {
      console.log('error submit!', fields);
    }
  })
}

/**
 * @description 关闭添加配置弹框
 * 
 * **/

const closeConfigDialog = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  delete systemConfigForm.configType
  delete systemConfigForm.configCode
  delete systemConfigForm.configName
  delete systemConfigForm.configValue
  delete systemConfigForm.sort
  delete systemConfigForm.id
  delete systemConfigForm.remarks
  isShowDialog.value = false
}

/**
 * @description 编辑系统配置
 * 
 * **/

const handleEdit = (row) => {
  systemConfigForm.configType = row.configType
  systemConfigForm.configCode = row.configCode
  systemConfigForm.configName = row.configName
  systemConfigForm.configValue = row.configValue
  systemConfigForm.sort = row.sort + ''
  systemConfigForm.id = row.id
  systemConfigForm.remarks = row.remarks
  isShowDialog.value = true
}

/**
 * @description 删除功能
 * 
 * **/

const handleDel = (row) => {
  ElMessageBox.confirm(
    '确定删除吗?',
    '警示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      loading.value = true
      await delConfigInfo(row.id)
      tableData.value = []
      await tableDataInit()
      loading.value = false
      ElMessage({
        message: '删除成功',
        type: 'success',
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}

/**
 * @description 打开上传的弹框
*/
function openUploadInput() {
  const fileInput = document.querySelector('#fileInput')
  fileInput.click()

}

/**
 * @description 上传投票签名
 */
async function uploadVotingSing() {
  const fileInput = document.querySelector('#fileInput')
  const file = fileInput.files[0];  //获取选择的文件
  if (file) {
    const formData = new FormData();
    formData.append('file', file); // 将文件添加到 FormData 对象
    // try {
 
    const res = await uploadingVotingSign(formData)
    
    const resFile = localStorage.getItem('file')
    let fileName = localStorage.getItem('content-disposition')
    fileName = fileName.split('=')[1]
    
    // 创建一个 Blob 对象
    const blob = new Blob([resFile], { type: 'application/octet-stream' });
    // 创建一个 URL 对象
    const url = URL.createObjectURL(blob);
    // 创建一个临时的链接元素
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // 设置下载文件的名称

    // 触发点击事件以下载文件
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 释放 URL 对象
    ElMessage({
      message: '上传成功',
      type: 'success',
    })
    // 上传成功后，下载签名
    // window.open('/result/genRequest/model_uuid')
    // } catch (error) {
    //   ElMessage.error('上传失败，请重试')
    // }
    fileInput.value = null
  }
}
</script>
<style scoped lang="scss">
:deep .el-collapse-item__header {
  font-size: 28px;
  font-weight: 700;
}

:deep .el-collapse-item__content {
  padding-bottom: 0;
}
</style>