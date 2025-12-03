import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'element-plus/theme-chalk/src/index.scss';
import './router/permission';
import './styles/common.scss';
// import C2Icon from './components/C2Icon.js';
import C2Copy from './components/C2Copy.js';
import C2Upload from './components/C2Upload.js';
import C2ButtonGroup from './components/C2ButtonGroup.js';
import C2Transition from './components/C2Transition.js';
import ElementIcon from './components/ElementIcon.js';
import { createPinia } from 'pinia';
import createDirective from './directives';
import i18nPlugin from './plugins/i18n';
import JSEncrypt from './plugins/jsencrypt';
import globalStorage from './plugins/indexedDBStorage';
// 适配
import 'amfe-flexible';
import 'amfe-flexible/index.js';
// import iconPark from './plugins/icon-park.js';
// import '@icon-park/vue-next/styles/index.css';

const app = createApp(App);

// window.console = (function () {
//     var c = {};
//     c.log =
//         c.warn =
//         c.debug =
//         c.info =
//         c.error =
//         c.time =
//         c.dir =
//         c.profile =
//         c.clear =
//         c.exception =
//         c.trace =
//         c.assert =
//         function () { };
//     return c;
// })();
createDirective(app);
// iconPark(app)
app.use(i18nPlugin);
app.use(JSEncrypt);
app.config.globalProperties.$indexedDB = globalStorage;
// app.use(C2Icon);
app.use(C2Upload);
app.use(C2Copy);
app.use(C2ButtonGroup);
app.use(ElementIcon);
app.use(C2Transition);
app.use(router);
app.use(createPinia());
app.mount('#app');
