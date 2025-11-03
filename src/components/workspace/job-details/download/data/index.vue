<template>
  <el-dialog
    v-model="visible"
    class="dialog"
    append-to-body
    title="Data Download"
    @open="onOpen"
  >
    <div class="wrap">
      <div class="header">
        <div>Use the script below to download data</div>
        <div
          ref="btn"
          :data-clipboard-text="codeContent"
          class="copy"
          @click="onClick"
        >
          {{ btnText }}
        </div>
      </div>
      <div class="content">
        <div class="code">{{ codeContent }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import ClipboardJS from 'clipboard';

export default {
  props: {
    code: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      visible: false,
      isCopied: false,
      copyFailed: false,
      inited: false,
      codeContent: '',
      clipboard: null,
    };
  },
  computed: {
    btnText() {
      return this.copyFailed
        ? 'copy faild'
        : this.isCopied
        ? 'Copied!'
        : 'Copy';
    },
  },
  watch: {
    code: {
      handler(val) {
        this.codeContent = val;
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    console.trace(this.clipboard);
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  },
  methods: {
    initClipboard() {
      this.clipboard = new ClipboardJS(this.$refs.btn);
      this.clipboard.on('success', () => {
        this.isCopied = true;
        this.copyFailed = false;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.isCopied = false;
        }, 3000);
      });
      this.clipboard.on('error', () => {
        this.copyFailed = true;
      });
    },
    onClick(event) {
      if (this.isCopied) {
        event.stopImmediatePropagation();
      }
    },
    onOpen() {
      if (!this.inited) {
        this.$nextTick(() => {
          this.initClipboard();
        });
        this.inited = true;
      }
    },
    show(code) {
      this.codeContent = code;
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../common.scss';

.wrap {
  display: flex;
  flex-flow: column;
}

.header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-weight: 700;
}

.content {
  flex: 1;
  min-height: 0;
  padding: 0 20px;
}
.code {
  height: 100%;
  background: rgb(250, 251, 252);
  padding: 10px;
  line-height: 1.6;
  color: rgb(161, 163, 171);
  overflow: hidden;
  white-space: pre-wrap;
}

.copy {
  color: $blue;
  padding: 7px 10px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
</style>
