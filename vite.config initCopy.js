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
  } = loadEnv(mode, process.cwd());

  return defineConfig({
    resolve: {
      alias: [
        {
          find: '~/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
        {
          find: '@/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
        {
          find: /^@antv\/g6/,
          replacement: path.resolve(
            __dirname,
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
    ],
    build: {
      sourcemap: true,
    },
    server: {
      hmr: {
        overlay: false,
      },
      proxy: {
        '/cloud-manager': {
          target:
            VITE_CLOUD_MANAGER_URL ||
            'http://org-manager.prod.convcloud.cn:8082',
          changeOrigin: true,
        },
        '/workspace/api': {
          target:
            VITE_WORKSPACE_URL ||
            'http://dev.party-10000.workspace.prod.convcloud.cn:8082',
          changeOrigin: true,
        },
        '^/fate-manager': {
          target:
            VITE_FATE_MANAGER_URL ||
            'http://1.org.dept-manager.beta.fl.convcloud.cn:8082',
          changeOrigin: true,
        },
        '/fate': {
          target: VITE_FATE_URL || 'http://192.168.50.202:9380',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fate/, ''),
        },
        '/auth': {
          target:
            VITE_AUTH_URL || 'http://1.org.auth.beta.fl.convcloud.cn:8082',
          changeOrigin: true,
        },
        '/websocket': {
          target:
            VITE_WEBSOCKET_URL ||
            'ws://dev.9999.fateboard.prod.convcloud.cn:8082',
          changeOrigin: true,
          pathRewrite: {
            '^/websocket': 'websocket',
          },
          ws: true,
        },
        '/log/new': {
          target:
            VITE_WEBSOCKET_URL ||
            'ws://dev.9999.fateboard.prod.convcloud.cn:8082',
          changeOrigin: true,
          ws: true,
        },
        '/fb': {
          target:
            VITE_FATE_BOARD_URL ||
            'http://dev.9999.fateboard.prod.convcloud.cn:8082',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fb/, ''),
        },
      },
    },
  });
};
