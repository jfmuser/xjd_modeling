import { defineStore } from 'pinia';
import storeId from './store.id';
import { getInEffectLibAndAlgList } from '@/apis/workspace/algorithm.api';

const useAlgorithmStore = defineStore(storeId.algorithm, {
  state: () => ({ algorithmList: [] }),
  getters: {
    getAlgorithmAllList: (state) => state.algorithmList,
  },
  actions: {
    async fetchAlgorithmAllList() {
      const {algorithmVersionList} = await getInEffectLibAndAlgList();
      this.algorithmList = algorithmVersionList||[]
    },
  },
});

export default useAlgorithmStore;
