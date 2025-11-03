import { defineStore } from 'pinia';
import { getSiteFunction } from '../../apis/dept/site.api';
import storeId from '../store.id';

const useConfigStore = defineStore(storeId.deptConfig, {
  state: () => ({ siteFunctions: [] }),
  getters: {
    siteState: (state) => {
      // TODO: magic number
      return (
        state.siteFunctions.find(
          (item) => item.functionName === 'Site-Authorization',
        ).status === 1
      );
    },
    autoState: (state) => {
      // TODO: magic number
      return (
        state.siteFunctions.find((item) => item.functionName === 'Auto-Deploy')
          .status === 1
      );
    },
  },
  actions: {
    async fetchSiteFunction() {
      const response = await getSiteFunction();
      this.siteFunctions = response;
      return response;
    },
  },
});
export default useConfigStore;
