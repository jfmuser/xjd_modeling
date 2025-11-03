import { defineStore } from 'pinia';
import { listComponentI18n, listComponentBatch, listProject } from '@/apis/secretflow/secretflow.api.js'

const useSecretflowStore = defineStore('secretflowInfo', {
    state: () => ({
        i18n: null,
        nodeDetail: null,
        projectList: null,
        dataList: [],
        dataSourceList: [],
        secretflowSuccess:false
    }),
    actions: {
        async getSecretflowI18n() {
            const data = await listComponentI18n()
            console.log(data, 'DATAAAAAAD');

            this.i18n = data.secretflow
        },
        async getNodeDetail(nodeInfo) {
            this.nodeDetail = await listComponentBatch(nodeInfo)
        },
        async getProjectList() {
            const data = await listProject({})
            data.forEach(item => {
                item.id = new Date().getTime()
                item.type = 'secretflow'
            })
            this.projectList = data
        },
        async getDataList(data) {
            this.dataList = data
        },
        async getDataSourceList(data) {
            this.dataSourceList = data
        },
        async setSecretflowSuccess(flag) {
            this.secretflowSuccess = flag
        }
    }
})

export default useSecretflowStore