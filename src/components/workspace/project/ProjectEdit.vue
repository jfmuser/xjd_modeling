<script setup>
import { reactive, onMounted, computed } from 'vue';
import CatalogTableContainer from '../../../layouts/CatalogTableContainer.vue';
import ListContainer from '../../../layouts/ListContainer.vue';
import ListContainerItem from '../../../layouts/ListContainerItem.vue';
import AlgorithmList from './AlgorithmList.vue'
import useConfigStore from '../../../stores/workspace/config.store';
import AlgorithmEdit from './AlgorithmEdit.vue'

const state = reactive({
  loading: false,
  model: {},
});
onMounted(async () => {
  state.model = JSON.parse(localStorage.getItem("projectInfo"));
});
const configInfo = useConfigStore().configInfo
const selfSites = computed(() => {
  if (configInfo) {
    return configInfo.selfSiteList
  }
  return null
});
const otherSites = computed(() => {
  if (configInfo) {
    return configInfo.otherSiteList
  }
  return null
});
const arbiterSites = computed(() => {
  if (configInfo) {
    return configInfo.arbiterList
  }
  return null
});

</script>

<template>
  <el-container>
    <el-header>header</el-header>
    <CatalogTableContainer>
      <template #catalog>
        <ListContainer v-loading="state.loading">
          <ListContainerItem title="项目信息">
            <el-form ref="FormRef"
                     :model="state.model"
                     label-width="70px">
              <el-form-item v-show="false"
                            label="ID"
                            style="width: 100%">
                <el-input v-model="state.model.id"
                          placeholder="" />
              </el-form-item>
              <el-form-item label="项目名称"
                            prop="projectName"
                            style="width: 100%">
                <el-input v-model="state.model.projectName"
                          placeholder="请输入项目名称" />
              </el-form-item>
              <el-form-item label="业务方"
                            prop="guest"
                            style="width: 100%">
                <el-select v-model="state.model.guest">
                  <el-option v-for="item in selfSites"
                             :key="item.siteName"
                             :label="item.siteName"
                             :value="item.partyId" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据方"
                            prop="host"
                            style="width: 100%">
                <el-select v-model="state.model.host">
                  <el-option v-for="item in otherSites"
                             :key="item.siteName"
                             :label="item.siteName"
                             :value="item.partyId" />
                </el-select>
              </el-form-item>
              <el-form-item label="聚合方"
                            prop="arbiter"
                            style="width: 100%">
                <el-select v-model="state.model.arbiter">
                  <el-option v-for="item in arbiterSites"
                             :key="item.siteName"
                             :label="item.siteName"
                             :value="item.partyId" />
                </el-select>
              </el-form-item>

              <el-form-item label="备注"
                            prop="remarks"
                            style="width: 100%">
                <el-input v-model="state.model.remarks"
                          type="textarea"
                          placeholder="" />
              </el-form-item>
            </el-form>

          </ListContainerItem>
          <ListContainerItem title="联邦算子">
            <AlgorithmList />
          </ListContainerItem>
        </ListContainer>
      </template>
      <template #table>
        <AlgorithmEdit />
      </template>
    </CatalogTableContainer>
  </el-container>
</template>

<style scoped lang="scss">
$catalogWidth: 267px;
$headerHeight: 40px;
$gap: 0.1171875rem;

.header-area {
  height: $headerHeight;
  width: 100%;
}

.catalog-table-container {
  height: calc(100% - $headerHeight - 5px);
  display: flex;
  gap: $gap;

  &__catalog {
    height: 100%;
    width: $catalogWidth;
  }

  &__table {
    width: calc(100% - $catalogWidth - $gap);
  }
}
</style>