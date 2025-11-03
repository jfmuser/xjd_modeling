<template>
  <div class="report-nav">
    <crefresh @refresh="refreshAll" />
    <span v-if="reportType.has" class="nav-item-wrap">
      <span class="title">下载:</span>
      <span
        v-if="reportType.hasReport"
        :class="noReportData ? 'disable-color' : 'nav-item'"
        @click="download('report', noReportData)"
      >
        报告
        <div v-show="noReportData" class="disable-div" />
      </span>
      <span
        v-if="reportType.hasModel"
        :class="noModelData ? 'disable-color' : 'nav-item'"
        @click="download('model', noModelData)"
      >
        模型
        <div v-show="noModelData" class="disable-div" />
      </span>
      <span
        v-if="reportType.hasData"
        :class="noDataOutput ? 'disable-color' : 'nav-item'"
        @click="download('data', noDataOutput)"
      >
        数据
        <div v-show="noDataOutput" class="disable-div" />
      </span>
    </span>
  </div>
</template>

<script>
import crefresh from './Refresh.vue';

export default {
  name: 'ReportNav',
  components: {
    crefresh,
  },
  props: {
    modelType: {
      type: String,
      default: '',
    },
    reportType: {
      type: Object,
      default: () => ({}),
    },
    noReportData: {
      type: Boolean,
      default: false,
    },
    noModelData: {
      type: Boolean,
      default: false,
    },
    noDataOutput: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['refresh', 'download'],
  data() {
    return {};
  },
  methods: {
    download(command, disabled) {
      if (!disabled) {
        this.$emit('download', command);
      }
    },
    refreshAll() {
      this.$emit('refresh');
    },
  },
};
</script>

<style lang="scss" scoped>
.report-nav {
  display: inline;
  line-height: 26px;
  padding-left: 14px;
  background-color: #fff;
  span {
    width: 80px;
    font-size: 12px;
    font-weight: bold;
    color: #4159d1;
    text-align: center;
    display: inline-block;
  }
  .nav-item-wrap {
    background-color: #ebedf0;
    width: auto;
    margin-right: 24px;
    padding-left: 20px;
    padding-right: 12px;
    .title {
      color: #6a6c75;
      font-weight: bold;
      min-width: 25px;
    }
    .nav-item {
      position: relative;
      cursor: pointer;
      &:hover::after {
        content: ' ';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 80%;
        margin: auto;
        height: 1px;
        background-color: #6d71d8;
      }
    }
  }
}

.operation-btnicon {
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  line-height: 1;
}

.disable-div {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}
.disable-color {
  position: relative;
  color: #c6c8cc !important;
  cursor: auto;
}
</style>
