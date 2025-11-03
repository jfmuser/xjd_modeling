import { defineStore } from 'pinia';
import { getApprovalHistory } from '../../apis/dept/approval.api';
import { ApprovalStatus } from '../../utils/const';
import storeId from '../store.id';

const useApprovalStore = defineStore(storeId.approval, {
  state: () => ({ todoApprovals: [] }),
  getters: {},
  actions: {
    async fetchTodoApproval() {
      try {
        const response = await getApprovalHistory({});
        const result = response.filter((item) =>
          [ApprovalStatus.TODO, ApprovalStatus.READ_TODO].includes(
            item.message_status,
          ),
        );
        this.todoApprovals = result;
        return result;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  },
});

export default useApprovalStore;
