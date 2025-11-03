<template>
  <section>
    <el-radio-group
      v-if="Array.isArray(options)"
      v-model="selected"
      class="radio-group__container"
    >
      <c-box
        v-for="(item, index) in options"
        :key="index"
        :ref="item.value"
        :label="item.label"
        :value="item.value"
        :group="item.group || {}"
        :single="false"
        class="radio-group__box"
        @change="boxChange(arguments, item.value)"
        @form="boxForm(arguments, item.value)"
        @search="boxSearch"
      />
    </el-radio-group>
    <c-box
      v-else
      :ref="options.value"
      :label="options.label"
      :value="options.value"
      :group="options.group || {}"
      @change="boxChange(arguments, options.value)"
      @form="boxForm(arguments, options.value)"
      @search="boxSearch"
    />
  </section>
</template>

<script>
import basicOperation from '@/mixin/BasicOperation';
export default {
  name: 'CusRadio',
  components: {
    cBox: () => import('./RadioSingle.vue'),
  },
  mixins: [basicOperation],
  props: {
    options: {
      type: [Array, Object],
      default: () => [],
    },
    disabled: {
      type: [Boolean, Array],
      default: false,
    },
  },
  emits: ['search', 'change', 'form'],
  data() {
    return {
      propResult: {},
      formResult: {},
      selected: '',
      canSend: false,
    };
  },
  watch: {
    propResult: {
      handler() {
        this.change();
      },
      deep: true,
    },
    formResult: {
      handler() {
        this.confirm();
      },
      deep: true,
    },
    selected: {
      handler() {
        const list = this.toArr(this.options);
        for (const val of list) {
          if (val.value === this.selected) {
            this.refOpera(val.value, 'chooseBox');
          } else {
            this.refOpera(val.value, 'unchooseBox');
          }
        }
        this.change();
      },
      deep: true,
    },
  },
  methods: {
    boxChange(res, label) {
      this.propResult[label] = res[0];
    },
    boxForm(res, label) {
      this.formResult[label] = res[0];
    },
    boxSearch(res) {
      this.$emit('search', res);
    },
    checkCanSend() {
      if (!this.canSend) {
        let canSend = true;
        if (Array.isArray(this.options)) {
          for (const val of this.options) {
            if (!this.propResult[val.value]) {
              canSend = false;
              break;
            }
          }
        } else {
          if (!this.propResult[this.options.value]) {
            canSend = false;
          }
        }
        this.canSend = canSend;
      }
    },
    change() {
      this.checkCanSend();
      if (this.canSend) {
        const getProperty = () => {
          const res = [];
          for (const key in this.filterBySelect(this.propResult)) {
            if (key === this.selected) {
              const val = this.propResult[key];
              if (Array.isArray(val)) {
                res.push(...val);
              } else {
                res.push(val);
              }
            }
          }
          return res;
        };
        this.$emit('change', getProperty());
      }
    },
    confirm() {
      this.$emit('form', {
        select: this.selected,
        value: this.filterBySelect(this.formResult),
      });
    },
    filterBySelect(obj) {
      if (this.selected) {
        return obj;
      } else {
        return {};
      }
    },
    disable() {
      const list = this.toArr(this.options);
      for (const val of list) {
        this.refOpera(val.value, 'disable');
      }
    },
    able() {
      const list = this.toArr(this.options);
      for (const val of list) {
        this.refOpera(val.value, 'able');
      }
    },
    getParam() {
      return this.formResult;
    },
    setDefault() {
      const list = this.toArr(this.options);
      this.selected = this.options[0].value;
      for (const val of list) {
        if (!this.refOpera(val.value, 'setDefault')) {
          return false;
        }
        if (val.value === this.selected) {
          this.refOpera(val.value, 'chooseBox');
        }
        this.refOpera(val.value, 'boxDisable');
      }
      return true;
    },
    allSteps() {
      const list = this.toArr(this.options);
      const res = {};
      list.forEach((item) => {
        const eachSteps = this.refOpera(item.value, 'allSteps');
        Object.assign(res, eachSteps);
      });
      return res;
    },
  },
};
</script>

<style lang="scss" scoped>
.radio-group__container {
  @include flex(row, flex-start, center);
  .radio-group__box {
    margin-right: 30px;
  }
  .radio-group__box:last-child {
    margin-right: 0px;
  }
}
</style>
