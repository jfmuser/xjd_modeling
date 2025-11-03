# c2_common_ui

## install dependency

`npm install`

## build

- c2_inter_org_manager_ui `npm run build:org`
- c2_inter_dept_manager_ui `npm run build:dept`
- c2_inter_workspace_manager_ui `npm run build:workspace`

## development

> [环境信息](https://e.gitee.com/xjtu-zp/repos/xjtu-zp/docs-fate/tree/master/%E7%8E%AF%E5%A2%83%E4%BF%A1%E6%81%AF)

| env                           | proxy                                   | script                  |
| ----------------------------- | --------------------------------------- | ----------------------- |
| c2_inter_org_manager_ui       | `VITE_CLOUD_MANAGER_URL`                | `npm run dev:org`       |
| c2_inter_dept_manager_ui      | `VITE_FATE_MANAGER_URL` `VITE_AUTH_URL` | `npm run dev:dept`      |
| c2_inter_workspace_manager_ui | `VITE_WORKSPACE_URL` `VITE_AUTH_URL`    | `npm run dev:workspace` |

## test

`npm run test`

## icon

1. put icons into `src/assets/icons`
2. import icon by `C2Icon.vue`
3. use it in component `<C2Icon name="user" />`

## Switch

- `VITE_APP_SWITCH_NOTIFICATION`: whether open notification

## Backend API docs

- http://dev.dept-1.auth.prod.convcloud.cn:8082/auth/swagger-ui/index.html
