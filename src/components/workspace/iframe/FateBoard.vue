<!--
 Author: YangWuLong
 Date: 2023.4
 FateBoard页面
 -->
<template>
  <div class="outside">
    <div class="iframe">
      <div class="close" @click="close"></div>
      <div class="close-btn" @click="close">
        <el-icon style="color: #4376ff;line-height: 35px;">
          <Back />
        </el-icon>
        <el-button type="text">返回</el-button>
      </div>

      <iframe :src="props.FateBoardUrl" name="myFrame" frameborder="0" width="100%" height="100%" ref="iframe"></iframe>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, reactive, onMounted } from 'vue';
// 接收父组件传过来的值
const props = defineProps({
  FateBoardUrl: {
    type: String,
  },
});
const emits = defineEmits(['close']);
const close = () => {
  // sessionStorage.removeItem("dagId")
  // sessionStorage.removeItem("projectId")
  emits('close', ['', true]);
};
// onMounted(async () => {
//  await createIFrame(props.FateBoardUrl)
// })

// function createIFrame(iframeContent) {
//     let iFrame = document.createElement("iframe");
//     iFrame.src = "about:blank";
//     iFrameContainer.innerHTML = ""; // (optional) Totally Clear it if needed
//     iFrameContainer.appendChild(iFrame);

//     let iFrameDoc = iFrame.contentWindow && iFrame.contentWindow.document;
//     if (!iFrameDoc) {
//     console.log("iFrame security.");
//     return;
//     }
//     iFrameDoc.write(iframeContent);
//     iFrameDoc.close();
// }
</script>

<style lang="scss" scoped>
$height: 100%;

.outside {
  height: $height;
  background-color: #fff;

  .iframe {
    width: 100%;
    height: $height;
    position: relative;
    padding-top: 5px;
  }
}

.close {
  position: relative;
}

.close::before,
.close::after {
  position: absolute;
  content: ' ';
  background-color: #4159d1;
  cursor: pointer;
  right: 20px;
  width: 10px;
  height: 35px;
}

.close::before {
  transform: rotate(45deg);
}

.close::after {
  transform: rotate(-45deg);
}

.close-btn {
  display: flex;
  align-items: center;
  position: absolute;
  left: 20px;
  cursor: pointer;
}
</style>
