<script setup>
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import ListContainer from '../../layouts/ListContainer.vue';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import { SiteRole } from '../../utils/const';
import { registerSite } from '../../apis/dept/site.api';

const state = reactive({
  loading: false,
  formModel: JSON.parse(localStorage.getItem('activateData')),
});
const NetworkDialogRef = ref(null);
const router = useRouter();

function onUpdateNetwork({ networkAccessType, data }) {
  state.formModel[networkAccessType] = data;
}
async function onActivate() {
  try {
    state.loading = true;
    await registerSite({
      ...state.formModel,
      id: state.formModel.federatedOrganizationId,
      appKey: state.formModel.secretInfo.key,
      appSecret: state.formModel.secretInfo.secret,
      siteId: state.formModel.id,
      cmRollSiteNetworkAccessExitsList:
        state.formModel.rollSiteNetworkAccessExits,
    });
    ElMessage.success('激活成功');
    router.push({ name: 'deptManagement' });
  } catch (error) {
    console.error(error);
    ElMessage.error(error || '激活失败');
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <ListContainer v-loading="state.loading" title="激活站点">
    <template #header-tool>
      <el-button type="text" @click="onActivate">激活</el-button>
    </template>
    <ListContainerItem title="基本信息">
      <el-form ref="FormRefBasic" label-width="120px" inline>
        <el-form-item label="部门名称">
          {{ state.formModel.siteName }}
        </el-form-item>
        <el-form-item label="组织名称">
          {{ state.formModel.institutions }}
        </el-form-item>
        <el-form-item label="部门ID">
          {{ state.formModel.partyId }}
        </el-form-item>
        <el-form-item label="部门角色">
          {{ SiteRole.getText(state.formModel.role) }}
        </el-form-item>
        <el-form-item label="Federation key" class="with-action">
          <el-input
            v-model="state.formModel.secretInfo.key"
            disabled
          ></el-input>
          <C2Copy
            v-if="state.formModel.secretInfo.key"
            :text="state.formModel.secretInfo.key"
          />
        </el-form-item>
        <el-form-item label="Secret Key" class="with-action">
          <el-input
            v-model="state.formModel.secretInfo.secret"
            disabled
          ></el-input>
          <C2Copy
            v-if="state.formModel.secretInfo.secret"
            :text="state.formModel.secretInfo.secret"
          />
        </el-form-item>

        <el-form-item
          v-if="state.formModel.registrationLink"
          label="注册链接"
          class="with-action"
        >
          <el-input
            v-model="state.formModel.registrationLink"
            disabled
          ></el-input>
          <C2Copy
            v-if="state.formModel.registrationLink"
            :text="state.formModel.registrationLink"
          />
        </el-form-item>
      </el-form>
    </ListContainerItem>

    <ListContainerItem title="消息队列网关设置">
      <el-form
        ref="FormRef"
        :model="state.formModel"
        label-width="180px"
        inline
      >
        <el-form-item label="部门消息队列入口" prop="networkAccessEntrances">
          {{ state.formModel.networkAccessEntrances }}
          <el-button
            type="text"
            @click="
              () =>
                NetworkDialogRef.show(
                  state.formModel.networkAccessEntrances,
                  'networkAccessEntrances',
                )
            "
          >
            <el-icon>
              <Plus></Plus>
            </el-icon>
          </el-button>
        </el-form-item>
        <el-form-item label="默认消息队列网关入口" prop="fmRollSiteNetworkEntrances">
          {{ state.formModel.fmRollSiteNetworkEntrances }}
          <el-button
            type="text"
            @click="
              () =>
                NetworkDialogRef.show(
                  state.formModel.fmRollSiteNetworkEntrances,
                  'fmRollSiteNetworkEntrances',
                )
            "
          >
            <el-icon>
              <Plus></Plus>
            </el-icon>
          </el-button>
        </el-form-item>
        <el-form-item label="默认消息队列网关出口">
          {{ state.formModel.fmRollSiteNetworkAccessExitsList }}
          <el-button
            type="text"
            @click="
              () =>
                NetworkDialogRef.show(
                  state.formModel.fmRollSiteNetworkAccessExitsList,
                  'fmRollSiteNetworkAccessExitsList',
                )
            "
          >
            <el-icon>
              <Plus></Plus>
            </el-icon>
          </el-button>
        </el-form-item>
        <el-form-item label="加密传输">
          <el-radio-group v-model="state.formModel.secureStatus">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="2">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="单向传输">
          <el-radio-group v-model="state.formModel.pollingStatus">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="2">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </ListContainerItem>
  </ListContainer>
  <NetworkDialog ref="NetworkDialogRef" @done="onUpdateNetwork"></NetworkDialog>
</template>

<style scoped></style>
