<!-- 
    Author: YangWuLong
    UpDate: 2023.3
    version:fate1.9
 -->
<template>
  <div class="log-wrapper">

    <!-- sub tab -->
    <!-- :value="counts[item]" -->
    <div class="legend">
      <el-badge
        v-for="(item, key) in mainTabs[currentMainTab].tabs"
        :key="item"
        :value="counts[item]"
      >
        <el-button
          size="small"
          :type="currentLogType === item ? 'primary' : ''"
          @click="changeSubTab(key)"
          >{{ $translate(`log.${item}`) }}
          <!-- 英文转中文 -->
        </el-button>
      </el-badge>
    </div>
    
    <!--  日志的显示-->
    <section class="log-section">
      
      <LogWidget
        v-for="type in LOG_TYPES"
        v-show="currentLogType === type"
        :key="type"
        :logs="logs[type + '_' + currentInstanceId]"
        @scroll-top="handleScrollTop(type)"
      />
    </section>
  </div>
</template>

<script>
import LogWidget from '@/components/Log/index.vue';
import ReconnectingWebSocket from '../../../../utils/ReconnectingWebSocket';
// 算法调度日志获取id
import { getInstanceId } from '../../../../apis/workspace/chart.api';
const LOG_TYPES = [
  'partyError',
  'partyWarning',
  'partyInfo',
  'partyDebug',
  'jobSchedule',
  'jobError',
];

const [
  PARTY_ERROR,
  PARTY_WARNING,
  PARTY_INFO,
  PARTY_DEBUG,
  JOB_SCHEDULE,
  JOB_ERROR,
] = LOG_TYPES;

