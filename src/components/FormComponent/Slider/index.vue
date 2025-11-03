<template>
  <div class="cus-slider__container">
    <span v-if="label" class="cus-slider__title">{{ label }}:</span>
    <el-slider
      v-model="sliderValue"
      :show-input="!range"
      :input-size="'mini'"
      :show-tooltip="true"
      :max="max"
      :min="min"
      :step="step"
      :range="range"
      :marks="marks"
      :style="styles"
      v-bind="$attrs"
      class="cus-slider__slider"
      @change="formatSlider"
    />
    <el-tooltip
      v-if="tip"
      :content="tip"
      class="item"
      effect="dark"
      placement="right"
    >
      <el-icon><question-filled /></el-icon>
    </el-tooltip>
  </div>
</template>

<script>
import FloatFormat from '../mixin/FloatFormat';
export default {
  name: 'CusSlider',
  mixins: [FloatFormat],
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 1,
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 0.01,
    },
    marks: {
      type: Object,
      default: () => ({}),
    },
    tip: {
      type: String,
      default: '',
    },
    range: {
      type: Boolean,
      default: false,
    },
    styles: {
      type: String,
      default: '',
    },
  },
  emits: ['range'],
  data() {
    return {
      sliderValue: this.value,
    };
  },
  watch: {
    min() {
      this.sliderCheck();
    },
    max() {
      this.sliderCheck();
    },
  },
  created() {
    this.sliderCheck();
  },
  methods: {
    formatSlider(value) {
      if (!Array.isArray(value)) {
        this.sliderValue = this._nearby(value, this.step);
      }
      this.change();
    },

    change() {
      this.$emit('range', this.sliderValue);
    },

    setDefault() {
      this.change();
      return true;
    },

    sliderCheck() {
      this.sliderValue = !this.range ? this.value : [this.min, this.max];
    },
  },
};
</script>

<style lang="scss" scoped>
.cus-slider__container {
  @include flex(row, flex-start, center);
  .cus-slider__title {
    white-space: nowrap;
  }
  .cus-slider__slider {
    min-width: 350px;
    margin: 0 25px;
  }
}
</style>
