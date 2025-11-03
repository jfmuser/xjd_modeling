<template>
  <div class="log-content">
    <div v-if="!logs" class="log-tip">
      <span>加载中...</span>
    </div>
    <div v-else-if="!logs.length" class="log-tip">
      <el-empty></el-empty>
    </div>

    <VirtualScroll
      v-else
      ref="scroller"
      :items="logs"
      :min-item-size="20"
      emit-scroll
      class="log-contents"
      @scroll-top="$emit('scroll-top')"
      @scroll="onScroll"
      @hook:mounted="afterScrollMount"
    >
      <template #default="{ item }">
        <span class="log-lineNum">{{ item.lineNum }}</span>
        <span class="log-content">{{ item.content }}</span>
      </template>
    </VirtualScroll>
  </div>
</template>

<script>
import VirtualScroll from '@/components/VirtualScroll/index.vue';

export default {
  name: 'LogWidget',
  components: {
    VirtualScroll,
  },
  props: {
    logs: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      bottom: 0,
    };
  },
  watch: {
    logs(val, oldVal) {
      if (!val) return;
      if (oldVal) {
        if (oldVal.length < val.length) {
          const firstItem = val[0].lineNum;
          const firstOldItem = oldVal[0].lineNum;
          const lastItem = val[val.length - 1].lineNum;
          const lastOldItem = oldVal[oldVal.length - 1].lineNum;
          let index;
          if (firstItem < firstOldItem && lastItem === lastOldItem) {
            index = firstOldItem;
            this.scrollTo(val.findIndex((item) => item.lineNum === index));
          } else if (lastItem > lastOldItem && firstItem === firstOldItem) {
            if (this.bottom > 0) {
              return;
            }
            this.afterScrollMount();
          }
        }
      } else {
        this.afterScrollMount();
      }
    },
  },
  methods: {
    afterScrollMount() {
      this.$refs.scroller && this.$refs.scroller.scrollToBottom();
    },
    scrollTo(index) {
      this.$refs.scroller && this.$refs.scroller.scrollToItem(index);
    },
    onScroll(detail) {
      this.bottom = detail.bottom;
    },
    setSpace(content) {
      return content;
      // return content.replace(/\s/g, '&nbsp;')
    },
  },
};
</script>

<style lang="scss" scoped>
.log-content {
  height: 100%;
  white-space: pre-wrap;
  font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
}
.log-contents {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  width: 100%;
  background: #fff;
  .log-lineNum {
    font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
    color: #c6c8cc;
    min-width: 50px;
    margin-right: 20px;
    font-size: 12px;
    text-align: left;
    line-height: 20px;
  }
  .log-content {
    color: #999ba3;
    font-size: 12px;
    text-align: left;
    text-indent: initial;
    line-height: 20px;
  }
}
.log-tip {
  width: 100%;
  text-align: center;
  color: #999ba3;
}
</style>
