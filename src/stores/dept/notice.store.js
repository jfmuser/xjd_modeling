import { defineStore } from 'pinia';
import storeId from '../store.id';
import {
  getNoticeApplySite,
  getSiteApplyState,
} from '../../apis/dept/site.api';
import { ApprovalStatus } from '../../utils/const';

const useNoticeStore = defineStore(storeId.notice, {
  state: () => ({ notice: [], applyState: [] }),
  getters: {
    agreeNotice() {
      return this.notice.filter(
        (item) => item.status === ApprovalStatus.AGREED,
      );
    },
    rejectNotice() {
      return this.notice.filter(
        (item) => item.status === ApprovalStatus.REFUSE,
      );
    },
    cancelNotice() {
      return this.notice.filter(
        (item) => item.status === ApprovalStatus.READ_TODO,
      );
    },
  },
  actions: {
    async fetchApplySite() {
      try {
        const response = await getNoticeApplySite();
        this.notice = response;
        return response;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchApplyState() {
      try {
        const response = await getSiteApplyState();
        this.applyState = response;
      } catch (error) {
        console.error(error);
      }
    },
  },
});

export default useNoticeStore;
