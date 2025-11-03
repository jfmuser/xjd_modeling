<script setup>
import { reactive } from 'vue';
import useNoticeStore from '../../stores/dept/notice.store.js';
import useSiteStore from '../../stores/dept/site.store';
import { setReadState } from '../../apis/dept/site.api';

const siteStore = useSiteStore();
const noticeStore = useNoticeStore();
const state = reactive({
  visible: false,
  loading: false,
});
defineExpose({ show });

function show() {
  state.visible = true;
}

function onClose() {
  state.visible = false;
}
function format(data) {
  return data.map((item) => item.institutions).join(',');
}
async function onConfirm() {
  try {
    state.loading = true;
    await setReadState();
    await siteStore.fetchData();
    onClose();
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <el-dialog v-model="state.visible" title="审批通知" :before-close="onClose">
    <div v-if="noticeStore.agreeNotice.length > 0">
      联邦管理平台同意了查看
      {{ format(noticeStore.agreeNotice) }}的申请
    </div>
    <div v-if="noticeStore.rejectNotice.length > 0">
      联邦管理平台拒绝了查看
      {{ format(noticeStore.rejectNotice) }}的申请
    </div>
    <div v-if="noticeStore.cancelNotice.length > 0">
      联邦管理平台取消了查看
      {{ format(noticeStore.cancelNotice) }}的申请
    </div>
    <template #footer>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
