<script setup>
import { reactive, onMounted, nextTick, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import useSiteStore from '../../stores/dept/site.store';
import useConfigStore from '../../stores/dept/config.store';
import DeptTree from './DeptTree.vue';
// import SiteRegister from './SiteRegister.vue';

const configStore = useConfigStore();
const siteStore = useSiteStore();
const route = useRoute();
// const SiteRegisterRef = ref(null);
const state = reactive({
  search: {},
});
const treeId = computed(() => route.query.id);

watch(
  () => treeId.value,
  async () => {
    renderTree();
  },
);

onMounted(async () => {
  await fetchTreeData();
  renderTree();
});


async function renderTree() {
  await nextTick();
  if (treeId.value) {
    const treeNode = document.querySelector(
      `.el-tree-node[data-key="${treeId.value}"]`,
    );
    treeNode?.click();
  } else {
    const treeNode = document.querySelector('.el-tree-node');
    treeNode?.click();
  }
}

async function fetchTreeData() {
  try {
    state.loading = true;
    // await Promise.all([siteStore.fetchMySite(), siteStore.fetchOtherSite()]);
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}

</script>

<template>
  <div class="catalog-wrapper">
    <div class="header-area background">
      <div class="title">主体列表</div>
      <div class="right">
      </div>
    </div>
    <div class="main">
      <div class="actions">
        <DeptTree :data="siteStore.otherSite" :my-site="siteStore.mySite" mine></DeptTree>
      </div>
    </div>
  </div>
  <!-- <SiteRegister ref="SiteRegisterRef"></SiteRegister> -->
</template>

<style scoped lang="scss">
.catalog-wrapper {
  height: 100%;
  background-color: #fff;

  .tree-title {
    font-weight: bolder;
    margin: 5px;
  }

  .main {
    padding: 5px;
  }
}
</style>
