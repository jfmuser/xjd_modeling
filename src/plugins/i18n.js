import { I18N } from '../utils/key';
import dictionary from '../utils/dictionary';
import { inEffectAlgorithmParams, getInEffectLibAndAlgList } from '../apis/workspace/algorithm.api'
import useAlgorithmStore from '@/stores/algorithm.store'

let graphName = {}
let timer = null
async function getGraph() {
  const algorithmStore = useAlgorithmStore()
  if (!localStorage.getItem('token') || localStorage.getItem('token') === 'undefined' || location.href.split('/#/')[1] === 'home') return
  // const { algorithmVersionList } = await getInEffectLibAndAlgList()
  // const algorithmList = await getInEffectLibAndAlgList()
   const algorithmVersionList =  algorithmStore.getAlgorithmAllList
  console.log('算法请求',{algorithmVersionList})
  if (!algorithmVersionList) return
  // const { algorithmVersionList } = algorithmList
  algorithmVersionList.forEach(async (item) => {
    const { tAlgorithmParamVersions } = await inEffectAlgorithmParams(item.name)
    const inputDataDsl = tAlgorithmParamVersions[0].param_dsl.input.data
    const inputModelDsl = tAlgorithmParamVersions[0].param_dsl.input.model
    const outputDataDsl = tAlgorithmParamVersions[0].param_dsl.output.data
    const outputModelDsl = tAlgorithmParamVersions[0].param_dsl.output.model
    inputDataDsl.forEach(dsl => {
      if (!dsl.includes(':')) return
      const name = dsl.split(':')
      graphName[`${name[0]}Input`] = name[1]
    })
    outputDataDsl.forEach(dsl => {
      if (!dsl.includes(':')) return
      const name = dsl.split(':')
      graphName[`${name[0]}Output`] = name[1]
    })
    inputModelDsl.forEach(dsl => {
      if (!dsl.includes(':')) return
      const name = dsl.split(':')
      graphName[`${name[0]}Input`] = name[1]
    })
    outputModelDsl.forEach(dsl => {
      if (!dsl.includes(':')) return
      const name = dsl.split(':')
      graphName[`${name[0]}Output`] = name[1]
    })
  })
  console.log(graphName, 'JJJAAAJJJAAA');
  dictionary.graph = graphName

}

export default {
  install: (app) => {
    timer = setInterval(async () => {
      clearInterval(timer)
      if (localStorage.getItem('token')) {
        await getGraph()
        clearInterval(timer)
      }
    }, 10000)
    app.config.globalProperties.$translate = (key) => {
      return key.split('.').reduce((o, i) => {
        if (o) return o[i];
      }, dictionary);
    };

    app.provide(I18N, dictionary);
  },
};
