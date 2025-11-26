<script setup>
import { onMounted, computed, watch, reactive, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { syncEngineInfo } from '../../apis/manager/managerApi';
import { formatTimestamp } from '../../utils';
// import { EditStatus, SiteRole, SiteStatus } from '../../utils/const';
// import { formatDateTime, formatTimestamp } from '../../utils';
// import { getSiteInfo, getSiteMsg } from '../../apis/dept/site.api';
// import { page } from '../../apis/secretflow/secretflow.api'
import { ElMessage } from 'element-plus';
import ListContainer from '../../layouts/ListContainer.vue';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
// import RollSiteInfo from './RollSiteInfo.vue';
// import ClusterInfo from './ClusterInfo.vue';
// import useAuthStore from '../../stores/auth.store';
import useSiteStore from '../../stores/dept/site.store';
import AddEngineDialog from './AddEngineDialog.vue';
import { engineType } from '../../utils';
import useAuthStore from '../../stores/auth.store';
import { secretflowLogin } from '../../apis/secretflow/secretflow.api';
import { getSecretflowInfo } from '../../apis/secretflowApi/secretflow.api.js';
import rsa from '../../utils/encrypt';
import { getBoardInfo } from '../../apis/innovate/innovate.api.js';
import { security, fblogin } from '../../apis/workspace/job.api';
import AES from '../../utils/aesCrypto';

let msgInterval;
const siteStore = useSiteStore();
const authStore = useAuthStore();
// const authStore = useAuthStore();
// const router = useRouter();
const route = useRoute();
// //组件实例
// const ExchangeChangeDialogRef = ref(null);
// const SiteRegisterRef = ref(null);
// const siteApplyRef = ref(null);

const state = reactive({
  loading: false,
  siteInfo: {},
  fateInfo: '',
  innovateInfo: '',
  secretflowInfo: '',
  mySite: {},
  // cloudManagerExchange: {},
});
const showAddEngineDialog = ref(false);
const selfinfo = ref(JSON.parse(sessionStorage.getItem('selfParties')));
const tableData = ref([]);
// const partyId = ref('')
// const siteID = ref('')
// const federatedId = ref('')
// const pattern = JSON.parse(localStorage.getItem('pattern'))
// const secretflowSite = ref([])
// const editStatusCode = computed(() => state.siteInfo?.editStatus?.code);
// const readStatusCode = computed(() => state.siteInfo?.readStatus?.code);
// const editSubmitted = computed(() => {
//   if (editStatusCode.value === 1 || editStatusCode.value === -1) {
//     return EditStatus.PENDING_APPROVAL;
//   }
//   if (editStatusCode.value === 2) {
//     return EditStatus.EDITABLE;
//   }
//   return null;
// });
// const exchangeReadStatus = computed(() => state.siteInfo.exchangeReadStatus);
// const exchangeInfo = computed(() => state.siteInfo.ExchangeInfo);
// const isAdmin = computed(() => authStore?.userInfo?.admin);
// watch(
//   () => exchangeReadStatus.value,
//   (val) => {
//     // TODO why is 1???
//     if (val === 1) {
//       ExchangeChangeDialogRef.value.show();
//     }
//   },
//   { immediate: true },
// );
// watch(
//   () => editSubmitted.value,
//   (val) => {
//     if (val === EditStatus.PENDING_APPROVAL) {
//       fetchMsg();
//     }
//   },
// );
// onMounted(() => { });
// onBeforeMount(async () => {
//   await fetchMainData()
//   if (msgInterval) {
//     clearInterval(msgInterval);
//   }
//   fetchData()
//   if (!pattern?.SecretName) return
//   secretflowSite.value = await page({ page: 1, secrch: '', size: 999, sort: {} })
// });

// async function fetchMainData() {
//   try {
//     state.loading = true;
//     await Promise.all([siteStore.fetchMySite(), siteStore.fetchOtherSite()]);
//     console.log(siteStore.mySite);
//     partyId.value = siteStore.mySite[0].__data.siteList[0].partyId
//     siteID.value = siteStore.mySite[0].__data.siteList[0].siteId
//     federatedId.value = siteStore.mySite[0].__data.federatedId
//   } catch (e) {
//     console.error(e);
//   } finally {
//     state.loading = false;
//   }
// }

// async function fetchMsg() {
//   try {
//     const res = await getSiteMsg({
//       partyId: partyId.value,
//       federatedId: federatedId.value,
//       siteId: siteID.value,
//     });
//     const { editStatus, readStatus } = res;
//     if (editStatus.code === 2) {
//       if (readStatus.code > 0 && readStatus.code !== 3) {
//         const message = readStatus.desc.contains('Successfully')
//           ? '成功更改网络配置！'
//           : '更改网络配置失败！';
//         ElMessageBox.alert(message, '审批消息', {
//           confirmButtonText: '确定',
//           callback: (action) => {
//             if (action !== 'confirm') {
//               return;
//             }
//             readMsg();
//           },
//         });
//       }
//     } else {
//       if (!msgInterval) {
//         msgInterval = setInterval(() => {
//           fetchMsg();
//         }, 3000);
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// async function readMsg() {
//   try {
//     await readMsg({
//       partyId: partyId.value,
//       federatedId: federatedId.value,
//       readStatus: 3,
//     });
//     if (msgInterval) {
//       clearInterval(msgInterval);
//     }
//     fetchData();
//   } catch (error) {
//     console.error(error);
//   }
// }

// async function fetchData() {
//   try {
//     state.loading = true;
//     await Promise.all([fetchSiteInfo()]);
//   } finally {
//     state.loading = false;
//   }
// }
// async function fetchSiteInfo() {
//   try {
//     const response = await getSiteInfo({
//       partyId: partyId.value,
//       federatedId: federatedId.value,
//       siteId: siteID.value,
//     });
//     state.siteInfo = response;
//   } catch (error) {
//     console.error(error);
//   }
// }

// function goInstitutionsPage(institutions) {
//   router.push({
//     name: route.name,
//     query: {
//       institutions,
//       id: institutions,
//     },
//   });
// }

onBeforeMount(async () => {
  state.mySite = siteStore.mySite;
  state.mySite.tDomainEngineList.forEach((item) => {
    handleCommand(item.id);
  });
  if (state.mySite?.tDomainEngineList.find((engine) => engine.engine == '1')) {
    const secretflowInfo = await getSecretflowInfo();
    const data = await secretflowLogin({
      name: AES.decrypt(secretflowInfo.username),
      passwordHash: AES.decrypt(secretflowInfo.password),
    });
    localStorage.setItem('User-Token', data.token);
    localStorage.setItem('secretflowUserInfo', JSON.stringify(data));
    localStorage.setItem('neverLogined', true);
  }
  if (state.mySite.tDomainEngineList.find((engine) => engine.engine == '0')) {
    //   getkey fb 获取密钥对密码加密
    const securityInfo = await security();
    let securityData = '';
    if (securityInfo && securityInfo.data) {
      securityData = securityInfo.data;
    }
    // 获取系统登录信息
    const getInfo = await getBoardInfo();
    const password = rsa(securityData, AES.decrypt(getInfo.password));
    // fb login 再次登录设置cookie
    await fblogin(AES.decrypt(getInfo.username), password);
    localStorage.setItem('CurrentUser', getInfo.username);
  }
  await authStore.asyncAuthority();
});

const subjectId = computed(() => route.query.id);
watch(
  () => subjectId.value,
  (newVal) => {
    siteStore.otherSite.forEach((site) => {
      if (site.id === newVal) {
        tableData.value = site.tDomainEngineList;
      }
    });
    console.log(tableData.value, 'tDomainEngineList');
  },
);

async function handleCommand(engineId) {
  try {
    await syncEngineInfo(engineId);
  } catch (error) {
    console.error(error);
  }
}

async function closeAddEngineDialog() {
  await siteStore.fetchMySite();
  state.mySite.tDomainEngineList.forEach((item) => {
    handleCommand(item.id);
  });
  showAddEngineDialog.value = false;
}
</script>

<template>
  <ListContainer v-loading="state.loading" title="主体详情">
    <template #header-tool>
      <span class="el-dropdown-link" @click="showAddEngineDialog = true">
        <el-icon>
          <Plus />
        </el-icon>
        添加引擎
      </span>
    </template>
    <ListContainerItem title="基本信息">
      <el-form ref="FormRefBasic" label-width="130px" inline>
        <el-form-item label="主体名称">
          <el-link type="primary">
            {{
              siteStore.otherSite.find((site) => site.id === subjectId)?.name
            }}
            <!-- {{ siteStore.otherSite[1] }} -->
          </el-link>
        </el-form-item>
        <el-form-item label="注册时间">
          {{
            siteStore.otherSite.find((site) => site.id === subjectId)
              ?.createdTime
          }}
        </el-form-item>
        <el-form-item label="最后健康检查时间" label-width="130px">
          {{
            siteStore.otherSite.find((site) => site.id === subjectId)
              ?.lastHealthCheckDate
          }}
        </el-form-item>
      </el-form>
    </ListContainerItem>
    <ListContainerItem title="引擎信息" v-if="tableData.length > 0">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="引擎名称" />
        <el-table-column prop="createdTime" label="创建时间" />
        <el-table-column prop="creator" label="创建人" />
        <el-table-column prop="engine" label="引擎类型">
          <template #default="{ row }">
            {{ engineType[row.engine] }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="address" label="操作">
          <template #default="{ row }">
            <el-button type="text" @click="handleCommand(row.id)">同步引擎信息</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </ListContainerItem>
  </ListContainer>
  <AddEngineDialog
    :showAddEngineDialog="showAddEngineDialog"
    @close="closeAddEngineDialog"
  ></AddEngineDialog>
  <!-- <SiteRegister ref="SiteRegisterRef"></SiteRegister> -->
  <!-- <SiteApply ref="siteApplyRef" /> -->
  <!-- <ExchangeChangeDialog ref="ExchangeChangeDialogRef" :data="exchangeInfo" @update="onSetCloudManagerExchange">
  </ExchangeChangeDialog> -->
</template>

<style scoped lang="scss">
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
