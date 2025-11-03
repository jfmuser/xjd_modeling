<script setup>
import { ref } from 'vue';
// import { getAuthorityHistory } from '../../apis/org/authority.api';
import { getApplyLog } from '../../apis/dept/site.api';
import ApplyHistoryTable from '../ApplyHistoryTable.vue';


const visible = ref(false);
// const props = defineProps({
//   institutions: {
//     type: String,
//     required: true,
//   },
// });

function onShow() {
  visible.value = true;
}

function onHide() {
  visible.value = false;
}
function getData(data) {
  return getApplyLog(data);
}
</script>

<template>
  <el-popover placement="bottom-start" trigger="click" width="600px" @show="onShow" @hide="onHide">
    <template #reference>
      <el-button type="text">历史</el-button>
    </template>
    <ApplyHistoryTable v-if="visible" :getData="getData" />
  </el-popover>
</template>

<style scoped>
.el-pagination {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
