<template>
  <div :class="className" class="select__container">
    <span v-if="label" class="select__label">{{ label + ':' }}</span>

    <el-select
      ref="selectMain"
      v-model="selected"
      :size="size === 'mini' ? 'default' : size"
      :placeholder="$attrs['placeholder'] || placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :multiple="multiple"
      :filterable="supportFilter"
      v-bind="$attrs"
    >
      <el-option
        v-for="(item, index) in opts"
        :key="index"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import dataFilter from '@/mixin/DataFilters';
import basicOperation from '@/mixin/BasicOperation';
import disableCheck from '@/mixin/DisableCheck';
export default {
  name: 'CusSelection',
  mixins: [dataFilter, basicOperation, disableCheck],
  props: {
    options: {
      type: [Array, Object],
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    supportFilter: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'form'],
  data() {
    return {
      size: 'mini',
      clearable: true,
      placeholder: 'select please',
      selected: '',
      opts: [],
    };
  },
  watch: {
    selected: {
      handler(newValue, oldValue) {
        if (
          !(
            (newValue === '' || newValue.length === 0) &&
            (oldValue === '' || oldValue.length === 0)
          )
        ) {
          this.change(this.selected);
          this.confirm();
        }
      },
      deep: true,
    },
    property: {
      handler() {
        this.opts = this.propfilter(this.options);
        this.able();
        this.setDefault();
      },
      deep: true,
    },
  },
  beforeMount() {
    this.opts = this.propfilter(this.options);
    if (this.opts.length === 0) {
      this.disable();
    }
  },
  methods: {
    able() {
      this.disabled = this.toArr(this.opts).length === 0;
    },
    change() {
      this.$emit('change', this.selected);
    },
    confirm() {
      this.$emit('form', this.selected);
    },
    reset() {
      this.selected = '';
    },
    getParam() {
      return this.selected;
    },
    setParam(value) {
      this.selected = value;
    },
    setDefault() {
      if (this.opts.length > 0) {
        if (!this.multiple) {
          this.selected = this.opts[0].value;
        } else {
          this.selected = [this.opts[0].value];
        }
      }
      return true;
    },
    byChange(prop) {
      this.setProperty(prop);
    },
    allSteps() {
      const res = {};
      this.opts.forEach((item, index) => {
        res[item.value] = {
          title: item.label,
        };
      });
      return res;
    },
  },
};
</script>

<style lang="scss">
.el-select {
  max-width: 150px;
  .el-select__tags {
    border-radius: 2px;
    height: 16px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    & > span {
      overflow: hidden;
      display: flex;
      flex-direction: row;
    }
    .el-tag {
      display: flex;
      flex-direction: row;
      align-items: center;
      border-radius: 2px;
      height: 16px;
      margin-right: 2px;
      .el-select__tags-text {
        line-height: 16px;
      }
      .el-tag__close {
        line-height: 16px;
        margin-top: 0px;
      }
    }
  }
  .el-input__inner {
    height: 24px;
    background-color: #fff;
    border: 2px solid #ebedf0;
    border-radius: 2px;
  }
  .el-select__caret {
    line-height: 24px;
  }
}
</style>
