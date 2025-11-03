import { defineStore } from 'pinia';
import storeId from '../store.id';

const useOperatorStore = defineStore(storeId.operator, {
  state: () => ({ configInfo: {} }),
  getters: {
    operatorConfigInfo: (state) => (key) => state.configInfo[key] || {},
  },
  actions: {
    updateConfigInfo(data) {
      this.configInfo = { ...this.configInfo, ...data };
    },
  },
});

export default useOperatorStore;
