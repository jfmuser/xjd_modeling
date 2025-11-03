<template>
  <component :is="tag" @scroll="onScroll">
    <slot />
  </component>
</template>

<script>
import throttle from 'lodash/throttle';

let observer;
export default {
  name: 'LogScroll',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    distance: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.onScroll = throttle(this.onScroll, 16);
  },
  mounted() {
    this.setRootHeight();
  },
  beforeUnmount() {
    observer.disconnect(this.$el);
  },
  methods: {
    setRootHeight() {
      const callback = (event) => {
        const oldScrollHeight = this.rootScrollHeight || 0;
        this.rootOffsetHeight = this.$el.offsetHeight;
        this.rootScrollHeight = this.$el.scrollHeight;
        let offset;
        if ((offset = this.rootScrollHeight - oldScrollHeight) > 0) {
          this.$el.scrollTop = offset;
        }
      };
      observer = new MutationObserver(callback);
      observer.observe(this.$el, { childList: true, attributes: true });
      callback();
    },
    onScroll(event) {
      if (this.disabled) {
        return;
      }
      const distance = this.distance;
      const range = this.rootScrollHeight - this.rootOffsetHeight;
      const scrollTop = event.target.scrollTop;
      const offsetTop = scrollTop - this.distance;
      const offsetBottom = range - scrollTop - distance;
      if (offsetTop <= 0) {
        this.$emit('scroll-up');
      }
      if (offsetBottom <= 0) {
        this.$emit('scroll-down');
      }
    },
  },
};
</script>

<style></style>
