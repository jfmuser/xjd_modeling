import { defineStore } from 'pinia';
import { getConfigInfo } from '../../apis/workspace/other.api';
import storeId from '../store.id';

const useConfigStore = defineStore(storeId.workspaceConfig, {
  state: () => ({ configInfo: {} }),
  getters: {},
  actions: {
    async fetchConfigInfo() {
      const response = await getConfigInfo();
      this.configInfo = response;
    },
  },
});

export default useConfigStore;
