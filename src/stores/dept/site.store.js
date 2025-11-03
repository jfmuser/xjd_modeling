import { defineStore } from 'pinia';
// import { getMySite, getOtherSite } from '../../apis/dept/site.api';
import { getAllParties, getSelfParties } from '../../apis/manager/managerApi'
import { useRouter } from 'vue-router';
import storeId from '../store.id';

// function formatTreeData(data = []) {
//   return data.map((item) => {
//     return {
//       __label: item.fateManagerInstitutions,
//       __id: item.fateManagerInstitutions,
//       __type: 'institution',
//       __data: item,
//       children: item.siteList.map((siteItem) => {
//         return {
//           __label: siteItem.siteName,
//           __id: `${item.fateManagerInstitutions}-${siteItem.siteId}`,
//           __type: 'dept',
//           __data: siteItem,
//           __institutions: item.fateManagerInstitutions,
//           __federatedId: item.federatedId,
//         };
//       }),
//     };
//   });
// }


const useSiteStore = defineStore(storeId.site, {
  state: () => ({ mySite: [], otherSite: [] }),
  getters: {
    institutions() {
      return function (id) {
        const result = [...this.mySite, ...this.otherSite].find(
          (item) => item.__id === id,
        );
        return result;
      };
    },
    site() {
      return function (id) {
        const result = [
          ...this.mySite.siteList,
          ...this.otherSite.siteList,
        ].find((item) => item.siteId === id);
        return result;
      };
    },
  },
  actions: {
    async fetchMySite() {
      try {
        const response = await getSelfParties();
        sessionStorage.setItem('selfParties', JSON.stringify(response))
        this.mySite = response;
        return response;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchOtherSite() {
      try {
        const response = await getAllParties();
        this.otherSite = response
        return response;
      } catch (error) {
        console.error(error);
      }
    },
    fetchData() {
      this.fetchMySite();
      this.fetchOtherSite();
    },
  },
});

export default useSiteStore;
