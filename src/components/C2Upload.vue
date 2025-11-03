<script setup>
import { ref } from 'vue';

const props = defineProps({
  showProgress: { type: Boolean, required: false, default: false },
  fileUploadProgress: { type: Number, required: false, default: 0 },
});

const emit = defineEmits(['upload-file']);
const uploadInput = ref(null);

function onClick() {
  uploadInput.value.value = null;
  uploadInput.value.click();
}
function uploadFile(event) {
  const fileList = event.target.files;
  emit('upload-file', fileList);
}
</script>
<template>
  <label>
    <label @click="onClick">
      <slot></slot>
    </label>
    <input
      ref="uploadInput"
      type="file"
      name="file"
      class="upload-input"
      v-bind="$attrs"
      @change="uploadFile"
    />
    <el-progress
      v-if="props.showProgress && props.fileUploadProgress !== 0"
      :percentage="props.fileUploadProgress"
    />
  </label>
</template>
<style scoped lang="scss">
.upload-input {
  display: none;
}
.el-progress__text {
  font-size: 12px !important;
}
</style>
