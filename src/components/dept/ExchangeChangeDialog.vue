<script setup>
import { computed, reactive } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});
const emits = defineEmits(['update']);
defineExpose({ show });
const state = reactive({
  visible: false,
});
const exchangeInfo = computed(() => props.data);
const isExchangeNameChange = computed(() =>
  isChange(exchangeInfo, 'exchangeName'),
);
const isNetworkAccessEntrancesChange = computed(() =>
  isChange(exchangeInfo, 'networkAccessEntrances'),
);
const isSecureStatusChange = computed(() =>
  isChange(exchangeInfo, 'secureStatus'),
);
const isPollingStatusChange = computed(() =>
  isChange(exchangeInfo, 'pollingStatus'),
);

function isChange(obj, attr) {
  const newAttr = `${attr}New`;
  return obj.value[newAttr] && obj.value[newAttr] !== obj.value[attr];
}

function show() {
  if (
    isExchangeNameChange.value ||
    isNetworkAccessEntrancesChange.value ||
    isSecureStatusChange.value ||
    isPollingStatusChange.value
  ) {
    state.visible = true;
  }
}

function onClose() {
  state.visible = false;
}

function onUpdate() {
  emits('update', {
    exchangeName: exchangeInfo.value.exchangeNameNew,
    networkAccessEntrances: exchangeInfo.value.networkAccessEntrancesNew,
    secureStatus: exchangeInfo.value.secureStatusNew,
    pollingStatus: exchangeInfo.value.pollingStatusNew,
  });
  onClose();
}
</script>

<template>
  <el-dialog
    v-model="state.visible"
    :before-close="onClose"
    title="联邦管理平台对部门进行了以下更改："
    width="650px"
    :show-close="false"
  >
    <div v-if="isExchangeNameChange">
      网络代理名称从{{ exchangeInfo.exchangeName }}改为
      {{ exchangeInfo.exchangeNameNew }}
    </div>

    <div v-if="isNetworkAccessEntrancesChange">
      消息队列出口从{{ exchangeInfo.networkAccessEntrances }}改为
      {{ exchangeInfo.networkAccessEntrancesNew }}
    </div>

    <div v-if="isSecureStatusChange">
      加密传输从{{ exchangeInfo.secureStatus }}改为
      {{ exchangeInfo.secureStatusNew }}
    </div>

    <div v-if="isPollingStatusChange">
      单向传输从{{ exchangeInfo.pollingStatus }}改为
      {{ exchangeInfo.pollingStatusNew }}
    </div>
    <template #footer>
      <el-button type="primary" @click="onUpdate">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
