import { defineStore } from 'pinia';
import storageKey from '../utils/storageKey';
import storeId from './store.id';

const key = storageKey('collapse');

const useMenuStore = defineStore(storeId.menu, {
  state: () => ({ collapse: localStorage.getItem(key) === 'true' }),
  actions: {
    toggle() {
      this.collapse = !this.collapse;
      localStorage.setItem(key, this.collapse);
    },
  },
});

export default useMenuStore;
