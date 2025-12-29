<template>
  <div class="table-container"
       v-loading="loading">
    <div class="table-container__header">
      <div class="title--primary">权限管理</div>
      <div class="tool">
        <el-button type="text"
                   @click="onEdit"
                   v-show="!edit">
          <el-icon>
            <Edit />
          </el-icon>
          编辑
        </el-button>
        <el-button type="text"
                   @click="onBack"> 返回 </el-button>
        <el-button type="text"
                   @click="onSave"
                   v-show="edit">保存</el-button>
        <el-button type="text"
                   @click="onCancel"
                   v-show="edit">取消</el-button>
      </div>
    </div>
    <el-form class="padding20"
             :inline="true"
             :model="baseForm"
             label-width="100px">
      <el-form-item label=""
                    style="width: 100%">
        <el-row :gutter="20"
                style="width: 100%">
          <el-col :span="4">
            <h4>可见页面</h4>
          </el-col>
          <el-col :span="20">
            <h4>功能权限</h4>
          </el-col>
        </el-row>
        <el-checkbox-group v-model="authPages"
                           style="width: 100%">
          <div v-for="item in menuList">
            <el-row :gutter="20"
                    style="width: 100%">
              <el-col :span="4">
                <el-checkbox :label="item.id"
                             :disabled="!edit">{{ item.name }}
                </el-checkbox>
              </el-col>
              <el-col :span="20">
                <el-checkbox v-for="item in authData[item.path]"
                             :label="item.id"
                             :disabled="!edit">
                  {{ item.name }}
                </el-checkbox>
              </el-col>
            </el-row>
          </div>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, onBeforeMount } from 'vue';
import { getAllAuth, getRoleAuth, updateRoleAuth } from '@/apis/dept/auth.api';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
// 判断当前是否是编辑状态
const edit = ref(false);
// 菜单
const menuList = ref([]);
//拥有菜单
const authPages = ref([]);
//功能列表
const authData = ref({});
//loading加载
const loading = ref(false);
//所有路由
/**
 * @description 页面加载拿到所有页面
 *
 * **/
onBeforeMount(() => {
  handlePermissionData();
  getRoleMenuList();
});

/**
 * @description 权限分类(菜单,功能)
 * **/
const handlePermissionData = async () => {
  const data = await getAllAuth({});
  let obj = {};
  const arr = data.filter((item) => !item.path.includes('.')); //菜单
  menuList.value = [...arr];
  arr.map((item) => {
    obj[item.path] = data.filter((x) => x.path.includes(`${item.path}.`));
  });
  authData.value = { ...obj };
  console.log(authData.value, 'wowowo');
};

/**
 * @description 开启编辑状态
 *
 * **/
const onEdit = () => {
  edit.value = true;
};

/**
 * @description 取消保存事件
 *
 * **/
const onCancel = () => {
  edit.value = false;
};

/**
 * @description 保存
 * **/
const onSave = async () => {
  try {
    loading.value = true;
    const payload = authPages.value.map((item) => ({ menuId: item }));
    await updateRoleAuth({ roleId: route.query.id, payload });
    ElMessage.success('操作成功');
    edit.value = false;
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '操作失败');
  } finally {
    loading.value = false;
  }
};

/**
 * @description 获取当前角色拥有的权限
 * **/
const getRoleMenuList = async () => {
  console.log(route.query.id, 'route.query.id');
  if (!route.query.id) {
    router.push({ name: 'authRole' });
  }
  const data = await getRoleAuth({ roleId: route.query.id, type: 0 });
  authPages.value = data.map((item) => item.menuId);
};

function onBack () {
  router.push({ name: 'authRole' });
}
</script>
<style lang="scss" scoped>
.table-container {
  height: 100%;
  background-color: #fff;
  padding: 0 20px;
  overflow: auto;

  &__header {
    // height: 3rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0 18px;
    border-bottom: $headerBackgroundColor solid 1px;

    .tool {
      margin-left: auto;
    }
  }

  &__subheader {
    padding: 15px 18px 5px;
    height: 40px;
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