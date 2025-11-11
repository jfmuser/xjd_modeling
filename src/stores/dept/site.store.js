import { defineStore } from 'pinia';
// import { getMySite, getOtherSite } from '../../apis/dept/site.api';
import { getAllParties } from '../../apis/dp/api'
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
        // let response = await getSelfParties();
        // if(response === undefined){
        //   response = {
        //     tDomainEngineList: []
        //   };
        // }
        
        // sessionStorage.setItem('selfParties', JSON.stringify(response))
        // this.mySite = response;
        return Promise.resolve();
      } catch (error) {
        console.error(error);
      }
    },
    async fetchOtherSite() {
      try {
        const res = await getAllParties();
        const list = [];
        let mySite = undefined;

        res.list.forEach((item)=>{
          const outterPartyId = JSON.parse(item.outterPartyId);
          const row = {
            id: item.id,
            isSelf: item.ptype === '1' ? 1 : 0,
            name: item.pname,
            tDomainEngineList: [{
              domainId: item.id,
              engine: 1,
              engineInfo: JSON.stringify({ 
                nodeId: outterPartyId.nodeId,
                partyId: item.id
              })
            }]
          };

          if(item.ptype === '1'){
            mySite = row;
          } 

          list.push(row);
        });

        sessionStorage.setItem('selfParties', JSON.stringify(mySite));
        this.mySite = mySite;

        this.otherSite = list;
        return list;
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
