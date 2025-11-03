<template>
  <div class="logic">
    <el-form :show-message="false" inline size="mini">
      <el-form-item>
        <el-checkbox :value="checked" @change="handleUpdate($event, 'checked')">
          <div class="label">{{ label }}</div>
        </el-checkbox>
      </el-form-item>
      <el-form-item :error="error">
        <el-select
          :value="operator"
          style="width: 90px"
          @change="handleUpdate($event, 'operator')"
        >
          <el-option
            v-for="(op, index) in operators"
            :key="index"
            v-bind="op"
          />
        </el-select>
      </el-form-item>
      <el-form-item :error="error">
        <el-input
          :value="condition"
          :placeholder="placeholder"
          class="condition"
          @input="handleInput"
          @change="handleChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
const OPERATORS = {
  greater: '>',
  less: '<',
  equal: '=',
  greaterOrEqual: '≥',
  lessOrEqual: '≤',
  notEqual: '≠',
  in: 'in',
  notIn: 'not in',
};

export default {
  name: 'ReportLogic',
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    variableType: {
      type: String,
      default: 'int',
    },
    operator: {
      type: String,
      default: 'greater',
      validator: (val) => OPERATORS[val],
    },
    condition: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      error: undefined,
    };
  },
  computed: {
    operators() {
      return Object.entries(OPERATORS).map(([key, value]) => {
        return {
          value: key,
          label: value,
        };
      });
    },
    placeholder() {
      const { label, variableType, isRangeType } = this;
      let like = isRangeType ? [1, 4, 5] : [1];
      like = variableType === 'int' ? like : like.map((val) => val / 100);
      return `enter ${isRangeType ? `${label} range` : `an ${label}`} like: ${
        like[0]
      }${like[1] ? `,${like[1]}~${like[2]}` : ''}`;
    },
    isRangeType() {
      return this.operator === 'in' || this.operator === 'notIn';
    },
  },
  methods: {
    handleUpdate(val, prop) {
      this.$emit(`update:${prop}`, val);
      this.$emit('updated');
    },
    handleInput(val) {
      val = val.replace(/[，、。/\\。；;]/g, ',');
      val = val.replace(/(-{1,2})|——/g, '~');
      this.handleUpdate(val, 'condition');
    },
    handleChange(val) {
      this.$nextTick(() => {
        this.validate(this.condition);
      });
    },
    validate(val) {
      if (this.checked && val) {
        this.error = this.isRangeType
          ? this.validateRange(val)
          : this.validateNumber(val);

        this.$emit('error', this.error);
      }
    },
    validateNumber(val) {
      if (/^[+-]?(0|([1-9]\d*))(\.\d+)?$/.test(val)) {
        return;
      }
      return `Invalid number ${val}`;
    },
    validateRange(val) {
      const rangeArr = val.split(',');
      const errorArr = [];
      rangeArr.forEach((range) => {
        if (range) {
          let arr = [];
          if (range.indexOf('~') < 0) {
            this.validateNumber(range) && errorArr.push(range);
          } else {
            arr = range.split('~');
            if (arr.length > 2) {
              errorArr.push(range);
            } else {
              const allValid = arr.every((num) => !this.validateNumber(num));
              if (!allValid || +arr[0] >= +arr[1]) {
                errorArr.push(range);
              }
            }
          }
        }
      });
      return errorArr.length
        ? `Invalid range ${errorArr.join('...')}`
        : undefined;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../../../styles/common/color.scss';
.condition {
  width: 360px;
  max-width: 360px;
  ::v-deep .el-input__inner {
    height: 24px;
    background: $gray-lighter;
    border: 2px solid transparent;
  }
  @at-root .is-error & {
    ::v-deep {
      .el-input__inner,
      .el-input__inner:focus {
        border-color: #f56c6c;
        border-radius: 2px;
      }
    }
  }
  @at-root .is-success & {
    ::v-deep {
      .el-input__inner,
      .el-input__inner:focus {
        border-color: transparent;
      }
    }
  }
}

.label {
  // min-width: 80px;
  color: $gray;
  margin-right: 15px;
}
::v-deep .el-form-item {
  margin-bottom: 10px;
}
</style>
