<template>
  <span :style="styles" class="cus-title" @click.stop="clicked">{{
    title || content
  }}</span>
</template>

<script>
export default {
  name: 'CustomTitle',
  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    styles: {
      type: [String, Object],
      default: '',
    },
  },
  emits: ['click'],
  methods: {
    clicked() {
      this.$emit('click', this.title);
    },
  },
};
</script>

<style lang="scss" scoped>
.cus-title {
  font-size: 24px !important;
  color: #3e4052 !important;
  font-weight: bold;
}
</style>
