<template>
  <el-dialog v-model="visible" :title="formatTitle" :fullscreen="fullscreen" :close-on-click-modal="false" width="80%"
    top="70px" :before-close="onClose">
    <div class="dialog-content">
      <report-nav :model-type="modelType" :report-type="reportType" :no-report-data="noReportData"
        :no-model-data="noModelData" :no-data-output="noDataOutput" class="report"
        @download="(command) => $emit('download', command)" @refresh="refreshAll" />
      <el-tabs v-model="activeName" type="card" class="dialog-tabs" @tab-click="changeTabs">
        <!--  v-if="tabIndex === 1" -->

        <el-tab-pane v-if="modelOutputShow" :label="modelName" name="model">
          <JobCombination ref="model_output" :c-list="cList" :visible="visible" @reporter="combinationReporter" />
        </el-tab-pane>

        <el-tab-pane v-if="dataOutputShow" label="数据输出" name="data">
          <DataOutput ref="data_output" :data="dataOutput" @reporter="dataOutputReporter" />
        </el-tab-pane>
        <el-tab-pane label="日志" name="log">
          <job-log v-if="logInited" :visible="visible" :component-name="componentName" :job-id="jobId" :role="role"
            :party-id="partyId" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script>
import ReportNav from './component/ReportNav.vue';
import JobCombination from './component/Combination.vue';
import DataOutput from './component/DataOutput.vue';
import JobLog from './component/Log.vue';
import getTransformFn from '../../../../transform';
import {
  getMetrics,
  getModelOutput,
  getDataOutput,
} from '../../../../apis/workspace/chart.api';
import modelNameMap from '../../../../utils/modelNameMap';
import axios from 'axios';
export default {
  name: 'OutputDialog',
  components: {
    ReportNav,
    JobCombination,
    DataOutput,
    JobLog,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    modelType: {
      type: String,
      default: '',
    },
    componentName: {
      type: String,
      default: '',
    },
    jobId: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: '',
    },
    partyId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: '',
    },
  },
  emits: ['download', 'close-dialog', 'closeDialog', 'cReporter', 'dReporter'],
  data() {
    return {
      fullscreen: false,
      activeName: 'model',
      import: null,
      cList: [],
      tabIndex: 0,
      logInited: false,
      dataOutput: [],
      noReportData: false,
      noModelData: false,
      noDataOutput: false,
      dataOutputResponse: null,
      visible: false,
    };
  },
  computed: {
    formatTitle() {
      let t = this.title;
      if (this.title && this.title.indexOf(':') !== -1) {
        const titles = this.title.split(':');
        const category = titles[0].trim();
        const algorithm = titles[1].trim();
        if (category === 'information_retrieval') {
          t = '安全信息检索';
        } else if (category === 'sample_intersection') {
          t = '安全样本求交';
        } else if (category === 'federated_training') {
          if (algorithm === 'homo_lr_0') {
            t = '横向逻辑回归';
          }
          if (algorithm === 'hetero_fast_secure_boost_0') {
            t = '纵向XGBoost';
          }
        }
      }
      return t;
    },
    modelName() {
      let name = '结果总览';
      const modelOutputCheck = [
        'federated_training',
        'feature_engineering',
        'boost',
        'homoBoost',
        'homoLR',
        'heteroLR',
        'heteroLinR',
        'sklearnLR',
        'poisson',
        'homoNN',
        'heteroNN',
        'heterofm',
        'homofm',
        'heteroMF',
        'heteroSVD',
        'heteroSVDPP',
        'heteroGMF',
      ];
      const metricsOutputCheck = ['evaluation', 'scorecard'];
      if (this.joinComponents(metricsOutputCheck).match(this.modelType)) {
        name = '指标';
      } else if (this.joinComponents(modelOutputCheck).match(this.modelType)) {
        name = '模型输出';
      }
      return name;
    },
    reportType() {
      const componentHasReport = ['binning', 'selection', 'evaluation'];
      const componentHasData = ['binning', 'selection', 'secureboost', 'lr'];
      const componentHasModel = ['secureboost', 'lr'];
      const hasReport = !!this.modelType
        .toLowerCase()
        .match(new RegExp('(' + componentHasReport.join('|') + ')'));
      const hasData = !!this.modelType
        .toLowerCase()
        .match(new RegExp('(' + componentHasData.join('|') + ')'));
      const hasModel = !!this.modelType
        .toLowerCase()
        .match(new RegExp('(' + componentHasModel.join('|') + ')'));
      const has = hasReport || hasData || hasModel;
      return { has, hasReport, hasData, hasModel };
    },
    dataOutputShow() {
      const componentNotHasDataOutput = [
        'correlation',
        'evaluation',
        'psi',
        'statistic',
      ];
      return !this.joinComponents(componentNotHasDataOutput).match(
        this.modelType,
      );
    },
    modelOutputShow() {
      const componentNotHasModelOutput = ['columnexpend'];
      return !this.modelType.match(
        new RegExp(`(${componentNotHasModelOutput.join('|')})`),
      );
    },
  },
  watch: {
    componentName() {
      if (this.componentName) {
        this.refresh();
        this.dataOutputResponse = null;
      }
    },
    fullscreen() {
      this.$refs.model_output.resize();
    },
  },
  created() {
    this.currentActiveName();
  },
  methods: {
    onClose() {
      this.$emit('close-dialog');
    },
    refresh() {
      const param = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name: this.componentName,
      };
      this.transformFn = getTransformFn(this.modelType);
      this.dataDataOutputCheck();
      this.getResults(param);
      this.dataOutput = [];
    },
    refreshAll() {
      if (this.activeName === 'model') {
        this.refresh();
      } else if (this.activeName === 'data') {
        this.getDataOutputData();
      }
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen;
    },
    currentActiveName() {
      if (this.modelOutputShow) {
        this.activeName = 'model';
      } else if (this.dataOutputShow) {
        this.activeName = 'data';
      } else {
        this.activeName = 'log';
      }
    },
    switchVisible() {
      this.currentActiveName();
      this.dataOutput = [];
      this.$emit('closeDialog');
    },
    joinComponents(components) {
      return components.map((component) => modelNameMap[component]).join('|');
    },

    getResults(param) {
      Promise.all([getModelOutput(param), getMetrics(param)]).then(
        async (values) => {
          console.log("values", values);
          const [modelData, metricsData] = values;
          let transformResult = '';
          if (
            (modelData.data === null ||
              modelData.data.toString().toLowerCase().match('no data') ||
              (modelData.msg &&
                modelData.msg.toString().toLowerCase().match('no data'))) &&
            (metricsData.data === null ||
              metricsData.data.toString().toLowerCase().match('no data') ||
              (metricsData.msg &&
                metricsData.msg.toString().toLowerCase().match('no data')))
          ) {
            transformResult = [];
          } else {
            transformResult = this.transformFn(
              modelData,
              metricsData,
              this.partyId,
              this.role,
              this.componentName,
              this.jobId,
              this.modelType,
            );
          }
          if (Array.isArray(transformResult)) {
            this.cList = transformResult;
            if (transformResult.length === 0) {
              this.noModelData = true;
              this.noReportData = true;
            } else {
              this.noModelData = false;
              this.noReportData = false;
            }
          } else {
            transformResult.then((list) => {
              this.cList = list;
              if (list.length === 0) {
                this.noModelData = true;
                this.noReportData = true;
              } else {
                this.noModelData = false;
                this.noReportData = false;
              }
            });
          }
        },
      );
    },
    changeTabs(tab) {

      console.log(tab);
      this.tabIndex = +tab.index;
      switch (+tab.index) {
        case 1:
          this.getDataOutputData();
          break;
        default:
          break;
      }
      switch (tab.paneName) {
        case 'log':
          this.logInited = true;
          break;
        default:
          break;
      }
    },
    getDataOutputData() {
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name: this.componentName,
      };
      const responseHandler = (res) => {
        this.dataOutputResponse = res;
        this.dataOutput = res && res.data || [];
        if (
          !this.dataOutput ||
          !this.dataOutput.retmsg ||
          this.dataOutput.retmsg.toString().toLowerCase().match('no data')
        ) {
          this.noDataOutput = true;
        } else {
          this.noDataOutput = false;
        }
      };
      if (!this.dataOutputResponse) {
        getDataOutput(para).then(responseHandler);
      } else {
        responseHandler(this.dataOutputResponse);
      }
    },
    getNames() {
      return this.$refs['model_output'].getNames();
    },
    getVariableMap() {
      return this.$refs['model_output'].getVariableMap();
    },
    hasIv() {
      return this.$refs['model_output'].hasIv();
    },
    allSteps(args) {
      console.log('allSteps', this.$refs['model_output'].allSteps(args));
      return this.$refs['model_output'].allSteps(args);
    },
    combinationReporter(res) {
      this.$emit('cReporter', res);
    },
    dataOutputReporter(res) {
      this.$emit('dReporter', res);
    },
    handleFilterLogic(filters) {
      return this.$refs['model_output'].handleFilterLogic(filters);
    },
    dataDataOutputCheck() {
      this.getDataOutputData();
    },
  },
};
</script>

<style lang="scss">
.small-form-text {
  font-size: 12px !important;
  font-weight: normal !important;
}

.dialog-content {
  position: relative;
  height: 100%;

  .report {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
  }

  .dialog-tabs {
    margin: 0px;
    height: 100%;
    background: #fff;

    .el-tabs__content {
      height: calc(100% - 40px);

      .el-tab-pane {
        height: 100%;
        width: 100%;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
  }
}
</style>
