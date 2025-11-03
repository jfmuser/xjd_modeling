<template>
  <!-- <el-dialog
    v-model="visible"
    v-loading="loading"
    class="dialog"
    append-to-body
    title="报告下载设置"
  >
    <div class="wrap">
      <heading title="根据需要修改变量名:" tip="(改动只影响下载文件)" />
      <table-form ref="tableImplying" :data="variableNames" />
      <div class="divider" />
      <template v-if="useLogic">
        <heading
          title="Add logic for variable:"
          tip="(files will contain variables that match the logic only)"
        >
          <template #append>
            <span v-show="logicErrorMsg" class="error">{{
              logicErrorMsg
            }}</span>
          </template>
        </heading>
        <logic
          v-for="item in logics"
          :key="item.label"
          v-bind.sync="item"
          @error="onLogicError"
        />
        <div class="divider" />
      </template>
      <heading title="选择所需下载文件">
        <template #append>
          <span v-show="filesErrorMsg" class="error">{{ filesErrorMsg }}</span>
        </template>
      </heading>
      <files :files="downloadList" @change="handleFilesSelect" />
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button
          :disabled="disabledDownload"
          type="primary"
          @click="handleDownload"
          >下载
        </el-button>
        <el-button @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog> -->
</template>

<script>
import Heading from './Heading.vue';
import TableForm from './TableForm.vue';
import Logic from './Logic.vue';
import Files from './Files.vue';
import { DownloadUtil /*, CSVFile */, CSVConut } from '../files';
import { deepClone } from '@/utils';

let du = null;
function notNull(res) {
  return res !== '' && res !== null && res !== undefined && !Number.isNaN(res);
}
async function mkzip(res, name, filterFunction) {
  if (!du) {
    du = new DownloadUtil();
  }
  let eachFile = new Map();
  const eachItem = (obj, into) => {
    const intoCheck = notNull(into) ? into.toString() : '';
    if (typeof obj !== 'object') {
      return void 0;
    }
    const nextList = Object.keys(obj);
    const hasNext = nextList.find(
      (item) => obj[item] && notNull(obj[item].title) && nextList.length > 1,
    );
    if (notNull(hasNext) && notNull(obj.title)) {
      du.createFold(obj.title.toString(), into);
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] && !obj[key].data) {
        eachItem(obj[key], obj.title);
      } else if (key.match('.png') && obj[key]) {
        du.addPng(
          (notNull(obj.title)
            ? obj.title.toString().replace('|', '_') + '_'
            : '') + key,
          obj[key].split(',')[1],
          intoCheck || '',
        );
      } else if (key.match('.csv') && obj[key]) {
        const file =
          eachFile.get(key) || new CSVConut(key, intoCheck || '', true);
        // du.addCSV((obj.title ? obj.title + '_' : '') + key, obj[key], obj.title
        file.add(
          notNull(obj.title) ? obj.title.toString().replace('|', '_') : '',
          filterFunction ? filterFunction(obj[key]) : obj[key],
        );
        eachFile.set(key, file);
      } else if (Array.isArray(obj[key]) && obj[key].length > 0) {
        for (const val of obj[val]) {
          eachItem(val, obj.title);
        }
      }
    }
  };
  for (const val of res) {
    eachItem(val);
    eachFile.forEach((item, key) => {
      const res = item.getData();
      du.addFile(res.name, res.data, res.into);
    });
    eachFile = new Map();
  }
  try {
    await du.save(name);
    du = null;
  } catch (e) {
    console.error(e);
  }
  return true;
}

function curry(func) {
  return function (condition) {
    if (condition == null || condition === '') {
      return () => true;
    }
    if (condition.indexOf(',') > -1 || condition.indexOf('~') > -1) {
      condition = strToRange(condition);
    }
    if (typeof condition === 'string') {
      condition = +condition;
    }
    return func.bind(null, condition);
  };
}

const strToRange = (str) => {
  const rangeArr = str.split(',');
  return rangeArr.map((s) => {
    return s.indexOf('~') > 0 ? s.split('~').map((n) => +n) : +s;
  });
};

const OPERATORS_FUNC = {
  greater: curry((c, value) => value > c),
  less: curry((c, value) => value < c),
  equal: curry((c, value) => value === c),
  greaterOrEqual: curry((c, value) => value >= c),
  lessOrEqual: curry((c, value) => value <= c),
  notEqual: curry((c, value) => value !== c),
  in: curry((c, value) => {
    for (let i = 0; i < c.length; i++) {
      const element = c[i];
      if (Array.isArray(element)) {
        if (element[0] <= value && element[1] >= value) {
          return true;
        }
      } else if (element === value) {
        return true;
      }
    }
    return false;
  }),
  notIn: (t) => {
    return OPERATORS_FUNC.in(t);
  },
};

