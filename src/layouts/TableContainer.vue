// 查看所有页面
<script setup>
import { ElMessage } from 'element-plus';
import { reactive, onMounted, ref, computed, watch } from 'vue';
import { ElNotification } from 'element-plus';
import useEnv from '@/hooks/useEnv.js';
import {
  SearchData,
  importData,
  DeleteData,
  EditDatas,
  importHistoryData,
} from '../apis/workspace/data.api';
import useAuthStore from '../stores/auth.store';
const authStore = useAuthStore();
const data = reactive({
  gridData: [],
  // 是否显示弹框
  dialogTableVisible: false,
  EditdialogTableVisible: false,
  dialogTableHistoryVisible: false,
  historyData: [],
});
const state = reactive({
  model: {},
  dataTypes: [],
});

onMounted(async () => {
  // init();
});
const init = async () => {
  // const { records } = await SearchData();
  // data.gridData = records;
};
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  showFilter: {
    type: Boolean,
    default: true,
  },
  showAdd: {
    type: Boolean,
    default: true,
  },
  showImport: {
    type: Boolean,
    default: true,
  },
  subTitle: {
    type: String,
    default: '',
  },
  showPagination: {
    type: Boolean,
    required: false,
    default: true,
  },
  showSync: {
    type: Boolean,
    default: false,
  },
  showDerive: {
    type: Boolean,
    default: false,
  },
});

const pager = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const emits = defineEmits(['page-change', 'search', 'add', 'import']);

function onPageChange (page) {
  emits('page-change', page);
}
function onSearch () {
  emits('search');
}

function onResetSearch () {
  emits('search', true);
}

function onAdd () {
  if (props.title === '联邦项目') {
    emits('edit');
    return;
  }
  emits('add');
}
// 导入按钮
function onImport () {
  init();
  // 判断当前页面是否为算法库列表
  if (props.title !== '算法库列表') {
    // 弹框显示
    data.dialogTableVisible = true;
  }
  emits('import');
}
// 同步按钮
async function onSync () {
  await authStore.asyncAuthority();
  ElMessage({
    message: '同步路由成功',
    type: 'success',
  });
}
async function onDerive () {
  let token = localStorage.getItem('token');
  window.open(`/audit/select/export?token=${token}`);
  // window.location.href = `/audit/select/export?token=${token}`
}
// 弹框里面的导入
const handleImort = async (val, data) => {
  /**
   * val 下标
   * data 数据
   * 调用接口
   */
  await importData({ id: data.id });
  ElNotification({
    title: '上传成功',
    message: '文件上传成功',
    type: 'success',
  });
};

//导入历史记录
const ImortHistory = async (val, val1) => {
  console.log(val, val1);
  const { records } = await importHistoryData(val1.id);
  data.historyData = records;
  //调用接口 拿到id 获取历史记录
  data.dialogTableHistoryVisible = true;
};

//弹框删除
const DeletData = async (val, data) => {
  //删除接口
  await DeleteData(data.id);
  //重置刷新
  init();
  ElMessage.success('删除成功');
};
const importantValue = ref(false);
//弹框编辑
const EditData = async (val, val1) => {
  console.log(typeof val1.head);
  //如是kafa 显示
  if (val1.kafkaPort) {
    importantValue.value = true;
    kafakData(val1);
  } else {
    importantValue.value = false;
    normalSql(val1);
  }
  data.EditdialogTableVisible = true;
};
const kafakData = (val1) => {
  state.model.dataName = val1.dataName;
  state.model.dataType = val1.dataType;
  state.model.head = Number(val1.head);
  state.model.dataPartitions = val1.dataPartitions;
  state.model.namespace = val1.namespace;
  state.model.numberOfReadBars = val1.numberOfReadBars;
  state.model.queueName = val1.queueName;
  state.model.kafkaUrl = val1.kafkaUrl;
  state.model.kafkaPort = val1.kafkaPort;
  state.model.remarks = val1.remarks;
  state.model.id = val1.id;
};
const normalSql = (val1) => {
  state.model.dataName = val1.dataName;
  state.model.dataType = val1.dataType;
  state.model.head = Number(val1.head);
  state.model.dataPartitions = val1.dataPartitions;
  state.model.namespace = val1.namespace;
  state.model.dbUrl = val1.dbUrl;
  state.model.dbName = val1.dbName;
  state.model.dbPort = val1.dbPort;
  state.model.dbPassword = val1.dbPassword;
  state.model.dbUsername = val1.dbUsername;
  state.model.dbSql = val1.dbSql;
  state.model.id = val1.id;
};
// 修改确定
const onConfirm = async () => {
  data.EditdialogTableVisible = false;
  await EditDatas(state.model);
  //查询
  init();
  ElMessage.success('操作成功');
  //置空
  state.model = {};
};
const onClose = async () => {
  data.EditdialogTableVisible = false;
};
// 状态
const stateFormat = (row, column) => {
  console.log(row);
  return row.status == 'success' ? '成功' : '失败';
};

