import { defineStore } from 'pinia';
import useEnv from '../hooks/useEnv';
import { getCurrentUser as deptGetCurrentUser } from '../apis/dept/auth.api';
import { getCurrentUser as workspaceGetCurrentUser } from '../apis/workspace/auth.api';
import { asyncAuth } from '../apis/dept/auth.api';
import storeId from './store.id';

const useAuthStore = defineStore(storeId.auth, {
  state: () => ({
    loginStatus: false,
    userInfo: null,
    IsUKey:false
  }),
  getters: {
    resetPasswordRequired: () => () =>
      localStorage.getItem('resetPasswordRequired') === 'on',
    isLogin: (state) => {
      return state.loginStatus || !!localStorage.getItem('token');
    },
    loginName: (state) =>
      state.userInfo?.name ||
      state.userInfo?.nickname ||
      state.userInfo?.username ||
      localStorage.getItem('loginName'),
    userId: (state) => state.userInfo.id,
    permissions: (state) => {
      if (!state.userInfo) {
        return [];
      }
      // state.userInfo.menuList.push({ id: '15', path: 'cockpit', name: '统计监控' })
      // state.userInfo.menuList.push({ id: '16', path: 'ApplicationConfigguration', name: '应用配置' })
      return state.userInfo.menuList.map((item) => item.path);
    },
  },
  actions: {
    async setIsLogin(val) {
      this.loginStatus = val;
      if (!val) {
        localStorage.removeItem('token');
      }
    },
    async setIsUKey(val) {
      this.IsUKey = val
    },
    async fetchCurrentUser() {
      let response;
      response = await deptGetCurrentUser();
      this.userInfo = response;
      return response;
    },
    async logout(callback = () => { }) {
      this.userInfo = null;
      this.loginStatus = false;
      localStorage.removeItem('token');
      callback();
    },
    async asyncAuthority() {
      try {
        await asyncAuth();
      } catch (error) {
        console.error(error);
      }
    },
  },
});

export default useAuthStore;