function parseLogicFunc(logic, prop) {
  return (value) => {
    return CHECKLABEL[logic.label](
      value,
      OPERATORS_FUNC[logic.operator](logic.condition),
      prop,
    );
    // OPERATORS_FUNC[logic.operator](logic.condition)(prop(value))
  };
}

const CHECKLABEL = {
  iv: (value, func, prop) => {
    let res = true;
    for (const key in value) {
      if (
        key.toLowerCase().match('iv') &&
        !key.toLowerCase().match('_disable')
      ) {
        res = func(parseFloat(value[key]));
      }
    }
    return res;
  },
  anonym_index: (value, func, prop) => {
    return func(value['_anony_index']);
  },
};

export default {
  name: 'DownloadReport',
  components: {
    Heading,
    TableForm,
    Logic,
    Files,
  },
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    downloadList: {
      type: Array,
      default: () => [],
    },
    useLogic: {
      type: [Boolean, Object],
      default: false,
    },
  },
  emits: ['download', 'filterLogic'],
  data() {
    return {
      visible: false,
      loading: false,
      variableNames: [],
      logics: [],
      logicErrorMsg: '',
      filesErrorMsg: '',
    };
  },
  computed: {
    disabledDownload() {
      return !!(this.logicErrorMsg || this.filesErrorMsg);
    },
  },
  watch: {
    useLogic: {
      handler(val) {
        if (!val) {
          return [];
        }
        const arr = [];
        for (const key in this.useLogic) {
          // TODO
          // eslint-disable-next-line no-prototype-builtins
          if (this.useLogic.hasOwnProperty(key)) {
            const element = this.useLogic[key];
            if (element) {
              arr.push({
                label: key,
                checked: false,
                operator: 'greater',
                condition: '',
                variableType: element.variableType,
              });
            }
          }
        }
        this.logics = arr;
      },
      immediate: true,
    },
    tableData: {
      handler(val) {
        this.variableNames = val.map(({ variable }) => {
          return {
            origin: variable,
            modified: '',
          };
        });
      },
      immediate: true,
    },
    logics: {
      handler() {
        this.logicErrorMsg = '';
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    onLogicError(error) {
      if (error) {
        this.logicErrorMsg = error;
      } else {
        this.$emit('filterLogic', this.filterLogics());
      }
    },
    logicError(res) {
      this.logicErrorMsg = res ? '' : 'no variable matches logic';
    },
    handleFilesSelect() {
      if (!this.downloadList.some((file) => file.checked)) {
        this.filesErrorMsg = '* 至少选择一个文件';
        return;
      }
      this.filesErrorMsg = '';
    },
    filterLogics() {
      const filterFunc = this.logics
        .filter((l) => l.checked && l.condition !== '')
        .map((l) => parseLogicFunc(l, (item) => item[l.label]));
      return filterFunc;
    },
    filterTabelByLogic(tableData) {
      const tables = deepClone(tableData);
      const tableDatas = Array.isArray(tables.data)
        ? tables.data
        : [tables.data];
      const filterFunc = this.filterLogics();
      let table = '';
      tableDatas.forEach((item, index) => {
        item.index = index;
      });
      table = filterFunc.reduce((acc, func) => {
        return acc.filter((item) => func(item));
      }, tableDatas);
      tables.data = table;
      return tables;
    },
    show() {
      this.visible = true;
      this.logicErrorMsg = '';
      this.$nextTick(() => {
        this.handleFilesSelect();
      });
    },
    handleDownload() {
      const vm = this;
      const { variableNames, downloadList } = this;
      this.loading = true;
      const args = {};
      const downlist = [];
      downloadList.forEach((item) => {
        if (item.checked) {
          downlist.push(item.filename);
        }
      });
      const implyList = [];
      for (const val of variableNames) {
        if (val.modified) {
          implyList.push(val);
        }
      }
      args.imply = implyList;
      args.compare = this.filterLogics();
      args.needExport = downlist;
      this.$nextTick(() => {
        setTimeout(() => {
          vm.$emit('download', args);
        }, 200);
      });
    },
    downloadFiles(res, name) {
      const imply = this.getImplying();
      if (imply) {
        res.push(imply);
      }
      mkzip(res, name, '').then(() => {
        this.loaded();
      });
    },
    loaded() {
      this.loading = false;
    },
    getImplying() {
      if (this.$refs.tableImplying) {
        return this.$refs.tableImplying.tableDownload();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../../../styles/common/color.scss';
@import '../common.scss';

::v-deep .error {
  color: rgb(255, 109, 90);
  font-size: 12px;
}

.divider {
  display: block;
  width: 100%;
  margin: 20px 0;
  border-bottom: 2px solid #dcdde0;
}
</style>