defineExpose({ pager });
watch(() => pager, () => { console.log(33, { pager }) }, { flush: 'post', immediate: true })
</script>

<template>
  <div class="table-container">
    <div v-if="props.title"
         class="table-container__header">
      <div class="title--primary">
        {{ props.title }}
        <slot name="title--primary"></slot>
      </div>
      <div class="tool">
        <slot name="header-tool"></slot>
        <el-button v-if="showAdd"
                   type="text"
                   @click="onAdd"
                   v-permission="'add'">
          <el-icon>
            <Plus></Plus>
          </el-icon>
          添加
        </el-button>
        <el-button v-if="showImport"
                   type="text"
                   @click="onImport">
          <el-icon><img src="../assets/workspace/import.svg"
                 alt="" /></el-icon>
          导入
        </el-button>
        <!-- <el-button v-if="showSync" type="text" @click="onSync">
          <el-icon>
            <Document />
          </el-icon>
          同步所有路由
        </el-button> -->
        <el-button v-if="showDerive"
                   type="text"
                   @click="onDerive">
          <el-icon><img src="../assets/workspace/export.svg"
                 alt="" /></el-icon>
          导出
        </el-button>
        <!-- <el-button  type="text" @click="onImport">
                                                                                                                                  <el-icon><img src="../assets/workspace/import.svg" alt="" /></el-icon>
                                                                                                                                  历史记录
                                                                                                                                </el-button> -->
      </div>
    </div>
    <div v-if="props.subTitle"
         class="table-container__subheader">
      <div class="title--secondary">{{ props.subTitle }}</div>
      <div class="tool">
        <slot name="subheaderTool"></slot>
      </div>
    </div>
    <div>
      <slot name="header-extra"></slot>
    </div>
    <div v-if="props.showFilter"
         class="table-container__filter">
      <slot name="filter"></slot>
      <div class="buttons">
        <el-button type="primary"
                   @click="onSearch">查询</el-button>
        <el-button type="default"
                   @click="onResetSearch">重置</el-button>
      </div>
    </div>
    <div class="table-container__table">
      <slot name="default"></slot>
    </div>
    <div v-if="showPagination"
         class="table-container__pagination">
      <el-pagination v-model:current-page="pager.page"
                     size="small"
                     :page-size="pager.size"
                     :total="pager.total"
                     background
                     layout="total, prev, pager, next"
                     @current-change="onPageChange"></el-pagination>
    </div>
    <!-- 导入的弹框 -->
    <div>
      <!-- 显示 -->
      <el-dialog title="导入文件"
                 v-model="data.dialogTableVisible">
        <el-table :data="data.gridData">
          <el-table-column property="dataName"
                           label="数据名"></el-table-column>
          <el-table-column property="dataType"
                           label="数据类型"></el-table-column>
          <el-table-column property="creator"
                           label="创建人"></el-table-column>
          <el-table-column property="createdTime"
                           label="创建时间"></el-table-column>
          <el-table-column label="导入"
                           align="center">
            <template #default="scope">
              <el-button size="small"
                         @click="handleImort(scope.$index, scope.row)"><el-icon><img src="../assets/workspace/import.svg"
                       alt="" /></el-icon>导入文件</el-button>
              <el-button size="small"
                         @click="ImortHistory(scope.$index, scope.row)">历史记录</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作"
                           align="center">
            <template #default="scope">
              <el-button size="small"
                         @click="DeletData(scope.$index, scope.row)"
                         type="danger">删除</el-button>
              <el-button size="small"
                         @click="EditData(scope.$index, scope.row)"
                         type="primary">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <!-- 编辑 -->
      <el-dialog title="编辑"
                 v-model="data.EditdialogTableVisible">
        <el-form ref="DataFormRef"
                 :model="state.model"
                 label-width="100px">
          <el-form-item label="数据名称"
                        prop="dataName">
            <el-input v-model="state.model.dataName" />
          </el-form-item>
          <!-- 需要修改的地方 -->
          <el-form-item label="数据类型"
                        prop="dataType">
            <!-- 默认选择下拉框数据 -->
            <el-select v-model="state.model.dataType"
                       style="width: 100%"
                       disabled>
              <!-- <el-option
                                                                                                                                        v-for="item in state.dataTypes"
                                                                                                                                        :key="item.code"
                                                                                                                                        :label="item.name"
                                                                                                                                        :value="item.code"
                                                                                                                                      >
                                                                                                                                      </el-option> -->
            </el-select>
          </el-form-item>
          <el-form-item label="是否有表头"
                        prop="head">
            <el-switch v-model="state.model.head"
                       :active-value="1"
                       :inactive-value="0" />
          </el-form-item>
          <el-form-item label="分区数"
                        prop="dataPartitions">
            <el-input v-model.number="state.model.dataPartitions" />
          </el-form-item>
          <el-form-item label="命名空间"
                        prop="namespace">
            <el-input v-model="state.model.namespace" />
          </el-form-item>

          <template v-if="!importantValue">
            <el-form-item label="数据库地址"
                          prop="dbUrl">
              <el-input v-model="state.model.dbUrl" />
            </el-form-item>
            <el-form-item label="数据库名称"
                          prop="dbName">
              <el-input v-model="state.model.dbName" />
            </el-form-item>
            <el-form-item label="数据库端口"
                          prop="dbPort">
              <el-input v-model="state.model.dbPort" />
            </el-form-item>
            <el-form-item label="数据库密码"
                          prop="dbPassword">
              <el-input v-model="state.model.dbPassword"
                        type="password" />
            </el-form-item>
            <el-form-item label="数据库用户名"
                          prop="dbUsername">
              <el-input v-model="state.model.dbUsername" />
            </el-form-item>
            <el-form-item label="查询语句"
                          prop="dbSql">
              <el-input v-model="state.model.dbSql" />
            </el-form-item>
          </template>
          <!-- kafka数据库 -->
          <template v-if="importantValue">
            <el-form-item label="行数"
                          prop="numberOfReadBars">
              <el-input v-model="state.model.numberOfReadBars" />
            </el-form-item>
            <el-form-item label="队列名"
                          prop="queueName">
              <el-input v-model="state.model.queueName" />
            </el-form-item>
            <el-form-item label="kafka地址"
                          prop="kafkaUrl">
              <el-input v-model="state.model.kafkaUrl" />
            </el-form-item>
            <el-form-item label="kafka端口"
                          prop="kafkaPort">
              <el-input v-model="state.model.kafkaPort" />
            </el-form-item>
          </template>
          <el-form-item label="备注"
                        prop="remarks">
            <el-input v-model="state.model.remarks" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button type="primary"
                     @click="onConfirm">确定</el-button>
          <el-button @click="onClose">取消</el-button>
        </template>
      </el-dialog>
      <!-- 历史记录 -->
      <el-dialog title="导入历史记录"
                 v-model="data.dialogTableHistoryVisible">
        <el-table :data="data.historyData">
          <el-table-column prop="configId"
                           label="id"> </el-table-column>
          <el-table-column prop="createdTime"
                           label="最新上传时间">
          </el-table-column>
          <el-table-column prop="creator"
                           label="创建人"> </el-table-column>

          <el-table-column prop="status"
                           label="状态"
                           :formatter="stateFormat">
          </el-table-column>
          <!-- 万一有操作 -->
          <!-- <el-table-column label="操作" align="center">
                                                                                                                                    <template #default="scope">
                                                                                                                                      <el-button
                                                                                                                                        size="small"
                                                                                                                                        @click="DeletHistoryData(scope.$index, scope.row)"
                                                                                                                                        type="danger"
                                                                                                                                        >删除</el-button
                                                                                                                                      >
                                                                                                                                    </template>
                                                                                                                                  </el-table-column> -->
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  height: 100%;
  background-color: #fff;
  padding: 0 0.078125rem;
  overflow: auto;

  &__header {
    // height: 0.1875rem;
    height: 40px;
    display: flex;
    // gap: 0.5rem;
    align-items: center;
    padding: 0 0.0703125rem;
    border-bottom: $headerBackgroundColor solid 1px;

    .tool {
      margin-left: auto;
    }
  }

  &__subheader {
    padding: 15px 18px 5px;
    height: 0.15625rem;
    border-bottom: $headerBackgroundColor solid 1px;
    display: flex;

    .tool {
      margin-left: auto;
    }
  }

  &__filter {
    margin: 26px 0;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__table {
    :deep .el-table {
      .el-table__header {
        height: 46px;
        th {
          background-color: #e6ebf5;
        }
      }

      .cell {
        text-align: center;
        color: #000;
      }

      .table-action {
        .cell {
          display: flex;
          gap: 5px;
          justify-content: center;

          .el-icon {
            cursor: pointer;
          }
        }
      }
    }
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    padding: 5px 0;
  }
}
</style>
