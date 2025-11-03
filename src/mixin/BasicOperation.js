const BasicOperation = {
  methods: {
    change(val) {
      this.$emit('change', val);
    },

    refOpera(name, functionName, ...args) {
      let result = true;
      if (this.$refs[name] && this.$refs[name][functionName]) {
        result = this.$refs[name][functionName](...args);
      } else if (
        this.$refs[name] &&
        this.$refs[name][0] &&
        this.$refs[name][0][functionName]
      ) {
        result = this.$refs[name][0][functionName](...args);
      } else {
        result = false;
      }
      return result;
    },

    toArr(data) {
      return Array.isArray(data) ? data : [data];
    },
  },
};

export default BasicOperation;