// eslint-disable-next-line no-unused-vars
const LOG_TYPES_CAT = {
  logSize: 'logSize',
  log: 'log',
  [PARTY_ERROR]: 'log',
  [PARTY_WARNING]: 'log',
  [PARTY_INFO]: 'log',
  [PARTY_DEBUG]: 'log',
  [JOB_SCHEDULE]: 'log',
  [JOB_ERROR]: 'log',
};
function createTabObj(tabs, current, ...args) {
  return {
    tabs,
    current,
    ...args,
  };
}
export default {
  name: 'JobLogs',
  components: {
    LogWidget,
  },
  filters: {
    capitalize(str) {
      return str.substring(0, 1).toUpperCase() + str.substring(1);
    },
  },
  props: {
    jobId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    partyId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentMainTab: 'algorithm',
      algorithmTab: createTabObj(
        {
          [PARTY_ERROR]: 'partyError',
          [PARTY_WARNING]: 'partyWarning',
          [PARTY_INFO]: 'partyInfo',
          [PARTY_DEBUG]: 'partyDebug',
        },
        PARTY_INFO,
      ),
      scheduleTab: createTabObj(
        {
          [JOB_SCHEDULE]: 'jobSchedule',
          [JOB_ERROR]: 'jobError',
        },
        JOB_SCHEDULE,
      ),
      logs: {},
      counts: {},
      logSizeHasRecevied: false,
      expandAll: false,

      // 高可用支持，多台机器，多份日志展示
      instanceId: [],
      currentInstanceId: '',

      runningInterval: null,
    };
  },
  computed: {
    LOG_TYPES() {
      return LOG_TYPES;
    },
    mainTabs() {
      return {
        algorithm: this.algorithmTab,
        schedule: this.scheduleTab,
      };
    },
    currentLogType() {
      return (
        this.mainTabs[this.currentMainTab] &&
        this.mainTabs[this.currentMainTab].current
      );
    },
    instanceSelection() {
      const list = [];
      for (const id of this.instanceId) {
        list.push({
          label: id,
          value: id,
        });
      }
      return list;
    },
  },
  watch: {
    logSizeHasRecevied(val) {
      if (val) {
        this.onPull(this.currentLogType);
      }
    },
    counts: {
      handler(val, oldVal) {
        for (const key in val) {
          // eslint-disable-next-line no-prototype-builtins
          if (val.hasOwnProperty(key)) {
            if (val[key] !== oldVal[key] && key === this.currentLogType) {
              this.onPull(key, false);
            }
          }
        }
      },
      deep: true,
    },
  },
  created() {
    this.getInstanceIdFromFlow().then(() => {
      this.initLogSocket();
    });
  },
  methods: {

    changeMainTab(tab) {
      if (this.currentMainTab === tab) {
        return;
      }
      this.currentMainTab = tab;
      this.currentLogType = tab === '算法日志' ? 'partyInfo' : 'jobSchedule';

      this.shouldInitLogByType(this.currentLogType);
    },
    changeSubTab(tab) {
      if (this.currentLogType === tab) {
        return;
      }
      this.mainTabs[this.currentMainTab].current = tab;
      this.shouldInitLogByType(tab);
    },
    shouldInitLogByType(type) {
      return (
        !this.logs[type + '_' + this.currentInstanceId] && this.onPull(type)
      );
    },
    getInstanceIdFromFlow() {
      return getInstanceId().then((res) => {
        console.log("res",res);
        const result = [];
        for (const [instance] of Object.entries(res.data)) {
          if (instance.host === window.location.host) {
            this.currentInstanceId = instance.instance_id;
          }
          result.push(instance.instance_id);
        }
        if (!this.currentInstanceId) {
          this.currentInstanceId = result[0];
        }
        this.instanceId = result;
      });
    },
    initLogSocket() {
      if (!this.ws) {
        this.ws = new ReconnectingWebSocket(
          `/log/new/${this.jobId}/${this.role}/${this.partyId}/default`,
        );
        this.ws.addEventListener('message', (event) => {
          const res = { data: JSON.parse(event.data) };
          console.log('算法日志', res);
          if (res.data[JOB_ERROR] !== undefined) {
            res.type = 'logSize';
          } else {
            res.type = 'log';
          }
          this.handleLogMessage(res);
        });
        this.ws.addEventListener('open', () => {
          this.intervalPull();
        });
      }
      return this.ws;
    },
    handleLogMessage(data) {
      const type = LOG_TYPES_CAT[data.type];
      switch (type) {
        case 'logSize':
          this.handleLogSizeResponse(data.data);
          break;
        case 'log':
          this.insertLogs(data.data);
          break;
        default:
          break;
      }
    },
    handleLogSizeResponse(size) {
      if (!this.logSizeHasRecevied) {
        this.logSizeHasRecevied = true;
      }
      this.setLogSize(size);
    },
    setLogSize(size) {
      this.counts = Object.assign({}, this.counts, size);
    },
    onPull(type, backward = true) {
      const count = this.counts[type];
      const size = 50;
      const logs = this.logs[type + '_' + this.currentInstanceId] || [];
      const instanceId = this.currentInstanceId;
      let begin;
      let end;
      if (!logs.length) {
        end = count;
        begin = Math.max(end - size, 1);
      } else {
        if (backward) {
          end = parseFloat(logs[0].lineNum) - 1;
          begin = Math.max(1, end - size);
        } else {
          begin = parseFloat(logs[logs.length - 1].lineNum) + 1;
          end = count;
        }
      }

      if (count > 0) {
        if (end < begin) {
          return;
        }
        this.ws &&
          this.ws.send(
            JSON.stringify({
              instanceId,
              type,
              begin,
              end,
            }),
          );
      } else {
        this.logs[type + '_' + this.currentInstanceId] = [];
      }
    },
    onCountPull() {
      const type = 'logSize';
      const instanceId = this.currentInstanceId;
      this.ws.send(
        JSON.stringify({
          type,
          instanceId,
        }),
      );
    },
    intervalPull() {
      if (!this.runningInterval) {
        this.onCountPull();
        this.runningInterval = setInterval(() => {
          this.onCountPull();
        }, 10000);
      }
    },
    insertLogs(data) {
      const { type, data: target } = data;
      const logs = this.logs[type + '_' + this.currentInstanceId] || [];
      let result = [];
      if (logs.length) {
        const targetRange = this.getLogsRange(target);
        const originRange = this.getLogsRange(logs);
        if (targetRange[0] > originRange[1]) {
          result = result.concat(logs, target);
        } else if (targetRange[1] < originRange[0]) {
          result = result.concat(target, logs);
        } else {
          const start = Math.max(targetRange[0], originRange[0]);
          const end = Math.min(targetRange[1], originRange[1]);
          const startIndex = logs.findIndex(
            (value) => Math.abs(parseFloat(value.lineNum) - start) < 0.001,
          );
          const endIndex = logs.findIndex(
            (value) => Math.abs(parseFloat(value.lineNum) - end) < 0.001,
          );
          result = logs.slice();
          result.splice(startIndex, endIndex - startIndex + 1, ...target);
        }
      } else {
        result = target;
      }
      result = result.map((item) => Object.freeze(item));
      this.logs = {
        ...this.logs,
        [type + '_' + this.currentInstanceId]: result,
      };
    },
    getLogsRange(arr) {
      return [
        parseFloat(arr[0].lineNum),
        parseFloat(arr[arr.length - 1].lineNum),
      ];
    },
    handleScrollTop(type) {
      this.onPull(type);
    },
    toggle() {
      this.expandAll = !this.expandAll;
      if (this.expandAll) {
        this.$nextTick(() => {
          this.$el.scrollIntoView();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.log-wrapper {
  position: relative;
  height: 100%;
  .legend {
    padding: 10px 0;
    display: flex;
    gap: 30px;
  }
  .log-section {
    width: 100%;
    height: calc(100% - 45px);
    position: absolute;
  }
}
</style>
