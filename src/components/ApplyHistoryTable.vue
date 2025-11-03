<script setup>
import { reactive, onMounted } from 'vue';
import _ from 'lodash';

import { AuthorityStatus } from '../utils/const';
import { formatDateTime } from '../utils';

const props = defineProps({
  getData: {
    type: Function,
    required: true,
  },
  all: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  loading: false,
  tableData: [],
});

const pager = reactive({
  page: 1,
  size: 5,
  total: 0,
});

onMounted(() => {
  fetchData();
});

async function fetchData(page) {
  try {
    state.loading = true;
    const response = await props.getData({
      pageNum: page || pager.page,
      pageSize: pager.size,
    });
    if (props.all) {
      state.tableData = response.map((item) => ({
        time: formatDateTime(item.updateTime),
        agreeText: `同意授权${item.institutions}查看${item.authorityInstitutions}的部门`,
      }));
    } else {
      const { list, pageNum, pageSize, totalRecord } = response;
      state.tableData = list.map((item) => {
        const groups = _.groupBy(item.authorityApplyReceivers, 'status');
        const apply = groups[AuthorityStatus.APPLY];
        const agree = groups[AuthorityStatus.AGREE];
        const reject = groups[AuthorityStatus.REJECT];
        const cancel = groups[AuthorityStatus.CANCEL];

        function getAuth(arr) {
          return arr.map((item) => item.authorityInstitutions).join(',');
        }

        return {
          time: formatDateTime(item.updateTime),
          agreeText:
            agree && `同意授权${item.institutions}查看${getAuth(agree)}的主体`,
          rejectText:
            reject &&
            `拒绝授权${item.institutions}查看${getAuth(reject)}的主体`,
          cancelText:
            cancel && `取消了${item.institutions}对${getAuth(cancel)}的授权`,
          applyText:
            apply && `申请授权${item.institutions}查看${getAuth(apply)}的主体`,
        };
      });
      pager.page = pageNum;
      pager.size = pageSize;
      pager.total = totalRecord;
    }
  } finally {
    state.loading = false;
  }
}

function onPageChange(page) {
  fetchData(page);
}
</script>

<template>
  <div v-loading="state.loading" class="table-wrapper">
    <el-table :data="state.tableData">
      <el-table-column prop="time" label="时间" width="160px" />
      <el-table-column label="操作历史" min-width="300px">
        <template #default="{ row }">
          <div v-if="row.cancelText">
            {{ row.cancelText }}
          </div>
          <div v-if="row.agreeText">
            {{ row.agreeText }}
          </div>
          <div v-if="row.rejectText">
            {{ row.rejectText }}
          </div>
          <div v-if="row.applyText">
            {{ row.applyText }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="!props.all" v-model:current-page="pager.page" v-model:page-size="pager.size" :total="pager.total"
      layout="total, prev, pager, next" background @current-change="onPageChange" />
  </div>
</template>

<style scoped></style>
