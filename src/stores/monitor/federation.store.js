import { defineStore } from 'pinia';
import { getInstitutionList, getCloudManager } from '@/apis/monitor/site.api';
import {
  getAuthorityDetails,
  getAuthorityStatus,
  getCurrentAuthority,
} from '@/apis/monitor/authority.api';
import storeId from '../store.id';

const useFederationStore = defineStore(storeId.federation, {
  state: () => ({ data: [], authorityMap: {}, status: {}, authority: {} }),
  getters: {},
  actions: {
    async fetchAuthority({ institutions }) {
      const response = await getAuthorityDetails({ institutions });
      this.authority[institutions] = response;
      return response;
    },
    async fetchAuthorityStatus({ institutions }) {
      const response = await getAuthorityStatus({
        institutions: [institutions],
      });
      this.status[institutions] = response;
    },
    async fetchInstitution(params) {
      try {
        const response = await getInstitutionList({
          pageNum: 1,
          pageSize: 1e9,
          ...params,
        });
        return response.list.map((item) => ({
          __label: item.institutions,
          __type: 'institution',
          __id: item.institutions,
          name: item.institutions,
          children: [],
        }));
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    async fetchData(params = {}) {
      const data = await this.fetchInstitution(params);
      // TODO
      try {
        await Promise.all(
          data.map((item) =>
            this.fetchAuthorityStatus({
              institutions: item.name,
            }),
          ),
        );

        await Promise.all(
          data.map((item) =>
            this.fetchAuthority({
              institutions: item.name,
            }),
          ),
        );
      } catch (error) {
        console.error(error);
      }

      const promises = data.map((item) => {
        const param = {
          institutions: item.name,
          pageNum: 1,
          pageSize: 1e9,
        };
        if (params.condition) {
          param.condition = params.condition;
        }
        return getCloudManager(param);
      });
      const results = await Promise.all(promises);
      data.forEach((item, index) => {
        item.children = results[index].list.map((item) => ({
          ...item,
          __label: item.siteName,
          __type: 'site',
          __id: `${item.institutions}-${item.id}`,
        }));
      });

      this.data = data;
    },
    async fetchCurrentAuthority(institutions) {
      const result = await getCurrentAuthority({
        institutions,
      });
      this.authorityMap[institutions] = result;
    },
  },
});

export default useFederationStore;
