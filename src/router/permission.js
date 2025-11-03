import router from './index';
import { ElLoading } from 'element-plus';
import NProgress from 'nprogress';
import useAuthStore from '../stores/auth.store';
import useBreadcrumbStore from '../stores/breadcrumb.store';
import useDeptConfigStore from '../stores/dept/config.store';
import useSiteStore from '../stores/dept/site.store';
import getRouter from './getRouter';
import { routes } from './index';

let timeoutId = null;
router.beforeEach(async (to, from, next) => {
  NProgress.start();
  const authStore = useAuthStore();
  const deptConfigStore = useDeptConfigStore();
  const siteStore = useSiteStore();
  if (localStorage.getItem('token') === 'undefined') {
    localStorage.clear();
    next({ path: '/' });
  }
  const token = localStorage.getItem('token');
  // if (authStore.isLogin) {
  if (token) {
    if (authStore.userInfo === null) {
      try {
        Promise.all([
          await authStore.fetchCurrentUser(),
          await authStore.asyncAuthority(),
          await siteStore.fetchOtherSite(),
          await siteStore.fetchMySite(),
        ]);
        let newRouter = getRouter(authStore.permissions);
        newRouter.forEach((route) => router.addRoute('MainLayout', route));
        routes.forEach((route) => router.addRoute('writeList', route));
        next({ path: `${to.path}` });
      } catch (error) {
        return;
      }
      return;
    }
    next();
  } else {
    if (to.path === '/' || to.path === '/not-allowed' || to.name === '404') {
      next();
    } else {
      next({ path: '/' });
    }
  }
});

router.afterEach((to) => {
  const breadcrumbStore = useBreadcrumbStore();
  breadcrumbStore.updateBreadcrumbs(to);
  NProgress.done();
});
