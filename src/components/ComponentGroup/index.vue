<script>
import { defineAsyncComponent } from 'vue';
import { hh } from '../../utils';
import basicOperation from '@/mixin/BasicOperation';
import statusManager from './mixin/ComponentsStatus';
import dataReporter from './mixin/dataReport';

const Cform = defineAsyncComponent(() =>
  import('../FormComponent/Group/index.vue'),
);
const Ctable = defineAsyncComponent(() =>
  import('../TableComponent/PaginationTable/index.vue'),
);
const Cchart = defineAsyncComponent(() =>
  import('../ChartComponent/ChartContainer/index.vue'),
);
const Cechart = defineAsyncComponent(() =>
  import('../ChartComponent/EchartsInstance/index.vue'),
);
const Casync = defineAsyncComponent(() =>
  import('../AsyncComponent/index.vue'),
);
const Ctitle = defineAsyncComponent(() =>
  import('../FormComponent/Text/Title/index.vue'),
);
const Ctext = defineAsyncComponent(() =>
  import('../FormComponent/Text/index.vue'),
);
const Cpearson = defineAsyncComponent(() =>
  import('../CanvasComponent/pearsonDiagram/index.vue'),
);
const Ctabs = defineAsyncComponent(() => import('../TabsComponent/index.vue'));

