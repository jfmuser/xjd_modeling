<template>
  <editor :value="cell.row[cell.column.property]" @change="change" />
</template>

<script>
import editor from '../../../FormComponent/Editor/index.vue';
export default {
  name: 'EditorCol',
  components: {
    editor,
  },
  props: {
    cell: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    change(updated) {
      this.$emit('change', updated);
    },
  },
};
</script>

<style lang="" scoped></style>
