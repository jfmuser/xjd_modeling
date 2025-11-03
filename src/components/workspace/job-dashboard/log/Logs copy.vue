<!-- 
    Author: YangWuLong
    UpDate: 2023.3
    version:fate1.7
 -->
<template>
  <div class="log-wrapper">
    <div class="legend">
      <el-badge v-for="item in legends" :key="item" :value="counts[item]" :hidden="counts[item] === 0">
        <el-button size="small" :type="currentLogType === item ? 'primary' : ''" @click="changeSubTab(item)">{{
          $translate(`log.${item}`) }}
          <!-- 英文转中文 -->
        </el-button>
      </el-badge>
    </div>
    <section class="log-section">
      <!-- {{ LOG_TYPES }}{{ currentLogType }} -->
      <!-- 内容渲染组件 -->
      <log-widget v-for="type in LOG_TYPES" v-show="currentLogType === type" :key="type" :logs="logs[type]"
        @scroll-top="handleScrollTop(type)" />
    </section>
  </div>
</template>

<script>
import LogWidget from '@/components/Log/index.vue';
import ReconnectingWebSocket from '../../../../utils/ReconnectingWebSocket';

const LOG_TYPES = [
  'partyError',
  'partyWarning',
  'partyInfo',
  'partyDebug',
  'jobSchedule',
  'jobError',
];
export default {
  name: 'JobLogs',
  components: {
    LogWidget,
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
      currentMainTab: '算法日志',
      currentLogType: 'partyInfo',
      logs: {},
      counts: {
        // jobError: 0,
        // jobSchedule: 0,
        // partyInfo: 0,
        // partyWarning: 0,
        // partyDebug: 0,
        // partyError: 0,
      },
      logSizeHasRecevied: false,
    };
  },
  // 先执行
  computed: {
    LOG_TYPES() {
      return LOG_TYPES;
    },
    legends() {
      return Object.keys(this.counts).filter((item) => {
        // 判断当前是算法日志/调度日志
        if (this.currentMainTab === '算法日志') {
          // 检测字符串是否已指定字符串开头 返回true
          return item.startsWith('party');
        }
        return item.startsWith('job');
      });
    },
  },
  watch: {
    logSize(val) {
      if (val) {
        this.onPull(false);
      }
    },
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
    this.initLogSocket();
  },
  beforeUnmount() {
    this.ws && this.ws.close();
  },
  methods: {
    // 算法调度 日志调度
    changeMainTab(tab) {
      if (this.currentMainTab === tab) {
        return;
      }
      this.currentMainTab = tab;
      this.currentLogType = tab === '算法日志' ? 'partyInfo' : 'jobSchedule';
      this.shouldInitLogByType(this.currentLogType);
    },
    //二级tab
    changeSubTab(tab) {
      if (this.currentLogType === tab) {
        return;
      }
      this.currentLogType = tab;
      this.shouldInitLogByType(tab);
    },
    shouldInitLogByType(type) {
      return !this.logs[type] && this.onPull(type);
    },
    // 日志无法显示 webSocket 有问题
    initLogSocket() {
      if (!this.ws) {
        this.ws = new ReconnectingWebSocket(
          `/log/new/${this.jobId}/${this.role}/${this.partyId}/default`,
        );
        console.log(this.ws, "算法日志");
        this.ws.addEventListener('message', (event) => {
          console.log(event.data, "算法日志");
          this.handleLogMessage(JSON.parse(event.data));
        });
      }
      return this.ws;
    },
    handleLogMessage(data) {
      if (data.type === 'logSize') {
        this.handleLogSizeResponse(data.data);
      } else {
        this.insertLogs(data);
      }
    },
    handleLogSizeResponse(size) {
      if (!this.logSizeHasRecevied) {
        this.logSizeHasRecevied = true;
      }
      this.counts = size;

    },
    onPull(type, backward = true) {
      const count = this.counts[type];
      console.log(count);
      const size = 50;
      const logs = this.logs[type] || [];
      let begin;
      let end;
      if (!logs.length) {
        end = count;
        begin = Math.max(end - size, 1);
      } else {
        if (backward) {
          end = logs[0].lineNum - 1;
          begin = Math.max(1, end - size);
        } else {
          begin = logs[logs.lengthl - 1].lineNum + 1;
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
              type,
              begin,
              end,
            }),
          );
      } else {
        this.logs[type] = [];
      }
    },
    insertLogs(data) {
      const { type, data: target } = data;
      console.log(type, 'insertlogs', target);
      const logs = this.logs[type] || [];
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
          const startIndex = logs.findIndex((value) => value.lineNum === start);
          const endIndex = logs.findIndex((value) => value.lineNum === end);
          result = logs.slice();
          result.splice(startIndex, endIndex - startIndex + 1, ...target);
        }
      } else {
        result = target;
      }
      result = result.map((item) => Object.freeze(item));
      this.logs = { ...this.logs, [type]: result };
    },
    getLogsRange(arr) {
      return [arr[0].lineNum, arr[arr.length - 1].lineNum];
    },
    handleScrollTop(type) {
      this.onPull(type);
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
