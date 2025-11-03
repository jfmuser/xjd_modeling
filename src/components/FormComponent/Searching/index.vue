<template>
  <cinput
    ref="cusInput"
    :class-name="className"
    :input-class-name="inputClassName"
    :placeholder="placeholder || '搜索变量'"
    @change="valueChange"
    @clear="searching"
    @keyup.enter="searching"
  >
    <template #suffix>
      <el-icon class="input__search">
        <search @click.stop="searching" />
      </el-icon>
    </template>
  </cinput>
</template>

<script>
import cinput from '../Input/index.vue';
import basicOperation from '@/mixin/BasicOperation';

export default {
  name: 'CSearch',
  components: {
    cinput,
  },
  mixins: [basicOperation],
  props: {
    className: {
      type: String,
      default: '',
    },
    inputClassName: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['search'],
  data() {
    return {
      inputed: '',
    };
  },
  methods: {
    valueChange(res) {
      this.inputed = res;
    },
    searching() {
      this.$emit('search', this.inputed);
    },
    disable() {
      this.$refs['cusInput'].disable();
    },
    able() {
      this.$refs['cusInput'].able();
    },
    getParam() {
      return this.inputed;
    },
    setParam(value) {
      this.$refs['cusInput'].setParam(value);
      this.inputed = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.input__search {
  line-height: 22px;
  padding-left: 2px;
  margin-top: 1px;
  margin-bottom: 1px;
  background-color: rgb(248, 248, 250);
  cursor: pointer;
}
</style>
