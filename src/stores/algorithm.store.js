import { defineStore } from 'pinia';
import storeId from './store.id';
import { getInEffectLibAndAlgList ,inEffectAlgorithmParams} from '@/apis/workspace/algorithm.api';

const useAlgorithmStore = defineStore(storeId.algorithm, {
  state: () => ({ algorithmList: [],algorithmParams: {} }),
  getters: {
    getAlgorithmAllList: (state) => state.algorithmList,
    getAlgorithmParams: (state) => state.algorithmParams,
  },
  actions: {
    async fetchAlgorithmAllList(type) {
      const {algorithmVersionList} = await getInEffectLibAndAlgList();
      this.algorithmList = algorithmVersionList.filter(item =>item.platform==type)||[]
      console.log({type,algorithmList:this.algorithmList})
    },
    async fetchAlgorithmParams(type) {
      let algorithms = this.algorithmList.filter(item =>item.platform==type)
      let promise = algorithms.map(async(item) => {
      let {tAlgorithmParamVersions} =  await inEffectAlgorithmParams(item.name);
      return   {name:item.name,tAlgorithmParamVersions,platform:item.platform}
    })
      console.log({promise})
      const res = await Promise.allSettled(promise)
      res.forEach(item => {
        const { value,status} = item
        this.algorithmParams = {...this.algorithmParams,[value.name]:value.tAlgorithmParamVersions}
      })
    },
  },
});

export default useAlgorithmStore;
