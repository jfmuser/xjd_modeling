<template>
  <ul style="padding-top: 5px; padding-left: 2px">
    <li v-for="(file, index) in files" :key="index" class="item">
      <el-checkbox v-model="file.checked" @change="$emit('change')">
        <span class="name">{{ file.filename }}</span>
      </el-checkbox>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    files: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['change'],
};
</script>

<style lang="scss" scoped>
@import '../../../../../styles/common/color.scss';

.item {
  margin-bottom: 10px;
}

.name {
  color: $gray;
  font-size: 14px;
  font-weight: 500;
}
</style>
