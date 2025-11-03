<template>
  <el-link type="primary" :underline="false" @click="refreshing">
    <el-icon>
      <refresh></refresh>
    </el-icon>
    <span>刷新</span>
  </el-link>
</template>

<script>
export default {
  name: 'RefreshBtn',
  emits: ['refresh'],
  methods: {
    refreshing() {
      this.$emit('refresh');
    },
  },
};
</script>

<style lang="scss" scoped></style>
