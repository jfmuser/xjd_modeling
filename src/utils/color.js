/**
 * 随机生成十六进制颜色
 */
export const randomHexColorCode = () => {
  return `#${(Math.random() * 0xfffff * 1e6).toString(16).slice(0, 6)}`;
};

export const RGBToHex = (r, g, b) =>
  `#${((r << 16) + (g << 8) + b).toString(16).padStart(6, '0')}`;

export const CHART_TEXT_COLOR = '#FFFFFFA6';
export const CHART_GREEN_COLOR = '#9FE6B8';
export const CHART_SUCCESS_COLOR = '#2AA74FFF';
export const CHART_BLUE_COLOR = '#37A2DA';
export const CHART_DANGER_COLOR = '#CE3F57FF';
export const CHART_WARN_COLOR = '#D7AF13FF';
export const CHART_WARNING_COLOR = '#D76428FF';
export const CHART_PRIMARY_COLOR = '#166CBDFF';
