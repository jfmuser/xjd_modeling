import { defineStore } from 'pinia';
import {
  getAllCurrentAuthority,
  getAllAuthorityHistory,
} from '@/apis/monitor/authority.api';
import storeId from '../store.id';

const useAuthorityStore = defineStore(storeId.authority, {
  state: () => ({ allCurrentAuthority: [], allAuthorityHistory: [] }),
  getters: {},
  actions: {
    async fetchAllCurrentAuthority() {
      try {
        const response = await getAllCurrentAuthority();
        this.allCurrentAuthority = response;
        return response;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchAllAuthorityHistory() {
      try {
        const response = await getAllAuthorityHistory();
        this.allAuthorityHistory = response;
        return response;
      } catch (error) {
        console.error(error);
      }
    },
  },
});

export default useAuthorityStore;
