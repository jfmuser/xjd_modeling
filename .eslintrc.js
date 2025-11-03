module.exports = {
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 13,
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'prettier'],
  rules: { 'no-unused-vars': 'warn', 'vue/attribute-hyphenation': 'off' },
  globals: {
    defineProps: 'readonly',
    defineExpose: 'readonly',
    defineEmits: 'readonly',
  },
};
