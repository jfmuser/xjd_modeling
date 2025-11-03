import { defineStore } from 'pinia';
import storeId from './store.id';

const useBreadcrumbStore = defineStore(storeId.breadcrumb, {
  state: () => ({ breadcrumbs: [{ fullPath: '/', name: 'home' }] }),
  actions: {
    updateBreadcrumbs(val) {
      if (val?.meta?.breadcrumbDisabled) {
        return;
      }
      const filteredBreadcrumbs = this.breadcrumbs.filter(
        (item) => item.name !== val.name,
      );
      this.breadcrumbs = [...filteredBreadcrumbs, val];
    },
  },
});

export default useBreadcrumbStore;
