<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
// import TableContainer from '../../layouts/TableContainer.vue';
import CatalogTableContainer from '../../layouts/CatalogTableContainer.vue';
import DeptCatalog from '../../components/dept/DeptCatalog.vue';
import SiteInfo from '../../components/dept/SiteInfo.vue';
import useNoticeStore from '../../stores/dept/notice.store';
// import ApplyNoticeDialog from '../../components/dept/ApplyNoticeDialog.vue';

const ApplyNoticeDialogRef = ref(null);
const noticeStore = useNoticeStore();
const route = useRoute();
const routeSiteID = computed(() => route.query.siteId);

onMounted(() => {
  onNotice();
});

async function onNotice() {
  // await noticeStore.fetchApplySite();
  if (noticeStore.notice.length > 0) {
    ApplyNoticeDialogRef.value.show();
  }
}
</script>

<template>
  <CatalogTableContainer>
    <template #catalog>
      <DeptCatalog></DeptCatalog>
    </template>
    <template #table>
      <SiteInfo></SiteInfo>
    </template>
  </CatalogTableContainer>
  <!-- <ApplyNoticeDialog ref="ApplyNoticeDialogRef"></ApplyNoticeDialog> -->
</template>

<style scoped></style>
