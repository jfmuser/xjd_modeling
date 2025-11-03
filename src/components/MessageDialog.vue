<script setup>
import { reactive, computed, inject } from 'vue';
import {
  ApprovalStatus,
  MessageTopic,
  MessageType,
  MessageStatus,
  MessageReadStatus,
} from '../utils/const';
import { isJSONString } from '../utils';
import useConfigStore from '../stores/workspace/config.store';
import { ON_AGREE, ON_READ, ON_REJECT, ON_STORED } from '../utils/key';
import {formatDateTime} from "../utils";

const onAgree = inject(ON_AGREE);
const onReject = inject(ON_REJECT);
const onStored = inject(ON_STORED, () => {});
const onRead = inject(ON_READ, () => {});
const configInfo = useConfigStore().configInfo;
const props = defineProps({
  source: {
    type: String,
    default: 'approval',
  },
});
const state = reactive({
  visible: false,
  formModel: {},
  showAgree: false,
  showReject: false,
  showStored: false,
  showRead: false,
});

const messageContent = computed(() => {
  if (!state.formModel.messageContent) {
    return {};
  }
  return (
    JSON.parse(state.formModel.messageContent).data ||
    JSON.parse(state.formModel.messageContent).project ||
    JSON.parse(state.formModel.messageContent) ||
    {}
  );
});

const selfSiteName = computed(() => {
  if (props.source === 'message') {
    if (configInfo) {
      const selfSiteList = configInfo.selfSiteList;
      if (selfSiteList.length > 0) {
        return selfSiteList[0].siteName;
      }
    }
  }
  return '';
});

function show(data) {
  state.formModel = data;
  state.visible = true;
  if (props.source === 'message') {
    if (
      MessageStatus.canStored(state.formModel.messageStatus) &&
      state.formModel.subDept === selfSiteName.value
    ) {
      state.showStored = true;
    }
    if (MessageReadStatus.canRead(state.formModel.messageReadStatus)) {
      state.showRead = true;
    }
  } else if (props.source === 'approval') {
    state.showAgree = ApprovalStatus.canEdit(state.formModel.message_status);
    state.showReject = ApprovalStatus.canEdit(state.formModel.message_status);
  }
}

defineExpose({ show });

function onClose() {
  state.formModel = {};
  state.visible = false;
}

async function handleRead() {
  try {
    await onRead(state.formModel);
  } catch (error) {
    console.error(error);
  } finally {
    onClose();
  }
}

async function handleStored() {
  try {
    await onStored(state.formModel);
  } catch (error) {
    console.error(error);
  } finally {
    onClose();
  }
}

async function handleAgree() {
  try {
    await onAgree(state.formModel);
  } catch (error) {
    console.error(error);
  } finally {
    onClose();
  }
}

async function handleReject() {
  try {
    await onReject(state.formModel);
  } catch (error) {
    console.error(error);
  } finally {
    onClose();
  }
}
</script>

<template>
  <el-dialog
    v-if="state.visible"
    :model-value="true"
    :before-close="onClose"
    title="消息详情"
    width="920px"
  >
    <div class="message-wrapper">
      <div class="title">{{ state.formModel.messageName }}</div>
      <el-descriptions class="header">
        <el-descriptions-item label="消息主题">
          {{ MessageTopic.getLabel(state.formModel.messageTopic) }}
        </el-descriptions-item>
        <el-descriptions-item label="消息类型">
          {{ MessageType.getLabel(state.formModel.messageType) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="props.source === 'approval'"
          label="消息状态"
        >
          {{ ApprovalStatus.getLabel(state.formModel.messageStatus) }}
        </el-descriptions-item>
        <el-descriptions-item v-else label="消息状态">
          {{ MessageStatus.getLabel(state.formModel.messageStatus) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions border :column="2">
        <el-descriptions-item
          v-for="item in Object.keys(messageContent)"
          :key="item"
          :label="item"
          min-width="150px"
        >
          <template
            v-if="isJSONString(messageContent[item]) && item !== 'projectJson'"
          >
            <el-descriptions border>
              <el-descriptions-item
                v-for="i in Object.keys(JSON.parse(messageContent[item]))"
                :key="i"
                :label="i"
                min-width="150px"
                >{{ JSON.parse(messageContent[item])[i] }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
          <template v-else-if="item==='createdTime'|| item==='updatedTime'">
            <pre>{{ formatDateTime(messageContent[item]) }}</pre>
          </template>
          <template v-else>
            <pre>{{ messageContent[item] }}</pre>
          </template>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button v-if="state.showAgree" type="primary" @click="handleAgree"
        >同意
      </el-button>
      <el-button v-if="state.showReject" @click="handleReject">拒绝 </el-button>
      <el-button v-if="state.showRead" @click="handleRead"
        >已读待处理
      </el-button>
      <el-button v-if="state.showStored" type="primary" @click="handleStored"
        >入库
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
$backgroundColor: #f0f3f8;
.message-wrapper {
  border: 1px solid $backgroundColor;
  border-radius: 5px;

  .title {
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    background-color: $backgroundColor;
    border-bottom: 1px solid $backgroundColor;
  }

  .header {
    margin-top: 10px;
    padding: 0 10px;
  }

  .content {
    padding: 10px;
    overflow: auto;
  }
}

pre {
  min-width: 260px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
