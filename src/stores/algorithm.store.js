import { defineStore } from 'pinia';
import storeId from './store.id';
import {
  getInEffectLibAndAlgList,
  inEffectAlgorithmParams,
  inEffectAlgorithmList,
} from '@/apis/workspace/algorithm.api';

const useAlgorithmStore = defineStore(storeId.algorithm, {
  state: () => ({
    algorithmList: [],
    algorithmParamsList: [],
    algorithmParams: {},
  }),
  getters: {
    getAlgorithmAllList: (state) => state.algorithmList,
    getAlgorithmParams: (state) => (type) => {
      return state.algorithmParams.get(type);
    },
    getAlgorithmParamsList: (state) => state.algorithmParamsList,
  },
  actions: {
    async fetchAlgorithmAllList(type) {
      const { algorithmVersionList } = await getInEffectLibAndAlgList();
      this.algorithmList =
        algorithmVersionList.filter((item) => item.platform == type) || [];
      return this.algorithmList;
    },
    async fetchAlgorithmParams() {
      //   let algorithms = this.algorithmList.filter(item =>item.platform==type)
      //   let promise = algorithms.map(async(item) => {
      //   let {tAlgorithmParamVersions} =  await inEffectAlgorithmParams(item.name);
      //   return   {name:item.name,tAlgorithmParamVersions,platform:item.platform}
      // })
      //   console.log({promise})
      //   const res = await Promise.allSettled(promise)
      //   res.forEach(item => {
      //     const { value,status} = item
      //     this.algorithmParams = {...this.algorithmParams,[value.name]:value.tAlgorithmParamVersions}
      //   })
      const paramsList = await inEffectAlgorithmList();
      this.algorithmParamsList = paramsList;
      let paramsObj = new Map();
      paramsList.forEach((item) => {
        paramsObj.set(item.name, item);
      });
      this.algorithmParams = paramsObj;
    },
  },
});

export default useAlgorithmStore;
