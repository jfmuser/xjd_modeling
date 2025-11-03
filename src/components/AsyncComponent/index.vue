<template>
  <div
    v-loading="loading"
    :class="{
      'async__def-size': loading || displayParam,
      'async-showing': !hiddenCheck,
    }"
    class="async__container"
  >
    <keep-alive>
      <ComponentGroup
        ref="asyncGroup"
        :options="displayParam"
        :style="loading ? 'min-height:200px;' : ''"
        class="async__group"
        @refreshed="finishLoading"
        @reporter="asyncReport"
      />
    </keep-alive>
  </div>
</template>

<script>
import dataFilter from '@/mixin/DataFilters';
import basicOperation from '@/mixin/BasicOperation';
import dataReporter from './mixin/DataReportor';
import ComponentGroup from '@/components/ComponentGroup/index.vue';

export default {
  name: 'CustomAsyncComponent',
  components: { ComponentGroup },
  mixins: [dataFilter, basicOperation, dataReporter],
  props: {
    options: {
      type: [Array, Object],
      default: () => ({}),
    },
    afterRequestForParent: {
      type: [Function, String],
      default: () => {},
    },
    refresh: {
      type: [Function, String],
      default: () => {},
    },
    variableMap: {
      type: Array,
      default: () => [],
    },
    needLoad: {
      type: Boolean,
      default: true,
    },
    hidden: {
      type: Function,
      default: () => {},
    },
  },
  emits: [
    'refresh',
    'change',
    'form',
    'search',
    'range',
    'headerPage',
    'filterTable',
    'refreshed',
    'afterRequest',
  ],
  data() {
    return {
      cacheData: new Map(),
      displayParam: [],
      loading: this.needLoad,
      requestParam: Array.isArray(this.options)
        ? [...this.options]
        : Object.assign({}, this.options),
      noNeedToRefresh: false,
      hiddenCheck: true,
    };
  },
  computed: {
    getDataParam() {
      if (!Array.isArray(this.requestParam)) {
        return [
          {
            name: 'default',
            opts: this.requestParam,
          },
        ];
      } else {
        if (!this.property) {
          return [];
        } else {
          const list = Array.isArray(this.property)
            ? this.property
            : [this.property];
          const res = [];
          for (const val of list) {
            let optres = '';
            for (const item of this.requestParam) {
              if (item.name === val) {
                optres = item;
              }
            }
            res.push({
              name: val,
              opts: optres,
            });
          }
          return res;
        }
      }
    },
  },
  watch: {
    property: {
      handler() {
        this.init();
      },
      immediate: true,
    },
    options: {
      handler() {
        this.requestParam = Array.isArray(this.options)
          ? [...this.options]
          : Object.assign({}, this.options);
      },
      deep: true,
    },
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.loading = this.needLoad;
      const params = await this.combine();
      this.displayParam = params;
    },
    async requesting(opt, name) {
      let result = '';
      if (typeof opt.method === 'string') {
        result = await this[opt.method](opt.props);
      } else if (typeof opt.method === 'function') {
        result = await opt.method(opt.props);
      } else {
        result = opt.props;
      }
      let afterTrans = '';
      if (typeof opt.transform === 'string') {
        afterTrans = this[opt.transform](result);
      } else {
        const fn = await opt.transform;
        afterTrans = fn(result);
      }
      const mid = Array.isArray(afterTrans) ? afterTrans : [afterTrans];
      for (const val of mid) {
        if (val.props) {
          val.props.export = opt.export || '';
          val.props.detail = !!opt.detail;
        }
      }
      this.cacheData.set(name, afterTrans);
      this.$emit('afterRequest', {
        name,
        resoponse: result,
        setting: afterTrans,
        operation: this.afterRequestForParent,
      });
      return true;
    },

    async combine(setting) {
      const newParam = setting || [...this.getDataParam];
      for (let i = 0; i < newParam.length; i++) {
        const val = newParam[i];
        if (!this.cacheData.get(val.name)) {
          await this.requesting(val.opts, val.name);
        }
        const res = this.cacheData.get(val.name);
        this.hiddenCheck = !!this.hidden();
        if (Array.isArray(res)) {
          for (const item of res) {
            if (item.props) item.props.name = val.name;
          }
          newParam.splice(i, 1, ...res);
        } else {
          if (res.props) res.props.name = val.name;
          newParam.splice(i, 1, res);
        }
      }
      return newParam;
    },

    linkageChange(res, noNeedToRefresh) {
      this.noNeedToRefresh = noNeedToRefresh;
      this.setProperty(res);
    },

    getCurrentProperty() {
      return this.property;
    },

    async linkageRefresh() {
      this.loading = this.needLoad;
      const list = Array.isArray(this.property)
        ? this.property
        : this.property
        ? [this.property]
        : ['default'];
      for (let i = 0; i < list.length; i++) {
        const val = list[i];
        let origin = '';
        for (const item of this.getDataParam) {
          if (item.name === val) {
            origin = item.opts;
            break;
          }
        }
        const originData = this.cacheData.get(val);
        this.cacheData.delete(val);
        let newRes = '';
        const params = {
          name: val,
          originParam: origin,
          originData,
        };
        if (typeof this.refresh === 'string') {
          newRes = await this[this.refresh](params);
        } else {
          newRes = await this.refresh(params);
        }
        if (!Array.isArray(this.requestParam)) {
          this.requestParam = newRes;
        } else {
          for (let j = 0; j < this.requestParam.length; j++) {
            const value = this.requestParam[j];
            if (value.name === val) {
              this.requestParam.splice(j, 1, Object.assign({}, value, newRes));
              break;
            }
          }
        }
        this.init();
      }
    },
    finishLoading() {
      this.$nextTick(() => {
        this.loading = false;
        if (!this.noNeedToRefresh) {
          this.$emit('refreshed');
        } else {
          this.noNeedToRefresh = false;
        }
      });
    },
    resize() {
      this.refOpera('asyncGroup', 'resize');
    },
  },
};
</script>

<style lang="scss" scoped>
.async__group {
  border: 0px;
  padding: 0px;
  margin: 0px;
}
</style>
