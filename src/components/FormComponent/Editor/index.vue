<template>
  <section :class="className" class="editor__container">
    <div class="editor_edit">
      <slot
        :operation="{
          toDisplay: toDisplay,
          disabled: disabledSet,
        }"
        name="prepend"
      />
      <cinput v-model="editorContent" :disabled="disabledSet" />
      <slot
        :operation="{
          toDisplay: toDisplay,
          disabled: disabledSet,
        }"
        name="append"
      >
        <el-icon class="editor__btn" @click="toDisplay(true)">
          <success-filled />
        </el-icon>
        <el-icon class="editor__btn" @click="toDisplay(false)">
          <failed />
        </el-icon>
      </slot>
    </div>
    <div v-show="!showEditor" class="editor__display">
      <slot
        :content="{
          content: displayContent,
          toEditor: toEditor,
          disabled: disabledSet,
        }"
        name="content"
      >
        <span class="editor__display-text">{{ displayContent }}</span>
        <el-icon class="editor__btn" @click="toEditor"><edit /></el-icon>
      </slot>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CEditor',
  components: {
    cinput: () => import('../Input/index.vue'),
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    editorFirst: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    className: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      editorContent: '',
      displayContent: '',
      showEditor: false,
      disabledSet: false,
    };
  },
  watch: {
    value: {
      handler() {
        this.displayContent = this.value;
        this.editorContent = this.value;
      },
      deep: true,
    },
    disabled() {
      this.disabledSet = this.disabled;
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.disabledSet = this.disabled;
      this.displayContent = this.value;
      if (this.editorFirst) {
        this.toEditor();
      }
    },
    toEditor() {
      if (!this.disabledSet) {
        this.editorContent = this.displayContent;
        this.showEditor = true;
      }
    },
    toDisplay(change) {
      if (change && this.displayContent !== this.editorContent) {
        this.displayContent = this.editorContent;
        this.updated();
      }
      this.showEditor = false;
    },
    updated() {
      // eslint-disable-next-line vue/no-deprecated-dollar-listeners-api
      if (this.$listeners['input']) {
        this.$emit('input', this.displayContent);
      }
      this.$emit('change', this.displayContent);
    },
    disable() {
      this.disabledSet = false;
    },
    able() {
      this.disabledSet = true;
    },
  },
};
</script>

<style lang="" scoped></style>
