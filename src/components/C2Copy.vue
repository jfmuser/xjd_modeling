<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Clipboard from 'clipboard';
import { ElMessage } from 'element-plus';

const copyButtonRef = ref(null);
const props = defineProps({
  text: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '复制',
  },
});
let clipboard;

onMounted(() => {
  clipboard = new Clipboard(copyButtonRef.value.$el, {
    text: () => {
      return props.text;
    },
  });
  clipboard.on('success', (e) => {
    ElMessage.success('复制成功');
    e.clearSelection();
  });
  clipboard.on('error', () => {
    ElMessage.error('复制失败，请重新复制');
  });
});

onBeforeUnmount(() => {
  clipboard.destroy();
});
</script>

<template>
  <el-tooltip v-if="props.icon" :content="props.tooltip" placement="top">
    <el-button ref="copyButtonRef" type="text">
      <el-icon>
        <CopyDocument></CopyDocument>
      </el-icon>
    </el-button>
  </el-tooltip>
  <el-button v-else ref="copyButtonRef" type="text"> 复制 </el-button>
</template>

<style scoped></style>
