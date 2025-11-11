import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { createHtmlPlugin } from 'vite-plugin-html';
import { GitRevisionPlugin } from 'git-revision-webpack-plugin';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { fileURLToPath } from 'url';
// import obfuscator from 'rollup-plugin-obfuscator';

const gitRevisionPlugin = new GitRevisionPlugin();

// https://vitejs.dev/config/
export default ({ mode }) => {
  const {
    VITE_WORKSPACE_URL,
    VITE_TITLE,
    VITE_APP_TITLE,
    VITE_THEME,
    VITE_FATE_URL,
    VITE_CLOUD_MANAGER_URL,
    VITE_AUTH_URL,
    VITE_FATE_MANAGER_URL,
    VITE_WEBSOCKET_URL,
    VITE_FATE_BOARD_URL,
    VITE_DEPT_AUDIT,
  } = loadEnv(mode, process.cwd());
  // 替代 __dirname
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return defineConfig({
    resolve: {
      alias: [
        {
          find: '~/',
          replacement: `${path.resolve(dirname, 'src')}/`,
        },
        {
          find: '@/',
          replacement: `${path.resolve(dirname, 'src')}/`,
        },
        {
          find: /^@antv\/g6/,
          replacement: path.resolve(
            dirname,
            './node_modules/@antv/g6/dist/g6.min.js',
          ),
        },
        {
          find: '@antv/x6',
          replacement: '@antv/x6/dist/x6.js',
        },
        {
          find: '@antv/x6-vue-shape',
          replacement: '@antv/x6-vue-shape/lib',
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/${
            VITE_THEME === 'dark' ? 'dark' : 'variables'
          }.scss" as *;`,
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: VITE_TITLE || VITE_APP_TITLE,
            git: {
              version: gitRevisionPlugin.version(),
              branch: gitRevisionPlugin.branch(),
              commitHash: gitRevisionPlugin.commithash(),
            },
          },
        },
      }),
      Icons({
        customCollections: {
          c2: FileSystemIconLoader('./src/assets/icons'),
        },
      }),
      //     obfuscator({
      //         global: false,
      //         // options配置项实际为 javascript-obfuscator 选项，具体可查看https://github.com/javascript-obfuscator/javascript-obfuscator
      //         options: {
      //             compact: true,
      //             controlFlowFlattening: true,
      //             controlFlowFlatteningThreshold: 0.75,
      //             numbersToExpressions: true,
      //             simplify: true,
      //             stringArrayShuffle: true,
      //             splitStrings: true,
      //             splitStringsChunkLength: 10,
      //             rotateUnicodeArray: true,
      //             deadCodeInjection: true,
      //             deadCodeInjectionThreshold: 0.4,
      //             debugProtection: false,
      //             debugProtectionInterval: 2000,
      //             disableConsoleOutput: true,
      //             domainLock: [],
      //             identifierNamesGenerator: "hexadecimal",
      //             identifiersPrefix: "",
      //             inputFileName: "",
      //             log: true,
      //             renameGlobals: true,
      //             reservedNames: [],
      //             reservedStrings: [],
      //             seed: 0,
      //             selfDefending: true,
      //             sourceMap: false,
      //             sourceMapBaseUrl: "",
      //             sourceMapFileName: "",
      //             sourceMapMode: "separate",
      //             stringArray: true,
      //             stringArrayEncoding: ["base64"],
      //             stringArrayThreshold: 0.75,
      //             target: "browser",
      //             transformObjectKeys: true,
      //             unicodeEscapeSequence: true,
      //
      //             domainLockRedirectUrl: "about:blank",
      //             forceTransformStrings: [],
      //             identifierNamesCache: null,
      //             identifiersDictionary: [],
      //             ignoreImports: true,
      //             optionsPreset: "default",
      //             renameProperties: false,
      //             renamePropertiesMode: "safe",
      //             sourceMapSourcesMode: "sources-content",
      //
      //             stringArrayCallsTransform: true,
      //             stringArrayCallsTransformThreshold: 0.5,
      //
      //             stringArrayIndexesType: ["hexadecimal-number"],
      //             stringArrayIndexShift: true,
      //             stringArrayRotate: true,
      //             stringArrayWrappersCount: 1,
      //             stringArrayWrappersChainedCalls: true,
      //             stringArrayWrappersParametersMaxCount: 2,
      //             stringArrayWrappersType: "variable",
      //         }
      //     }),
    ],
    productionSourceMap: false,
    build: {
      minify: true,
      sourcemap: false,
    },
    server: {
      hmr: {
        overlay: false,
      },
      proxy: {
        '/cloud-manager': {
          target:
            // VITE_CLOUD_MANAGER_URL ||
            'http://hz-manager.dev.pcp.convcloud.cn:18082',
          // 'http://192.168.50.127:8080',
          changeOrigin: true,
        },
        '/fate-api/api': {
          target:
            VITE_WORKSPACE_URL ||
            'http://1.hz.innovate-api.test.pcp.convcloud.cn:18082',
          // '192.168.50.150:8082',
          // 'http://192.168.50.122:7060',
          changeOrigin: true,
        },
        '/fate': {
          target:
            VITE_FATE_URL ||
            'http://1.hz.fateboard.test.pcp.convcloud.cn:18082',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fate/, ''),
        },
        '/auth': {
          target:
            // VITE_AUTH_URL ||
            // '192.168.50.150:8083',
            // 'http://1.hz-test.auth-api.test.pcp.convcloud.cn:18082',
            // 'http://1.yl.auth-api.dev.pcp.convcloud.cn:18082',
            'http://119.23.69.219:3071/',
          // 'http://100.112.107.112:8051',
          // 'http://192.168.50.202:8051',
          // 'http://1.org.auth-api.dev.pcp.convcloud.cn:18082',
          // 'http://192.168.50.122:7070',
          changeOrigin: true,
        },
        // 9999/10000
        '/websocket': {
          target:
            VITE_WEBSOCKET_URL ||
            // 'ws://dev.10000.fateboard.prod.convcloud.cn:8082',
            'ws://1.yl.innovate-api.dev.pcp.convcloud.cn:18082',
          // 'ws://192.168.50.202:8053',
          changeOrigin: true,
          pathRewrite: {
            '^/websocket': 'websocket',
          },
          ws: true,
        },
        // 9999/10000
        '/log/new': {
          target:
            VITE_WEBSOCKET_URL ||
            'ws://1.hz.fateboard.test.pcp.convcloud.cn:18082',
          // 'ws://192.168.50.202:8053',
          // 'ws://1.workspace-ui.dev.pcp.convcloud.cn:18082',
          // 'ws://dev.10000.fateboard.prod.convcloud.cn:8082',
          changeOrigin: true,
          ws: true,
        },
        // 9999/10000
        '/fb': {
          target:
            VITE_FATE_BOARD_URL ||
            'http://1.hz.fateboard.test.pcp.convcloud.cn:18082',
          // 'http://192.168.50.202:8053',
          // 'http://dev.10000.fateboard.prod.convcloud.cn:8082',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fb/, ''),
        },
        '/audit': {
          target:
            // VITE_DEPT_AUDIT ||
            // 'http://1.hz.audit-api.test.pcp.convcloud.cn:18082',
            'http://1.yl.audit-api.dev.pcp.convcloud.cn:18082',
          // 'http://100.112.107.112:8051',
          // 'http://192.168.50.202:8051',
          // 'http://192.168.50.202:8053',
          changeOrigin: true,
        },
        '/fateboard': {
          target: 'http://1.fateboard.test.pcp.convcloud.cn:18082',
          // 'http://192.168.50.202:8053',
          changeOrigin: true,
        },
        '/fateboard-ui': {
          target: 'http://1.fateboard.test.pcp.convcloud.cn:18082',
          // 'http://192.168.50.202:8053',
          changeOrigin: true,
        },
        '/yinyu/api/': {
          target: 'http://100.112.107.112:8088',
          changeOrigin: true,
          rewrite: (path) => path.replace('/yinyu/api/', '/api/'),
        },
        '/blockchain': {
          // target: 'http://192.168.50.122:7066',
          // target: 'http://1.hz-test.blockchain-api.test.pcp.convcloud.cn:18082',
          target: 'http://1.yl.blockchain-api.dev.pcp.convcloud.cn:18082',
          // target: 'http://100.112.107.112:7066',
          // target: 'http://192.168.50.202:8051',
          changeOrigin: true,
        },
        '/app': {
          // target: 'http://1.org.app-api.dev.pcp.convcloud.cn:18082',
          // target: 'http://1.hz-test.dept-ui.test.pcp.convcloud.cn:18082',
          target: 'http://1.yl.app-api.dev.pcp.convcloud.cn:18082',
          // target: 'http://100.112.107.112:8051',
          // target: 'http://192.168.50.202:8051',
          // target: 'http://192.168.50.122:7065',
          changeOrigin: true,
        },
        '/js/a': {
          target: 'http://119.23.69.219:3071/',
          changeOrigin: true,
        },
        '/manager-api': {
          // target: 'http://192.168.50.122:7072',
          // target: 'http://1.hz-test.manager-api.test.pcp.convcloud.cn:18082',
          // target: 'http://1.yl.manager-api.dev.pcp.convcloud.cn:18082',
          target: 'http://119.23.69.219:3071/',
          // target: 'http://100.112.107.112:8051',
          // target: 'http://192.168.50.202:8051',
          // target: 'http://1.org.manager-api.dev.pcp.convcloud.cn:18082',
          changeOrigin: true,
        },
        '/secretflow-api/api': {
          // target: 'http://1.yl.secretflow.dev.pcp.convcloud.cn:18082',
          target: 'http://119.23.69.219:3071/',
          // target: 'http://100.112.107.112:8051',
          // target: 'http://192.168.50.202:8051',
          // target: 'http://1.org.secretflow.dev.pcp.convcloud.cn:18082',
          // target: 'http://192.168.50.122:7061',
          // target: 'http://1.hz.secretflow.test.pcp.convcloud.cn:18082',
          changeOrigin: true,
          rewrite: (path) => path.replace('/secretflow-api/', '/xj-secretflow-api/'),
        },
        '/secretflow-api/proxy': {
          // target: 'http://1.yl.secretflow.dev.pcp.convcloud.cn:18082',
          target: 'http://119.23.69.219:3071/',
          // target: 'http://100.112.107.112:8051',
          // target: 'http://192.168.50.202:8051',
          // target: 'http://192.168.50.122:7061',
          // target: 'http://1.org.secretflow.dev.pcp.convcloud.cn:18082',
          // target: 'http://1.hz.secretflow.test.pcp.convcloud.cn:18082',
          changeOrigin: true,
          rewrite: (path) => path.replace('/secretflow-api/', '/xj-secretflow-api/'),
        },
        '/innovate-api/api': {
          // target: 'http://192.168.50.122:7060',
          // target: 'http://1.org.innovate-api.test.pcp.convcloud.cn:18082',
          target: 'http://1.yl.innovate-api.dev.pcp.convcloud.cn:18082',
          // target: 'http://100.112.107.112:8051',
          // target: 'http://192.168.50.202:8051',
          changeOrigin: true,
        },
        '/python-engine': {
          target: 'http://100.112.107.112:9000',
          // target: 'http://192.168.50.202:7000',
          // target: 'http://192.168.50.202:8051',
          // target: 'http://1.org.innovate-api.test.pcp.convcloud.cn:18082',
          // target: 'http://1.yl.innovate-api.dev.pcp.convcloud.cn:18082',
          changeOrigin: true,
        },
        '/tee-client': {
          target: 'http://100.112.107.112:7000',
          // target: 'http://192.168.50.202:7000',
          // target: 'http://192.168.50.202:8051',
          // target: 'http://1.org.innovate-api.test.pcp.convcloud.cn:18082',
          // target: 'http://1.yl.innovate-api.dev.pcp.convcloud.cn:18082',
          changeOrigin: true,
        },
        '/tpm-client': {
          target: 'http://100.112.107.112:9010',
          changeOrigin: true,
        },
      },
    },
  });
};
