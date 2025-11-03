<template>
  <div id="tableSlider" class="table_slider-container" @click="showOff">
    <slot name="btn">
      <icon-hover-and-active
        :class-name="'img-wrapper'"
        :default-url="
          require('@/components/CanvasComponent/pearsonDiagram/icons/filter_default.png')
        "
        :hover-url="
          require('@/components/CanvasComponent/pearsonDiagram/icons/filter_hover.png')
        "
        :active-url="
          require('@/components/CanvasComponent/pearsonDiagram/icons/filter_click.png')
        "
        :disable-url="
          require('@/components/CanvasComponent/pearsonDiagram/icons/filter_default.png')
        "
        :disabled="disabled"
        class="operation-btnicon btn-no-margin"
        @clickFn="showOn"
      />
    </slot>
    <div
      :style="{ display: isShowing ? 'flex' : 'none' }"
      class="content"
      @click.stop
    >
      <img
        :src="
          require('@/components/CanvasComponent/pearsonDiagram/icons/sortby.png')
        "
        alt
      />
      <c-slider
        :max="dataMax"
        :min="dataMin"
        :label="label"
        :styles="'min-width:200px;'"
        :range="range"
        @range="rangeChange"
      />
      <el-icon :class="{ 'icon-hover': isHovering }" @click="submit">
        <check />
      </el-icon>
    </div>
  </div>
</template>

<script>
import isFunction from 'lodash/isFunction';
export default {
  name: 'TableSlider',
  components: {
    cSlider: () => import('../Slider/index.vue'),
    iconHoverAndActive: () =>
      import('@/components/IconHoverAndActive/index.vue'),
  },
  props: {
    max: {
      type: Number,
      default: 1,
    },
    min: {
      type: Number,
      default: 0,
    },
    range: {
      type: Boolean,
      default: true,
    },
    formatRange: {
      type: Function,
      default: (value) => value,
    },
    label: {
      type: String,
      default: '',
    },
    outSide: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dataMax: this.max,
      dataMin: this.min,
      isShowing: false,
      isHovering: false,
      valueRange: null,
    };
  },

  computed: {
    disabled() {
      return isNaN(this.dataMin) || isNaN(this.dataMax);
    },
  },

  mounted() {
    const _t = this;
    this.$nextTick(() => {
      const dom = document.getElementById('tableSlider').parentNode;
      dom.addEventListener('click', () => {
        _t.showOff();
      });
    });
  },

  methods: {
    linkageOutside(val) {
      if (isFunction(this.outSide)) {
        this.outSide(val);
      }
    },
    showOn() {
      if (!isNaN(this.dataMax) && !isNaN(this.dataMin)) {
        this.isShowing = true;
      }
    },
    showOff() {
      this.isShowing = false;
    },
    rangeChange(range) {
      this.valueRange = range;
      this.isHovering = true;
    },
    change() {
      if (this.valueRange) {
        this.$emit(
          'range',
          isFunction(this.formatRange)
            ? this.formatRange(this.valueRange)
            : this.valueRange,
        );
      }
    },
    submit() {
      this.isHovering = false;
      this.change();
      this.showOff();
    },
  },
};
</script>

<style scoped lang="scss">
.table_slider-container {
  position: relative;
  .content {
    position: absolute;
    @include flex(row, space-between, center);
    padding: 5px 12px;
    box-shadow: 1px 1px 4px #aaa;
    z-index: 10;
    background-color: #fff;
    min-width: 400px;
    right: 0px;
  }
}
.icon-hover {
  color: green;
  cursor: pointer;
}
</style>
