<script setup>
import { toRefs, computed } from 'vue';
import { Download } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import ListContainerItem from '../../layouts/ListContainerItem.vue';
import { formatDateTime } from '../../utils';
import { jobDownload } from '../../apis/workspace/job.api';

const props = defineProps({
  jobData: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});
const route = useRoute();
const router = useRouter();
const projectName = computed(() => route.query.projectName);
const modelName = computed(() => route.query.modelName);
const projectId = computed(() => route.query.projectId);
const modelId = computed(() => route.query.modelId);
const modelVersion = computed(() => route.query.modelVersion);

const { jobData, loading } = toRefs(props);

const { role, partyId, jobId } = toRefs(jobData.value);
// FIXME typo summary_date
const summaryData = computed(() => jobData.value?.summary_date || {});
const jobInfo = computed(() => summaryData.value.job || {});
const roleList = computed(() => {
  const data = summaryData.value.dataset;
  if (!data) {
    return [];
  }
  const { roles, dataset } = data;
  return Object.keys(roles).map((role) => {
    const datasetList = roles[role].map((name) => {
      let set = '';
      if (dataset[role]) {
        set = Object.values(dataset[role][name]).join(', ');
      }
      return {
        name,
        dataset: set,
      };
    });
    return {
      role: role.toUpperCase(),
      datasetList,
    };
  });
});

// FIXME
const thisRoleList = computed(() => {
  const final = JSON.parse(JSON.stringify(roleList.value));
  for (let i = 0; i < final.length; i++) {
    if (role.value !== final[i].role.toLowerCase()) {
      final.splice(i, 1);
      i--;
    } else {
      for (let j = 0; j < final[i].datasetList.length; j++) {
        const val = final[i].datasetList[j];
        if (val.name.toString() !== partyId.value) {
          final[i].datasetList.splice(j, 1);
          j--;
        }
      }
    }
  }
  let check = [];
  for (const val of final) {
    for (const item of val.datasetList) {
      check.push(item.dataset);
    }
  }
  const len = check.length;
  for (let i = 0; i < len; i++) {
    const item = check.splice(0, 1);
    for (const val of item) {
      check = check.concat(val.split(','));
    }
  }
  return check;
});

const arbiterRoleList = computed(() => {
  if (!roleList.value) {
    return [];
  }
  return roleList.value.filter((item) => item.role === 'ARBITER');
});

const hostRoleList = computed(() => {
  if (!roleList.value) {
    return [];
  }
  return roleList.value.filter((item) => item.role === 'HOST');
});

async function downloadJobConfig(type) {
  if (role.value.toLowerCase() === 'arbiter' && type === 'runtime') {
    return;
  }
  jobDownload({
    jobId: jobId.value,
    role: role.value,
    type,
    partyId: partyId.value,
  });
}

function goBack(type) {
  if (type === 'project') {
    router.push({
      name: 'project',
      query: {
        projectName: projectName.value,
        id: projectId.value,
      },
    });
  } else if (type === 'model') {
    router.push({
      name: 'model',
      query: {
        modelName: modelName.value,
        modelId: modelId.value,
        modelVersion: modelVersion.value,
      },
    });
  }
}
</script>

<template>
  <ListContainerItem v-loading="loading" title="作业概览">
    <el-descriptions :column="1">
      <el-descriptions-item v-if="projectName" label="项目名称" min-width="300">
        <el-link type="primary" :underline="false" @click="goBack('project')">
          {{ projectName }}
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item v-if="modelName" label="模型名称" min-width="300">
        <el-link type="primary" :underline="false" @click="goBack('model')">
          {{ modelName }}
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="作业ID" min-width="300">{{
        jobId
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{
        jobInfo.fStatus
      }}</el-descriptions-item>
      <el-descriptions-item label="角色">{{ role }}</el-descriptions-item>
      <el-descriptions-item label="参与方ID">{{
        partyId
      }}</el-descriptions-item>
      <el-descriptions-item label="数据集">
        <el-tooltip
          v-for="item in thisRoleList.slice(0, 3)"
          :key="item"
          effect="dark"
          :content="item"
          placement="top"
        >
          <span>{{ item }}</span>
        </el-tooltip>
        <el-popover
          v-if="thisRoleList.length > 3"
          placement="top-start"
          trigger="hover"
        >
          {{ thisRoleList.join(' ') }}
          <template #reference>
            <span>更多</span>
          </template>
        </el-popover>
      </el-descriptions-item>
      <el-descriptions-item
        v-for="(item, index) in arbiterRoleList"
        :key="index"
        label="裁决者"
      >
        <el-popover placement="top-start" trigger="hover" width="300">
          <el-descriptions
            v-for="i in item.datasetList"
            :key="i.name"
            :column="2"
          >
            <el-descriptions-item label="参与方ID">{{
              i.name
            }}</el-descriptions-item>
            <el-descriptions-item label="数据集">{{
              i.dataset
            }}</el-descriptions-item>
          </el-descriptions>
          <template #reference>
            {{ item.datasetList.length }}
          </template>
        </el-popover>
      </el-descriptions-item>

      <el-descriptions-item
        v-for="(item, index) in hostRoleList"
        :key="index"
        label="数据方"
      >
        <el-popover placement="top-start" trigger="hover" width="300">
          <el-descriptions
            v-for="i in item.datasetList"
            :key="i.name"
            :column="2"
          >
            <el-descriptions-item label="参与方ID">{{
              i.name
            }}</el-descriptions-item>
            <el-descriptions-item label="数据集">{{
              i.dataset
            }}</el-descriptions-item>
          </el-descriptions>
          <template #reference>
            {{ item.datasetList.length }}
          </template>
        </el-popover>
      </el-descriptions-item>
      <el-descriptions-item label="备注">{{
        jobInfo.notes
      }}</el-descriptions-item>
      <el-descriptions-item label="作业定义文件">
        <el-button
          :icon="Download"
          type="text"
          @click="downloadJobConfig('dsl')"
        ></el-button>
      </el-descriptions-item>
      <el-descriptions-item label="作业运行时配置">
        <el-button
          :icon="Download"
          type="text"
          @click="downloadJobConfig('runtime')"
        ></el-button>
      </el-descriptions-item>
      <el-descriptions-item label="提交时间">{{
        formatDateTime(jobInfo.fCreateTime)
      }}</el-descriptions-item>
    </el-descriptions>
  </ListContainerItem>
</template>

<style scoped lang="scss">
:deep .el-descriptions__cell {
  .el-descriptions__label {
    word-break: keep-all;
    &::after {
      content: ':';
    }
  }

  .el-descriptions__content {
    word-break: break-all;
  }
}
</style>
