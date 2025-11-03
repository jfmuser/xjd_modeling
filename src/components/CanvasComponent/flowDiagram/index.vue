<template>
  <div class="container">
    <canvas :id="canvasId" />
    <div v-if="operationList" class="buttonList">
      <div class="opera_btn" @click="suitableWhole">
        <el-icon><full-screen /></el-icon>
      </div>
      <div class="opera_btn" @click="bigger">
        <el-icon><zoom-in /></el-icon>
      </div>
      <div class="opera_btn" @click="small">
        <el-icon><zoom-out /></el-icon>
      </div>
    </div>
  </div>
</template>

<script>
import flowDiagram from '../canvas/extra/flowDiagram';
import Layer from '../canvas/Core';

export default {
  name: 'FlowDiagram',
  props: {
    dagInfo: {
      type: Object,
      default: () => ({}),
    },
    purePic: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: Boolean,
      default: false,
    },
    operationList: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      dagCheck: null,
      flowData: null,
      images: new Map(),
      thumb: 0.6,
      canvasId: 'flowDiagramCanvas',
      canvas: null,
      choosed: null,

      needToSet: [],
      originalSetting: null,
      imageSetting: [
        {
          name: 'COMPLETE',
          url: new URL('./icons/complete.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_COMPLETE',
          url: new URL('./icons/disable_complete.svg', import.meta.url).href,
        },
        {
          name: 'SUCCESS',
          url: new URL('./icons/complete.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_SUCCESS',
          url: new URL('./icons/disable_complete.svg', import.meta.url).href,
        },
        {
          name: 'FAIL',
          url: new URL('./icons/error.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_FAIL',
          url: new URL('./icons/disable_error.svg', import.meta.url).href,
        },
        {
          name: 'CANCEL',
          url: new URL('./icons/error.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_CANCEL',
          url: new URL('./icons/disable_error.svg', import.meta.url).href,
        },
        {
          name: 'CANCELED',
          url: new URL('./icons/error.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_CANCELED',
          url: new URL('./icons/disable_error.svg', import.meta.url).href,
        },
        {
          name: 'ERROR',
          url: new URL('./icons/error.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_ERROR',
          url: new URL('./icons/disable_error.svg', import.meta.url).href,
        },
        {
          name: 'FAILED',
          url: new URL('./icons/error.svg', import.meta.url).href,
        },
        {
          name: 'DISABLE_FAILED',
          url: new URL('./icons/disable_error.svg', import.meta.url).href,
        },
        {
          name: 'MULT_DATA_PORT',
          url: new URL('./icons/mult_data.svg', import.meta.url).href,
        },
        {
          name: 'MULT_MODEL_PORT',
          url: new URL('./icons/mult_model.svg', import.meta.url).href,
        },
      ],
    };
  },
  watch: {
    dagInfo: {
      handler() {
        this.checkInfo();
        this.checkFlowData();
        if (!this.canvas || !this.canvas.inited) {
          this.initing();
        }
        this.toSetting();
        this.checkChoosed();
      },
      deep: true,
    },
  },
  created() {
    this.canvasId = Layer.getUUID('flowDiagramCanvas');
    this.checkInfo();
    this.checkFlowData();
  },
  mounted() {
    this.addedImages(this.imageSetting).then(() => {
      this.initing();
    });
  },

  methods: {
    initing() {
      if (!this.dagInfo) {
        throw new TypeError('Daginfo param need to be an Object');
      }
      const can = document.getElementById(this.canvasId);
      if (!can) {
        throw new Error('Can not found canvas-element');
      }
      this.originalSetting = this.dagInfo;
      this.drawComp(can, this.images);
    },
    drawComp(canvasDom, images) {
      const that = this;
      const diagramOperation = this.purePic
        ? { click: false }
        : {
            click: {
              beforeClick: () => {
                flowDiagram.events.lineBright.call(that.component);
              },
              props: [
                (name, here, retry) => {
                  if (retry) {
                    this.$emit('retry', name);
                    return void 0;
                  }
                  if (here) {
                    flowDiagram.events.lineBright.call(that.component, name);
                  }
                  let dataIndex = 0;
                  let status = '';
                  that.dagInfo.component_list.map((item, index) => {
                    if (item.component_name === name) {
                      dataIndex = index;
                      status = item.status;
                    }
                  });
                  const obj = {
                    name,
                    dataIndex,
                    model: that.dagInfo.component_module[name],
                    disable: !that.dagInfo.component_need_run[name],
                    status: status,
                  };
                  if (here) {
                    that.choosed = obj;
                    that.$emit('choose', obj);
                  }
                },
              ],
            },
            // eslint-disable-next-line
          };
      that.canvas = new Layer.CanvasUtil(canvasDom, diagramOperation, (can) => {
        that.getInstance(can, images);
        that.component.drawing();
        if (that.thumbnail) {
          that.checkThumbnail();
        }
        return that.component;
      });
    },
    getInstance(canvas, images) {
      if (canvas) {
        this.component = flowDiagram.drawDiagram({
          canvas,
          props: {
            dagInfo: this.flowData,
            thumbnail: this.thumbnail ? this.thumb : 1,
            images: images,
          },
          clear: flowDiagram.clear,
          events: flowDiagram.events,
        });
      } else {
        return null;
      }
    },
    checkInfo() {
      const final = this.dagCheck || {};
      if (this.dagInfo) {
        for (const item of this.dagInfo.component_list) {
          const status = item.status || 'unrun';
          if (!final[item.component_name]) {
            final[item.component_name] = {
              status: status.charAt(0).toUpperCase() + status.slice(1),
              time: item.time,
            };
          } else {
            if (status !== final[item.component_name].status) {
              this.needToSet.push(item.component_name);
              final[item.component_name].status = status;
              final[item.component_name].time = item.time;
            }
          }
        }
        if (this.dagInfo.component_need_run) {
          for (const key in this.dagInfo.component_need_run) {
            final[key].disable = this.dagInfo.component_need_run[key];
          }
        }
      }
      this.dagCheck = final;
    },
    checkFlowData() {
      if (this.dagInfo) {
        const final = JSON.parse(JSON.stringify(this.dagInfo));
        for (const item of final.component_list) {
          item.status = (item.status || 'unrun').toUpperCase();
        }
        if (!this.flowData) {
          this.flowData = final;
        } else {
          this.flowData = Object.assign(this.flowData, final);
        }
      }
    },
    toSetting() {
      if (this.component) {
        for (const item of this.needToSet) {
          const props = flowDiagram.RUNNING.match(
            this.dagCheck[item].status.toUpperCase(),
          )
            ? this.dagCheck[item].time
            : this.images.get(
                (!this.dagCheck[item].disable ? 'DISABLE_' : '') +
                  this.dagCheck[item].status.toUpperCase(),
                // eslint-disable-next-line
              );
          this.component.emit(
            'to' +
              (this.dagCheck[item].status.charAt(0).toUpperCase() +
                this.dagCheck[item].status.slice(1)),
            item,
            props,
          );
        }
        this.needToSet = [];
      }
    },
    checkChoosed() {
      if (this.choosed) {
        const val = this.dagInfo.component_list[this.choosed.dataIndex];
        if (
          val.component_name === this.choosed.name &&
          val.status !== this.choosed.status
        ) {
          this.choosed.status = val.status;
          this.$emit('choose', this.choosed);
        }
      }
    },
    checkThumbnail() {
      this.component.emit('scale', this.thumb, this.component.toppest);
      this.component._inited = false;
    },

    initImage(name, src) {
      const _that = this;
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
          _that.images.set(name, img);
          resolve();
        };
        img.src = src;
      });
    },
    addedImages(arr) {
      const res = [];
      for (const val of arr) {
        res.push(this.initImage(val.name, val.url));
      }
      return Promise.all(res);
    },

    suitableWhole() {
      const that = this;
      this.canvas.suitableForWhole(
        () => {
          const style = that.component.$meta.get('clear');
          const point = that.component.toppest;
          return { width: style.width, height: style.height, point: point };
        },
        () => {
          that.component.toppest = {
            x: that.canvas.canvasDom.width / 2,
            y: 20,
          };
          that.component._inited = false;
        },
      );
    },
    bigger() {
      this.canvas.scaleBigger();
    },
    small() {
      this.canvas.scaleSmaller();
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}
.buttonList {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  .opera_btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8fa;
    margin-bottom: 12px;
    color: #bbbbc8;
    &:hover {
      background-color: #494ece;
      color: #fff;
    }
    &:last-child {
      margin-bottom: 0px;
    }
  }
}
</style>
