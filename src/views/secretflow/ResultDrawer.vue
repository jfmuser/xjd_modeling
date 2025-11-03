<script setup>
import { computed, ref } from 'vue';
import { useFullscreen } from '@vueuse/core';

const props = defineProps({
  data: { default: [] },
  info: {
    default: {
      name: '',
      time: '',
      paths: [],
    },
  },
});

const emit = defineEmits(['close']);

function handleClose() {
  emit('close');
}

const tableRef = ref();
const { toggle, isFullscreen } = useFullscreen(tableRef);

const handleExport = () => {
  if (!props.data.tableData.length) {
    return;
  }
  const headers = Object.keys(props.data.tableData[0]).join(',');
  const rows = props.data.tableData.map((item) =>
    Object.values(item).join(','),
  );
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${props.info.name}.csv`;
  link.click();
};

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(props.data.tableData.length);
const onPageChange = (page) => (currentPage.value = page);

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.data.tableData.slice(start, end);
});
</script>

<template>
  <el-drawer
    :model-value="true"
    size="600px"
    title="执行结果"
    @close="handleClose"
  >
    <div class="result-detail">
      <div class="row">
        <span class="name">{{ info.name }}</span>
        <el-tag type="info" round color="rgba(0, 104, 250, 0.08)">表</el-tag>
      </div>
      <div class="row">
        <span class="time">生成时间：</span> {{ info.time }}
      </div>
      <div class="row" v-for="i in info.paths" :key="i.name">
        <span class="time">{{ i.name }}节点路径：</span>
        {{ i.path }}
      </div>
    </div>
    <div ref="tableRef" :style="{ padding: isFullscreen ? '0 20px' : '0' }">
      <div class="table-title">
        <h5>表字段</h5>
        <div class="title-btn">
          <div class="btn" @click="handleExport">
            <el-icon><Download /></el-icon>导出表结构
          </div>
          <div class="btn" @click="toggle">
            <el-icon><FullScreen /></el-icon
            >{{ isFullscreen ? '退出全屏' : '全屏' }}
          </div>
        </div>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{
          background: '#fafafa',
          textAlign: 'start',
          fontSize: '14px',
        }"
      >
        <!-- <el-table-column prop="field" label="字段" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="node" label="节点" /> -->
        <el-table-column
          :prop="value.name"
          :label="value.zhName || value.name"
          v-for="value in props.data.tableDataHeader"
          :value="value.name"
          sortable
        />
      </el-table>
      <div class="pagination-wraper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.result-detail {
  padding: 12px;
  margin-bottom: 16px;
  background-color: #00000005;
  font-size: 12px;
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    .name {
      color: #000000d9;
      font-weight: 600;
    }
    .time {
      color: #00000073;
    }
  }
}
.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .sub-title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.88);
  }
  .title-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #4376ff;
    .btn {
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }
}
:fullscreen {
  background-color: white;
  .table-title {
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
.pagination-wraper {
  display: flex;
  justify-content: flex-end;
}
.el-scrollbar__bar {
  display: none !important;
}

::deep th {
  border-inline-end: 1px solid #f0f0f0;
}
</style>
