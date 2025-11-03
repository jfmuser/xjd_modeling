import { defineStore } from 'pinia';
import storeId from '../store.id';

const useJobComponentStore = defineStore(storeId.jobComponent, {
  state: () => ({
    current: {},
    status: ''
  }),
  getters: {},
  actions: {
    setCurrent(val) {
      this.current = val;
    },
    setStatus(val) {
      this.status = val;
    },
  },
});

export default useJobComponentStore;