export default {
  name: 'ComponentGroup',
  mixins: [basicOperation, statusManager, dataReporter],
  props: {
    options: {
      type: Array,
      default: () => [],
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
  ],
  data() {
    return {
      currentList: [...this.options],
      timer: new Date().getTime(),
      needToInRow: ['pearson'],
    };
  },
  watch: {
    options: {
      handler() {
        this.currentList = [...this.options];
        this.timer = new Date().getTime();
        this.$nextTick(() => {
          this.needDefault();
        });
      },
      deep: true,
    },
  },
  mounted() {
    // const check = setInterval(() => {
    // clearInterval(check)
    this.$nextTick(() => {
      this.needDefault();
    });
    // }, 1000)
  },
  methods: {
    needDefault() {
      let notFinish = true;
      for (let i = 0; i < this.currentList.length; i++) {
        if (!this.$refs[`comp${i}`]) {
          notFinish = false;
          break;
        }
      }
      if (notFinish) {
        notFinish = this.setDefault();
      }
      if (!notFinish) {
        setTimeout(() => {
          this.needDefault();
        });
      }
    },
    resize() {
      for (let i = 0; i < this.currentList.length; i++) {
        this.refOpera('comp' + i, 'resize');
      }
    },
    filterByForm(param, pos) {
      if (
        ['table', 'chart', 'async', 'echart'].indexOf(
          this.currentList[pos + 1].type,
        ) >= 0
      ) {
        this.refOpera('comp' + (pos + 1), 'linkageForm', param);
      }
    },
    searchByForm(param, pos) {
      if (this.currentList[pos + 1].type === 'table') {
        this.refOpera('comp' + (pos + 1), 'searching', param);
      }
    },

    async changeByForm(param, pos, noNeedToRefresh) {
      await this.$nextTick();
      for (let o = pos + 1; o < this.currentList.length; o++) {
        if (
          ['table', 'chart', 'async', 'echart'].indexOf(
            this.currentList[o].type,
          ) >= 0
        ) {
          this.refOpera('comp' + o, 'linkageChange', param, noNeedToRefresh);
        }
      }
    },

    changeByOutside(param, pos) {
      for (let o = pos - 1; o >= 0; o--) {
        if (this.currentList[o].type === 'form') {
          this.refOpera('comp' + o, 'linkageOutside', param);
          break;
        }
      }
    },

    refreshByForm(pos) {
      for (let o = pos + 1; o < this.currentList.length; o++) {
        if (['async', 'chart'].indexOf(this.currentList[o].type) >= 0) {
          this.refOpera('comp' + o, 'linkageRefresh');
          break;
        }
      }
    },

    rangeByForm(param, pos) {
      for (let o = pos + 1; o < this.currentList.length; o++) {
        if (this.currentList[o].type === 'table') {
          this.refOpera('comp' + o, 'linkageRange', param);
          break;
        }
      }
    },

    headerPageByForm(param, pos) {
      for (let o = pos + 1; o < this.currentList.length; o++) {
        if (this.currentList[o].type === 'table') {
          this.refOpera('comp' + o, 'linkageHeaderPage', param);
          break;
        }
      }
    },

    filterTableByForm(param, pos) {
      for (let o = pos + 1; o < this.currentList.length; o++) {
        if (this.currentList[o].type === 'table') {
          this.refOpera('comp' + o, 'linkageFilterTable', param);
          break;
        }
      }
    },

    fixedAfterRequest() {
      const vm = this;
      return (params) => {
        if (params.operation && typeof params.operation === 'function') {
          const res = {};
          for (let i = 0; i < vm.currentList.length; i++) {
            const val = vm.currentList[i];
            res[val.name || 'comp' + i] = vm.$refs['comp' + i];
          }
          params.operation(res, params, vm);
        }
      };
    },

    setDefault() {
      for (let i = 0; i < this.currentList.length; i++) {
        const val = this.currentList[i];
        if (['form', 'chart', 'table'].indexOf(val.type) >= 0) {
          if (!this.refOpera('comp' + i, 'setDefault')) {
            return false;
          }
        }
      }
      return true;
    },

    addEvents(obj, operation) {
      for (const name in operation) {
        obj.on[name] = operation[name];
      }
    },

    addEventForForm(obj, pos) {
      this.addEvents(obj, {
        search: (content) => {
          this.searchByForm(content, pos);
        },
        form: (formList) => {
          this.filterByForm(formList, pos);
        },
        refresh: () => {
          this.refreshByForm(pos);
        },
        change: (param) => {
          this.changeByForm(param, pos);
        },
        range: (param) => {
          this.rangeByForm(param, pos);
        },
        headerPage: (param) => {
          this.headerPageByForm(param, pos);
        },
        filterTable: (param) => {
          this.filterTableByForm(param, pos);
        },
      });
    },

    addEventForChart(obj, pos) {
      this.addEvents(obj, {
        refreshed: () => {
          if (!this.collecting) {
            this.$emit('refreshed');
          } else {
            this.asyncRequestRefreshed();
          }
        },
        reporter: (res, type) => {
          this.combineReporter(res, type);
        },
      });
    },

    addEventForOthers(obj, pos, async = false) {
      const eves = {
        change: (param) => {
          this.changeByOutside(param, pos);
        },
      };
      if (async) {
        eves.afterRequest = this.fixedAfterRequest();
      }
      this.addEvents(obj, eves);
    },

    addEventForTable(obj, pos) {
      this.addEvents(obj, {
        refreshed: () => {
          this.$emit('refreshed');
        },
      });
    },

    children(h) {
      const child = [];
      for (let i = 0; i < this.currentList.length; i++) {
        const val = this.currentList[i];
        const variable = {
          props: val.props,
          // attrs: val.props,
          ref: 'comp' + i,
          key: i,
          on: {},
        };
        if (val.type === 'form') {
          this.addEventForForm(variable, i);
        }
        if (
          ['group', 'chart', 'echart', 'async', 'tabs'].indexOf(val.type) >= 0
        ) {
          this.addEventForChart(variable, i);
        }
        if (['table', 'chart'].indexOf(val.type) >= 0) {
          this.addEventForOthers(variable, i, false);
        }
        if (val.type === 'async') {
          this.addEventForOthers(variable, i, true);
        }
        if (['table'].indexOf(val.type) >= 0) {
          this.addEventForTable(variable, i);
        }
        const classDiv = 'comp-group__each' + (' ' + val.type + '_inrow');
        child.push(
          h(
            'div',
            {
              class: classDiv,
            },
            [h(this.getComponent(val.type), variable)],
          ),
        );
      }
      return child;
    },
    // cc
    getComponent(type) {
      switch (type) {
        case 'form':
          return Cform;
        case 'table':
          return Ctable;
        case 'chart':
          return Cchart;
        case 'echart':
          return Cechart;
        case 'async':
          return Casync;
        case 'title':
          return Ctitle;
        case 'text':
          return Ctext;
        case 'pearson':
          return Cpearson;
        case 'tabs':
          return Ctabs;
        default:
          return 'div';
      }
    },

    checkInRow() {
      return this.currentList.find((item) => {
        return this.needToInRow.indexOf(item.type) >= 0;
      });
    },

    groups(h) {
      const inRow = this.checkInRow();
      return h(
        'section',
        {
          class: 'cus-group__container' + (inRow ? ' container__inrow' : ''),
        },
        this.children(h),
      );
    },
  },
  render() {
    return this.groups(hh);
  },
};
</script>

<style lang="scss" scoped>
.cus-group__container {
  width: 100%;
  background-color: #f5f8ff;
  border-radius: 3px;
  .comp-group__each {
    width: 100%;
    margin: 12px 0px;
    &:last-child {
      margin-bottom: 10px;
    }
  }
}
.container__inrow {
  @include flex(row, flex-start, flex-start);
  width: 100%;
  height: 100%;
  position: relative;
}
.table_inrow {
  flex: 1 1 30%;
  min-width: 30%;
}
.group_inrow {
  flex: 1 1 30%;
  min-width: 30%;
}
.pearson_inrow {
  padding-left: 12px;
  flex: 1 1 100%;
  height: 100%;
  max-height: 95%;
  @include flex(row, flex-start, flex-start);
}
</style>
