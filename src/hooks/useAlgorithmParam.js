import _ from 'lodash';
import { ElLoading, ElMessage } from 'element-plus';
import { onMounted, ref, toRaw } from 'vue';
import {
  getOtherDataNamespaceList,
  getSelfDataNamespaceList,
  getTableNames,
} from '../apis/workspace/data.api';
import {
  inEffectAlgorithmList,
  inEffectAlgorithmParams,
} from '../apis/workspace/algorithm.api';
import useSiteStore from '@/stores/dept/site.store';
import { getSecretflowProject } from '@/apis/secretflow/secretflow.api';
import { dpProjectTasks05Save } from '@/apis/dp/api';
import {
  checkConstraints,
  formatParamList,
  setDefaultVital,
  formatSubParams,
  formattedFormResult,
  getDefaultValueByKeyPath,
  getOptionParamList,
  getDefaultVitalParamList,
  setDefaultValue,
  setParamConfigChecked,
  setReaderOptions,
  setParamConfig,
  findDefaultValueParam,
  compare,
  resetParam,
  resetParams,
  findConstraint,
  formatJsonValue,
} from '../views/workspace/project/algorithmUtil';
import {
  createProject,
  updateProject,
  getAlgorithmParams,
} from '../apis/workspace/project.api';
import useGraph from '../hooks/useGraph';
import { getAuthData } from '../apis/manager/managerApi';
import { getSelectAlgorithmParams } from '../apis/manager/managerApi';
import * as Base64 from 'js-base64';
import useAlgorithmStore from '@/stores/algorithm.store';

export default function useAlgorithmParam() {
  // 项目信息
  const projectInfo = ref({});
  // 重要参数
  const vitalParamList = ref([]);
  // 克隆三份用以分类显示
  const commonVitalParamList = ref([]);
  const hostVitalParamList = ref([]);
  const guestVitalParamList = ref([]);
  const arbiterVitalParamList = ref([]);

  const hostVitalParamListObj = ref({});
  // 来观看全部参数是否有改变
  const changeHostVitelParamList = ref(true);
  const algorithmStore = useAlgorithmStore();
  const changeValues = ref([]);
  const staticParams = ref([]);
  //全部参数
  const optionParamList = ref([]);
  const paramVersionList = ref([]);
  // const staticParamVersionList = ref([]);
  // 默认重要参数
  const defaultVitalParamList = ref([]);
  const canSelect = ref(false);
  const selected = ref(false);
  const constraintList = ref([]);
  const projectAlgorithmParams = ref([]);
  const algorithmList = ref([]);
  const paramVersion = ref({});

  // 项目已有的授权数据
  const authProjectList = ref([]);
  const allTableList = ref([]);
  // 定义el-tree Props
  const optionParam = {
    label: 'label_en',
    children: 'subParams',
  };

  onMounted(() => {
    projectInfo.value = JSON.parse(localStorage.getItem('projectInfo'));
  });

  // 获取生效中得算法列表
  // async function getInEffectAlgorithmList() {
  //   algorithmList.value = await inEffectAlgorithmList();
  //   console.log(algorithmList.value, 999);
  // }

  // 获取当前项目的算法参数
  async function getProjectAlgorithmParams(projectId) {
    projectAlgorithmParams.value = await getSelectAlgorithmParams(projectId);
  }

  // 想要做事情必须走这里  这里是做约束的唯一途径
  // 获取指定算法的参数
  async function getInEffectAlgorithmParams(operatorType, hostList, projectId) {
    const componentName = operatorType;
    operatorType = operatorType.slice(0, -2);
    console.log('operatorType>>>>', operatorType);
    let currentVersionParams = [];
    let hostCurrentVersionParams = [];
    let hostCurrentVersionParamsObj = {};
    let guestCurrentVersionParams = [];
    let commonCurrentVersionParams = [];
    let arbiterCurrentVersionParams = [];
    // 读取缓存的项目算法参数
    // console.log(localStorage.getItem('projectParams'));
    const projectParams = JSON.parse(localStorage.getItem('projectParams'));
    const hostProjectParams = JSON.parse(
      localStorage.getItem('hostProjectParams'),
    );
    const hostProjectParamsObj = JSON.parse(
      localStorage.getItem('hostProjectParamsObj'),
    );
    const guestProjectParams = JSON.parse(
      localStorage.getItem('guestProjectParams'),
    );
    const commonProjectParams = JSON.parse(
      localStorage.getItem('commonProjectParams'),
    );
    const arbiterProjectParams = JSON.parse(
      localStorage.getItem('arbiterProjectParams'),
    );
    console.log('projectParams>>>>', JSON.parse(JSON.stringify(projectParams)));

    // 获取当前算法的默认参数
    // const response = await inEffectAlgorithmParams(operatorType);
    const getAlgorithmParams = algorithmStore.getAlgorithmParams;

    paramVersionList.value =
      getAlgorithmParams(operatorType).tAlgorithmParamVersions || []; //response.tAlgorithmParamVersions;
    console.log(
      'paramVersionList1::',
      JSON.parse(JSON.stringify(paramVersionList.value)),
    );

    let exist = false;
    // 判断项目参数中是否存在当前算法的参数配置
    if (projectParams && projectParams[componentName]) {
      const currentOperatorParams = projectParams[componentName];
      if (currentOperatorParams) {
        currentVersionParams = currentOperatorParams;
        const projectParamsVersion = sessionStorage.getItem(
          'projectParamsVersion',
        );
        paramVersion.value.id = projectParamsVersion
          ? JSON.parse(projectParamsVersion)[componentName]
          : null;
        exist = true;
      }
    }
    if (hostProjectParams && hostProjectParams[componentName]) {
      const hostCurrentOperatorParams = hostProjectParams[componentName];
      if (hostCurrentOperatorParams) {
        hostCurrentVersionParams = hostCurrentOperatorParams;
        exist = true;
      }
    }
    if (hostProjectParamsObj && hostProjectParamsObj[componentName]) {
      const hostCurrentOperatorParams = hostProjectParamsObj[componentName];
      if (hostCurrentOperatorParams) {
        hostCurrentVersionParamsObj = hostCurrentOperatorParams;
        exist = true;
      }
    }
    if (guestProjectParams && guestProjectParams[componentName]) {
      const guestCurrentOperatorParams = guestProjectParams[componentName];
      if (guestCurrentOperatorParams) {
        guestCurrentVersionParams = guestCurrentOperatorParams;
        exist = true;
      }
    }
    if (commonProjectParams && commonProjectParams[componentName]) {
      const commonCurrentOperatorParams = commonProjectParams[componentName];
      if (commonCurrentOperatorParams) {
        commonCurrentVersionParams = commonCurrentOperatorParams;
        exist = true;
      }
    }
    if (arbiterProjectParams && arbiterProjectParams[componentName]) {
      const arbiterCurrentOperatorParams = arbiterProjectParams[componentName];
      if (arbiterCurrentOperatorParams) {
        arbiterCurrentVersionParams = arbiterCurrentOperatorParams;
        exist = true;
      }
    }
    // 约束规则
    console.log(
      JSON.parse(JSON.stringify(paramVersionList.value)),
      paramVersionList.value,
      'paramVersionList.value',
    );
    const tempData = JSON.parse(JSON.stringify(paramVersionList.value));
    // paramVersion.value = JSON.parse(JSON.stringify(tempData[0]));
    console.log(tempData, paramVersion.value.id, 'paramVersion.value.id');
    paramVersion.value = paramVersion.value.id
      ? JSON.parse(
          JSON.stringify(
            tempData.find(
              (item) => item.param_version === paramVersion.value.id,
            ),
          ),
        )
      : JSON.parse(JSON.stringify(tempData[0]));
    console.log('paramVersion.value', paramVersion.value);
    console.log('exist>>111', exist);
    if (
      paramVersion.value.constraintList &&
      paramVersion.value.constraintList !== '[]'
    ) {
      console.log('===========');
      constraintList.value = JSON.parse(paramVersion.value.constraintList);
    }
    if (!exist) {
      // 算法参数版本唯一
      // if (paramVersionList.value.length === 1) {
      // canSelect.value = false;
      selected.value = true;
      paramVersion.value = paramVersionList.value[0];
      console.log(
        'paramVersion>>::',
        JSON.parse(JSON.stringify(paramVersion.value)),
      );
      currentVersionParams = paramVersion.value.param_list;
      console.log(currentVersionParams, 'currentVersionParams');
      // 进行数据分组
      const currentVersionParamsList = [
        hostCurrentVersionParams,
        guestCurrentVersionParams,
        commonCurrentVersionParams,
        arbiterCurrentVersionParams,
      ];
      const roleTypeList = ['host', 'guest', 'common', 'arbiter'];
      for (let i = 0; i < currentVersionParams.length; i++) {
        if (
          currentVersionParams[i].inputStyle === 'level' &&
          currentVersionParams[i].subParams.length > 0
        ) {
          roleTypeList.forEach((roleType, idx) => {
            const cloneCurrentVersionParams = _.cloneDeep(
              currentVersionParams[i],
            );
            // currentVersionParams[i].subParams.forEach((item, index) => {
            for (
              let j = 0;
              j < cloneCurrentVersionParams.subParams.length;
              j++
            ) {
              if (
                cloneCurrentVersionParams.subParams[j].roleType.includes(
                  roleType,
                )
              ) {
                console.log(
                  cloneCurrentVersionParams.subParams[j].key,
                  currentVersionParamsList[idx],
                  roleType,
                  'cloneCurrentVersionParams.subParams[j]',
                );
                if (
                  JSON.stringify(currentVersionParamsList[idx]).includes(
                    cloneCurrentVersionParams.subParams[j].key,
                  )
                )
                  continue;
                cloneCurrentVersionParams.subParams[j] = _.cloneDeep(
                  cloneCurrentVersionParams.subParams[j],
                );
                currentVersionParamsList[idx].push(cloneCurrentVersionParams);
              } else {
                cloneCurrentVersionParams.subParams.splice(j, 1);
                j--;
              }
            }
            // })
          });
        } else {
          roleTypeList.forEach((roleType, idx) => {
            if (currentVersionParams[i].roleType.includes(roleType)) {
              currentVersionParamsList[idx].push(
                _.cloneDeep(currentVersionParams[i]),
              );
            }
          });
        }
      }

      if (projectInfo.value.id) {
        await getProjectAlgorithmParams(projectInfo.value.id);
      }
    }
    // if (operatorType.includes('reader')) {
    //   currentVersionParams = await setOptions(currentVersionParams);
    // }
    if (!exist) {
      console.log({ hostList });
      // 这块是在根据添加项目时有几个host方来克隆几个host数据
      hostList.forEach((item, i) => {
        hostCurrentVersionParamsObj[`hostVitalParamList${i}`] = _.cloneDeep([
          ...hostCurrentVersionParams,
        ]);
      });
    }
    if (operatorType.includes('reader')) {
      hostCurrentVersionParams = await setOptions(
        hostCurrentVersionParams,
        projectId,
      );
      hostList.forEach(async (item, i) => {
        hostCurrentVersionParamsObj[
          `hostVitalParamList${i}`
        ][0].subParams[0].options =
          hostCurrentVersionParams?.[0]?.subParams[0]?.options;
      });
    }
    if (operatorType.includes('reader')) {
      guestCurrentVersionParams = await setOptions(
        guestCurrentVersionParams,
        projectId,
      );
    }
    // 初始校验约束规则
    vitalParamList.value = await checkConstraints(
      currentVersionParams,
      constraintList.value,
    );
    // commonVitalParamList.value = JSON.parse(JSON.stringify(commonCurrentVersionParams))
    commonVitalParamList.value = await checkConstraints(
      commonCurrentVersionParams,
      constraintList.value,
    );
    console.log(
      JSON.parse(JSON.stringify(commonVitalParamList.value)),
      'commonFormattedForm',
    );
    hostVitalParamList.value = await checkConstraints(
      hostCurrentVersionParams,
      constraintList.value,
    );
    guestVitalParamList.value = await checkConstraints(
      guestCurrentVersionParams,
      constraintList.value,
    );
    console.log(
      JSON.parse(JSON.stringify(guestCurrentVersionParams)),
      '这是guestVitalParamList.value',
    );
    arbiterVitalParamList.value = await checkConstraints(
      arbiterCurrentVersionParams,
      constraintList.value,
    );
    // 设置默认的重要参数标志
    vitalParamList.value = setDefaultVital(vitalParamList.value, exist);
    commonVitalParamList.value = setDefaultVital(
      commonVitalParamList.value,
      exist,
    );
    // console.log(JSON.parse(JSON.stringify(commonVitalParamList.value)), 'commonFormattedForm');
    hostVitalParamList.value = setDefaultVital(hostVitalParamList.value, exist);
    guestVitalParamList.value = setDefaultVital(
      guestVitalParamList.value,
      exist,
    );
    arbiterVitalParamList.value = setDefaultVital(
      arbiterVitalParamList.value,
      exist,
    );
    // 备份参数列表
    staticParams.value = JSON.parse(JSON.stringify(vitalParamList.value));
    // 格式化参数列表（下拉选项组装等）
    vitalParamList.value = await formatParamList(vitalParamList.value);
    commonVitalParamList.value = await formatParamList(
      commonVitalParamList.value,
    );
    hostVitalParamList.value = await formatParamList(hostVitalParamList.value);
    guestVitalParamList.value = await formatParamList(
      guestVitalParamList.value,
    );
    arbiterVitalParamList.value = await formatParamList(
      arbiterVitalParamList.value,
    );
    hostList.forEach(async (host, i) => {
      hostVitalParamListObj.value[`hostVitalParamList${i}`] =
        await checkConstraints(
          hostCurrentVersionParamsObj[`hostVitalParamList${i}`],
          constraintList.value,
        );
      hostVitalParamListObj.value[`hostVitalParamList${i}`] = setDefaultVital(
        hostVitalParamListObj.value[`hostVitalParamList${i}`],
        exist,
      );
      hostVitalParamListObj.value[`hostVitalParamList${i}`] =
        await formatParamList(
          hostVitalParamListObj.value[`hostVitalParamList${i}`],
        );
    });
    // 全部参数
    optionParamList.value = await getOptionParamList(
      JSON.parse(JSON.stringify(vitalParamList.value)),
      [],
    );
    // 默认选中参数
    defaultVitalParamList.value = await getDefaultVitalParamList(
      optionParamList.value,
      [],
    );
    console.log(
      'paramVersionList2::',
      JSON.parse(JSON.stringify(paramVersionList.value)),
    );
  }

  async function selectParamVersion(id, operatorType, operatorLabel, hostList) {
    console.log('selectParamVersion>>', id);
    console.log(
      'paramVersionList1>>',
      JSON.parse(JSON.stringify(paramVersionList.value)),
    );
    paramVersion.value = paramVersionList.value.find(
      (item) => item.param_version === id,
    );
    console.log(
      'paramVersion>>',
      JSON.parse(JSON.stringify(paramVersion.value)),
    );
    if (sessionStorage.getItem('projectParamsVersion')) {
      const projectParamsVersion = JSON.parse(
        sessionStorage.getItem('projectParamsVersion'),
      );
      projectParamsVersion[operatorLabel] = id;
      sessionStorage.setItem(
        'projectParamsVersion',
        JSON.stringify(projectParamsVersion),
      );
    } else {
      const projectParamsVersion = {};
      projectParamsVersion[operatorLabel] = id;
      sessionStorage.setItem(
        'projectParamsVersion',
        JSON.stringify(projectParamsVersion),
      );
    }

    // console.log(JSON.parse(localStorage.getItem('projectParams'))[operatorLabel]);
    let hostCurrentVersionParams = [];
    let hostCurrentVersionParamsObj = {};
    let guestCurrentVersionParams = [];
    let commonCurrentVersionParams = [];
    let arbiterCurrentVersionParams = [];

    // constraintList.value = JSON.parse(paramVersion.value.constraintList);
    let currentVersionParams = paramVersion.value.param_list;
    if (operatorType.includes('reader')) {
      hostCurrentVersionParams = await setOptions(
        hostCurrentVersionParams,
        projectId,
      );
      hostList.forEach(async (item, i) => {
        hostCurrentVersionParamsObj[
          `hostVitalParamList${i}`
        ][0].subParams[0].options =
          hostCurrentVersionParams[0].subParams[0].options;
      });
    }
    if (operatorType.includes('reader')) {
      guestCurrentVersionParams = await setOptions(
        guestCurrentVersionParams,
        projectId,
      );
    }
    // 进行数据分组
    const currentVersionParamsList = [
      hostCurrentVersionParams,
      guestCurrentVersionParams,
      commonCurrentVersionParams,
      arbiterCurrentVersionParams,
    ];
    const roleTypeList = ['host', 'guest', 'common', 'arbiter'];
    for (let i = 0; i < currentVersionParams.length; i++) {
      if (
        currentVersionParams[i].inputStyle === 'level' &&
        currentVersionParams[i].subParams.length > 0
      ) {
        roleTypeList.forEach((roleType, idx) => {
          const cloneCurrentVersionParams = _.cloneDeep(
            currentVersionParams[i],
          );
          for (let j = 0; j < cloneCurrentVersionParams.subParams.length; j++) {
            if (
              cloneCurrentVersionParams.subParams[j].roleType.includes(roleType)
            ) {
              if (
                JSON.stringify(currentVersionParamsList[idx]).includes(
                  cloneCurrentVersionParams.subParams[j].key,
                )
              )
                continue;
              cloneCurrentVersionParams.subParams[j] = _.cloneDeep(
                cloneCurrentVersionParams.subParams[j],
              );
              currentVersionParamsList[idx].push(cloneCurrentVersionParams);
            } else {
              cloneCurrentVersionParams.subParams.splice(j, 1);
              j--;
            }
          }
        });
      } else {
        roleTypeList.forEach((roleType, idx) => {
          if (currentVersionParams[i].roleType.includes(roleType)) {
            currentVersionParamsList[idx].push(
              _.cloneDeep(currentVersionParams[i]),
            );
          }
        });
      }
    }

    hostList.forEach((item, i) => {
      hostCurrentVersionParamsObj[`hostVitalParamList${i}`] = _.cloneDeep([
        ...hostCurrentVersionParams,
      ]);
    });

    // 初始校验约束规则
    vitalParamList.value = await checkConstraints(
      currentVersionParams,
      constraintList.value,
    );
    // 初始校验约束规则
    commonVitalParamList.value = await checkConstraints(
      commonCurrentVersionParams,
      constraintList.value,
    );
    hostVitalParamList.value = await checkConstraints(
      hostCurrentVersionParams,
      constraintList.value,
    );
    guestVitalParamList.value = await checkConstraints(
      guestCurrentVersionParams,
      constraintList.value,
    );
    arbiterVitalParamList.value = await checkConstraints(
      arbiterCurrentVersionParams,
      constraintList.value,
    );

    // 设置默认的重要参数标志
    vitalParamList.value = setDefaultVital(vitalParamList.value, false);
    commonVitalParamList.value = setDefaultVital(
      commonVitalParamList.value,
      false,
    );
    hostVitalParamList.value = setDefaultVital(hostVitalParamList.value, false);
    guestVitalParamList.value = setDefaultVital(
      guestVitalParamList.value,
      false,
    );
    arbiterVitalParamList.value = setDefaultVital(
      arbiterVitalParamList.value,
      false,
    );
    // 备份参数列表
    staticParams.value = JSON.parse(JSON.stringify(vitalParamList.value));
    // 格式化参数列表（下拉选项组装等）
    vitalParamList.value = await formatParamList(vitalParamList.value);
    commonVitalParamList.value = await formatParamList(
      commonVitalParamList.value,
    );
    hostVitalParamList.value = await formatParamList(hostVitalParamList.value);
    guestVitalParamList.value = await formatParamList(
      guestVitalParamList.value,
    );
    arbiterVitalParamList.value = await formatParamList(
      arbiterVitalParamList.value,
    );

    hostList?.forEach(async (host, i) => {
      hostVitalParamListObj.value[`hostVitalParamList${i}`] =
        await checkConstraints(
          hostCurrentVersionParamsObj[`hostVitalParamList${i}`],
          constraintList.value,
        );
      hostVitalParamListObj.value[`hostVitalParamList${i}`] = setDefaultVital(
        hostVitalParamListObj.value[`hostVitalParamList${i}`],
        true,
      );
      hostVitalParamListObj.value[`hostVitalParamList${i}`] =
        await formatParamList(
          hostVitalParamListObj.value[`hostVitalParamList${i}`],
        );
    });

    // 全部参数
    optionParamList.value = await getOptionParamList(
      JSON.parse(JSON.stringify(vitalParamList.value)),
      [],
    );
    // 默认选中参数
    defaultVitalParamList.value = await getDefaultVitalParamList(
      optionParamList.value,
      [],
    );
    console.log(
      'paramVersionList2>>',
      JSON.parse(JSON.stringify(paramVersionList.value)),
    );
  }

  // 设置reader的namespace和name下拉选项，后端接口获取
  async function setOptions(currentVersionParams, projectId) {
    console.log({ currentVersionParams, projectId });
    const siteStore = useSiteStore();
    // if (type === 'guest') {
    // const selfNamespaceOptions = await getSelfDataNamespaceList();
    //   currentVersionParams = setReaderOptions(
    //     currentVersionParams,
    //     selfNamespaceOptions,
    //     'namespace',
    //     'guest',
    //   );
    // const Namespace = getDefaultValueByKeyPath(
    //   currentVersionParams,
    //   'table.namespace'
    // );
    //   if (Namespace) {
    //     const selfTableNameOptions = await getTableNames(Namespace, 'self');
    //     currentVersionParams = setReaderOptions(
    //       currentVersionParams,
    //       selfTableNameOptions,
    //       'name',
    //       'guest',
    //     );
    //   }

    // } else {
    //   const otherNamespaceOptions = await getOtherDataNamespaceList();
    //   currentVersionParams = setReaderOptions(
    //     currentVersionParams,
    //     otherNamespaceOptions,
    //     'namespace',
    //     'host',
    //   );
    //   const Namespace = getDefaultValueByKeyPath(
    //     currentVersionParams,
    //     'table.namespace'
    //   );
    //   if (Namespace) {
    //     const otherTableNameOptions = await getTableNames(Namespace, 'other');
    //     currentVersionParams = setReaderOptions(
    //       currentVersionParams,
    //       otherTableNameOptions,
    //       'name',
    //       'host',
    //     );
    //   }
    // }

    const info = _.cloneDeep(JSON.parse(localStorage.getItem('projectInfo')));
    console.log({ authProjectList, info });
    let namespaceOptions = [];
    allTableList.value = [];
    const res = await getSecretflowProject({ projectId: info.secretflowPrjId });
    console.log({ res });
    res?.nodes?.forEach((item) => {
      item?.datatables?.forEach((it) => {
        namespaceOptions.push({
          label: `namespace_${it.datatableId}`,
          value: `namespace_${it.datatableId}`,
        });
        allTableList.value.push({
          label: it.datatableName,
          value: it.datatableName,
          dataFromId: siteStore.getByNodeId(item.nodeId).id,
          namespace: `namespace_${it.datatableId}`,
        });
      });
    });
    console.log({ namespaceOptions });
    authProjectList.value = res.nodes;
    // authProjectList.value = await getAuthData(projectId);

    // authProjectList.value.forEach((item) => {
    //   if (!namespaceOptions.some((data) => data.label === item.namespace)) {
    //     namespaceOptions.push({
    //       label: item.namespace,
    //       value: item.namespace,
    //     });
    //   }
    // });

    currentVersionParams = setReaderOptions(
      currentVersionParams,
      namespaceOptions,
      'namespace',
    );
    const Namespace = getDefaultValueByKeyPath(
      currentVersionParams,
      'table.namespace',
    );
    return currentVersionParams;
  }

  // 这个方法用于changeParams,当用户输入数据的时候做更新
  function updateParams(ParamList, keyPath, value, roleType) {
    ParamList = resetParams(ParamList, changeValues.value, roleType);
    if (constraintList.value.length > 0) {
      ParamList = checkConstraints(ParamList, constraintList.value);
      ParamList = resetParam(ParamList, keyPath, value);
    }
    return ParamList;
  }

  async function changeParams(vars, type, hostVitalParamListObj, i) {
    console.log(vars, 'vars', { type, hostVitalParamListObj });
    console.log(constraintList.value, 'constraintList');
    const keyPath = vars.keyPath;
    const operatorName = vars.operatorName;
    const value = vars.value;
    if (keyPath) {
      console.log(changeValues.value, 'changeValues.value');
      const val = changeValues.value.find((item) => item.key === keyPath);

      if (changeValues.value.length > 0 && val) {
        for (let i = 0; i < changeValues.value.length; i++) {
          if (changeValues.value[i] === val) {
            changeValues.value.splice(i, 1);
            break;
          }
        }
      }
      changeValues.value.push({
        keyPath: keyPath,
        value: value,
        roleType: type,
      });
    }
    if (keyPath.endsWith('namespace') && operatorName.includes('reader')) {
      let roleType = '';
      let tableNameOptions = [];
      // if (type === 'host') {
      //   roleType = 'host';
      //   tableNameOptions = await getTableNames(value, 'other');
      // } else if (type === 'guest') {
      //   roleType = 'guest';
      //   tableNameOptions = await getTableNames(value, 'self');
      // }
      // await getAuthData()
      // console.log(value, '这是render');
      // authProjectList.value.forEach((data) => {
      //   if (data.namespace === value) {
      //     tableNameOptions.push({
      //       label: data.name,
      //       value: data.name,
      //       dataFromId: data.dataFromId,
      //     });
      //   }
      // });

      tableNameOptions = allTableList.value.filter((item) => {
        return item.namespace == value;
      });
      console.log({ tableNameOptions });
      if (type.includes('host')) {
        const hostTableNameOptions = tableNameOptions.filter(
          (tableName) =>
            tableName.dataFromId !==
            JSON.parse(sessionStorage.getItem('selfParties')).id,
        );
        hostVitalParamListObj[`hostVitalParamList${i}`] = setReaderOptions(
          hostVitalParamListObj[`hostVitalParamList${i}`],
          hostTableNameOptions,
          'name',
          roleType,
        );
        console.log({ hostTableNameOptions, hostVitalParamListObj });

        // hostVitalParamList.value = setReaderOptions(
        //   hostVitalParamList.value,
        //   tableNameOptions,
        //   'name',
        //   roleType,
        // );
      } else if (type.includes('guest')) {
        const guestTableNameOptions = tableNameOptions.filter(
          (tableName) =>
            tableName.dataFromId ===
            JSON.parse(sessionStorage.getItem('selfParties')).id,
        );
        guestVitalParamList.value = setReaderOptions(
          guestVitalParamList.value,
          guestTableNameOptions,
          'name',
          roleType,
        );
        console.log(guestVitalParamList.value, 'guestVitalParamList.value');
      }
    }
    let vitalParamChangeList = [
      vitalParamList.value,
      hostVitalParamList.value,
      commonVitalParamList.value,
      guestVitalParamList.value,
      arbiterVitalParamList.value,
    ];
    if (type === 'host') {
      hostVitalParamList.value = updateParams(
        hostVitalParamList.value,
        keyPath,
        value,
        'host',
      );
    } else if (type === 'guest') {
      guestVitalParamList.value = updateParams(
        guestVitalParamList.value,
        keyPath,
        value,
        'guest',
      );
    } else if (type === 'common') {
      commonVitalParamList.value = updateParams(
        commonVitalParamList.value,
        keyPath,
        value,
        'common',
      );
    } else if (type === 'arbiter') {
      arbiterVitalParamList.value = updateParams(
        arbiterVitalParamList.value,
        keyPath,
        value,
        'arbiter',
      );
    }
    const constraint = findConstraint(constraintList.value, keyPath, value);
    for (let i = 0; i <= 4; i++) {
      if (!constraint) {
        vitalParamChangeList[i] = formatParamList(vitalParamChangeList[i]);
        if (i === 4) return;
      }
    }
    const controller = constraint.controller_param_list;
    const influenced = constraint.influenced_param_list;
    for (let i = 0; i <= 4; i++) {
      if (controller.length <= 0) {
        vitalParamChangeList[i] = formatParamList(vitalParamChangeList[i]);
        if (i === 4) return;
      }
    }
    let count = 0;
    controller.forEach((controllerParam) => {
      // 判断当前参数在控制参数列表中的条件
      if (
        keyPath === controllerParam.param_key &&
        compare(
          value,
          controllerParam.operator,
          controllerParam.param_value.toString(),
        )
      ) {
        count = count + 1;
      } else {
        // 判断非当前参数在控制参数列表中的条件
        const currKeyPath = controllerParam.param_key;
        const defaultValue = findDefaultValueParam(
          vitalParamList.value,
          currKeyPath,
        ).defaultValue;
        if (
          compare(
            defaultValue,
            controllerParam.operator,
            controllerParam.param_value.toString(),
          )
        ) {
          count = count + 1;
        }
      }
    });
    // 控制参数列表是否全部满足条件
    if (controller.length === count) {
      // 设置影响参数的状态及默认值
      influenced.forEach((influencedParam) => {
        vitalParamList.value = setParamConfig(
          vitalParamList.value,
          influencedParam,
        );
      });
    }
    for (let i = 0; i <= 4; i++) {
      vitalParamChangeList[i] = formatParamList(vitalParamChangeList[i]);
    }
    // 这个是重新获取一遍可选参数的列表，但是目前会出现bug，因为默认勾选的列表没更新，跟约束有关
    // optionParamList.value = getOptionParamList(
    //   JSON.parse(JSON.stringify(vitalParamList.value)),
    //   [],
    // );
  }

  // 可选参数选择
  function handleCheckChange(data, checked, indeterminate) {
    let vitalParamChangeList = [
      vitalParamList.value,
      hostVitalParamList.value,
      commonVitalParamList.value,
      guestVitalParamList.value,
      arbiterVitalParamList.value,
    ];
    for (let i = 0; i <= 4; i++) {
      if (!indeterminate) {
        vitalParamChangeList[i] = setParamConfigChecked(
          vitalParamChangeList[i],
          data.key,
          checked,
        );
        vitalParamChangeList[i] = checkConstraints(
          vitalParamChangeList[i],
          constraintList.value,
        );
      }
    }
  }
  // 保存
  async function onSaveNode(operator, callback, hostVitalParamListObj) {
    console.log('onSaveNode>>>78787878', operator);
    console.log('callback=>>', callback);
    // const operatorType = operator.component_name + operator.label.slice(-2);
    const operatorType = operator.label;
    console.log(operatorType);
    const dom = Array.from(
      document.querySelectorAll('.graph-area .graph-node-wrapper'),
    ).find((dom) => dom.innerText === operator.name_zh);
    dom.style.borderBottom = '6px solid #2a50ec';
    console.log('vitalParamList.value', vitalParamList.value);
    vitalParamList.value = formatJsonValue(vitalParamList.value);
    hostVitalParamList.value = formatJsonValue(hostVitalParamList.value);
    guestVitalParamList.value = formatJsonValue(guestVitalParamList.value);
    commonVitalParamList.value = formatJsonValue(commonVitalParamList.value);
    arbiterVitalParamList.value = formatJsonValue(arbiterVitalParamList.value);
    console.log(hostVitalParamListObj, 'VALUELUE');

    const params = {
      [operatorType]: JSON.parse(JSON.stringify(vitalParamList.value)),
    };
    const hostParams = {
      [operatorType]: JSON.parse(JSON.stringify(hostVitalParamList.value)),
    };
    const hostParamsObj = {
      [operatorType]: JSON.parse(JSON.stringify(hostVitalParamListObj)),
    };
    const guestParams = {
      [operatorType]: JSON.parse(JSON.stringify(guestVitalParamList.value)),
    };
    const commonParams = {
      [operatorType]: JSON.parse(JSON.stringify(commonVitalParamList.value)),
    };
    const arbiterParams = {
      [operatorType]: JSON.parse(JSON.stringify(arbiterVitalParamList.value)),
    };
    // console.log('params', params);
    const projectParams = {
      ...JSON.parse(localStorage.getItem('projectParams')),
      ...params,
    };
    const arbiterProjectParams = {
      ...JSON.parse(localStorage.getItem('arbiterProjectParams')),
      ...arbiterParams,
    };
    const hostProjectParams = {
      ...JSON.parse(localStorage.getItem('hostProjectParams')),
      ...hostParams,
    };
    const hostProjectParamsObj = {
      ...JSON.parse(localStorage.getItem('hostProjectParamsObj')),
      ...hostParamsObj,
    };
    const guestProjectParams = {
      ...JSON.parse(localStorage.getItem('guestProjectParams')),
      ...guestParams,
    };
    const commonProjectParams = {
      ...JSON.parse(localStorage.getItem('commonProjectParams')),
      ...commonParams,
    };
    localStorage.setItem('projectParams', JSON.stringify(projectParams));
    localStorage.setItem(
      'hostProjectParams',
      JSON.stringify(hostProjectParams),
    );
    localStorage.setItem(
      'hostProjectParamsObj',
      JSON.stringify(hostProjectParamsObj),
    );
    localStorage.setItem(
      'guestProjectParams',
      JSON.stringify(guestProjectParams),
    );
    localStorage.setItem(
      'commonProjectParams',
      JSON.stringify(commonProjectParams),
    );
    localStorage.setItem(
      'arbiterProjectParams',
      JSON.stringify(arbiterProjectParams),
    );
    console.log('vitalParamList =>>>', vitalParamList.value);
    // const formattedForm = formattedFormResult(vitalParamList.value);
    const commonFormattedForm = formattedFormResult(commonVitalParamList.value);

    // const configInfo = {
    //   [operatorType]: JSON.stringify(formattedForm)
    //     .trim()
    //     .slice(1, -1)
    //     .replaceAll(new RegExp('},+{', 'gm'), ',')
    //     .replaceAll('[{', '{')
    //     .replaceAll('}]', '}')
    //     .replaceAll('[]', '{}'),
    // };
    const ConfigInfo = {
      [operatorType]: JSON.stringify(commonFormattedForm)
        .trim()
        .slice(1, -1)
        .replaceAll(new RegExp('},+{', 'gm'), ',')
        .replaceAll('[{', '{')
        .replaceAll('}]', '}')
        .replaceAll('[]', '{}'),
    };
    // const projectConfigInfo = {
    //   ...JSON.parse(localStorage.getItem('projectConfigInfo')),
    //   ...configInfo,
    // };
    const ProjectConfigInfo = {
      ...JSON.parse(localStorage.getItem('ProjectConfigInfo')),
      ...ConfigInfo,
    };
    // localStorage.setItem(
    //   'projectConfigInfo',
    //   JSON.stringify(projectConfigInfo),
    // );
    localStorage.setItem(
      'ProjectConfigInfo',
      JSON.stringify(ProjectConfigInfo),
    );
    callback();
  }

  async function onSaveGraphInfo(nodes, edges) {
    console.log('onSaveGraphInfo');
    console.log('edges>>', edges);
    console.log('nodes>>', nodes);
    // 把所有算子获取到
    // await getInEffectAlgorithmList();
    const algorithmStore = useAlgorithmStore();
    algorithmList.value = algorithmStore.getAlgorithmParamsList;
    console.log('algorithmList>>', algorithmList.value);
    const info = _.cloneDeep(JSON.parse(localStorage.getItem('projectInfo')));
    //筛选掉没有node.component_name的节点
    const nodeList = nodes.filter((node) => {
      return !(node.disableMove == false);
    });
    console.log({nodeList});
    // 得到画布上算子的基本信息
    const selectedOperators = nodeList.map((node) => {
      node.algorithm_name = node.component_name;
      const res = algorithmList.value.find(
        (operator) =>
          operator.algorithmId === node.algorithm_id ||
          operator.name === node.algorithm_name ||
          operator.name === node.algorithm_name.replace(/(_\d+)$/, ''),
      );
      // res['componentName'] = node.label ? node.label : node.component_name;
      console.log({ res, algorithmList, node });
      console.log(JSON.stringify(node), '是啥阿');
      res['componentName'] = node.label ? node.label : node.component_name;
      return _.cloneDeep(res);
    });
    console.log('selectedOperators>>', selectedOperators);
    const dependencyData = {};
    const componentArray = [];
    // job_dsl init
    _.set(info, `projectJson.job_dsl.components`, {});
    // job_runtime_conf init
    _.set(info, `projectJson.job_runtime_conf.component_parameters`, {});
    console.log(
      nodes,
      '************************************************************************',
    );
    await onSaveDsl(info, nodes, edges);
    await onSaveRuntimeConf(
      info,
      nodes,
      selectedOperators,
      dependencyData,
      componentArray,
    );
    await onSaveDependencyData(nodes, edges, dependencyData);
    await onSaveProject(selectedOperators, info, dependencyData);
  }

  function onSaveDependencyData(nodes, edges, dependencyData) {
    nodes.forEach((node) => {
      const nodeLabel = node.label;
      const dependencyArray = [];
      edges.forEach((edge) => {
        const sourceId = edge.source.cell;
        // const sourcePort = edge.source.port;
        const targetId = edge.target.cell;
        const targetPort = edge.target.port;
        const sourceNode = nodes.find((node) => node.id === sourceId);
        const targetNode = nodes.find((node) => node.id === targetId);
        if (targetNode.label === nodeLabel) {
          dependencyArray.push({
            component_name: sourceNode.label,
            up_output_info: [`${edge.source.port.split('O')[0]}`, 0],
            type: `${edge.target.port.split('I')[0]}`,
          });
        }
      });
      _.set(dependencyData, `dependencies[${nodeLabel}]`, dependencyArray);
    });
  }

  async function onSaveDsl(info, nodes, edges) {
    console.log(edges, nodes, 'GGBO');
    const algorithmStore = useAlgorithmStore();
    const getAlgorithmParams = algorithmStore.getAlgorithmParams;
    for (let i = 0; i < nodes.length; i++) {
      let data = null;
      //如果是背景的节点则不做处理跳过该次循环
      if (nodes[i].disableMove == false) continue;
      if (
        [
          'information_retrieval',
          'sample_intersection',
          'federated_training',
          'federated_inference',
          'feature_engineering',
          'reader',
        ].includes(nodes[i].type)
      ) {
        console.log(nodes[i], 'nodes[i].component_name');
        if (
          nodes[i].component_name.indexOf('_0') == -1 &&
          nodes[i].component_name.indexOf('_1') == -1 &&
          nodes[i].component_name.indexOf('_2') == -1
        ) {
          // data = await inEffectAlgorithmParams(nodes[i].component_name);
          data = getAlgorithmParams(nodes[i].component_name);
        } else {
          // data = await inEffectAlgorithmParams(
          //   nodes[i].component_name.slice(0, -2),
          // );
          data = getAlgorithmParams(nodes[i].component_name.slice(0, -2));
        }
      } else {
        console.log(nodes[i].type, 'TTYYPPEE');

        // data = await inEffectAlgorithmParams(nodes[i].type);
        data = getAlgorithmParams(nodes[i].type);
      }
      const versionId = JSON.parse(
        sessionStorage.getItem('projectParamsVersion'),
      )
        ? JSON.parse(sessionStorage.getItem('projectParamsVersion'))[
            nodes[i].label
          ]
        : 1;
      // const output = JSON.parse(data.tAlgorithmParamVersions[0].dsl)
      // console.log(JSON.parse(sessionStorage.getItem('projectParamsVersion'))[nodes[i].label], '33333333333PPPPPPPP');
      const output = versionId
        ? data.tAlgorithmParamVersions.find(
            (item) => item.param_version === versionId,
          ).param_dsl
        : data.tAlgorithmParamVersions[0]?.param_dsl;
      console.log(output, 'OUTPUT');
      const input = edges.filter((edge) => nodes[i].id === edge.target.cell);
      let sourceNode = null;
      // input
      const inputDsl = input.map((edge) => {
        sourceNode = nodes.find((node) => node.id === edge.source.cell);
        return `${sourceNode.label}.${edge.source.port.split('O')[0]}`;
      });

      if (inputDsl.length !== 0) {
        input.forEach((dsl, idx) => {
          if (dsl.source.port.split('O')[0] === 'model') {
            _.set(
              info,
              `projectJson.job_dsl.components[${nodes[i].label}].input.${
                input[idx].target.port.split('I')[0]
              }`,
              // [`${sourceNode.label}.model`]
              [inputDsl[idx]],
            );
            // inputDsl.splice(idx, 1)
          } else {
            if (
              info[`projectJson`].job_dsl.components[`${nodes[i].label}`]?.input
                ?.data[`${input[idx].target.port.split('I')[0]}`]
            ) {
              info[`projectJson`].job_dsl.components[
                `${nodes[i].label}`
              ]?.input.data[`${input[idx].target.port.split('I')[0]}`].push(
                inputDsl[idx],
              );
            } else {
              _.set(
                info,
                `projectJson.job_dsl.components[${nodes[i].label}].input.data.${
                  input[idx].target.port.split('I')[0]
                }`,
                [inputDsl[idx]],
              );
            }
          }
        });
      }
      console.log(output);
      // output
      if (output.output.data.length !== 0) {
        const newOutputData = output.output.data.map((item) => {
          return item.split(':')[0];
        });
        _.set(
          info,
          `projectJson.job_dsl.components[${nodes[i].label}].output.data`,
          [...newOutputData],
        );
      }
      if (output.output.model.length !== 0) {
        const newOutputModel = output.output.model.map((item) => {
          return item.split(':')[0];
        });
        _.set(
          info,
          `projectJson.job_dsl.components[${nodes[i].label}].output.model`,
          [...newOutputModel],
        );
      }
      // });
    }
  }

  //guest host 修改文件
  function onSaveRuntimeConf(
    info,
    nodes,
    selectedOperators,
    dependencyData,
    componentArray,
  ) {
    const roleHostList = [];
    let roleGuest = {};
    const hostProjectParams = JSON.parse(
      localStorage.getItem('hostProjectParamsObj'),
    );
    //存储节点在画布上的坐标对象
    const projectNodeCoord = JSON.parse(
      localStorage.getItem('projectNodeCoord'),
    );
    const hostParamsKey = Object.keys(
      hostProjectParams?.[nodes[0].label] || {},
    );
    // const hostParamsKey = Object.keys(hostProjectParams[nodes[3].label]);
    const guestProjectParams = JSON.parse(
      localStorage.getItem('guestProjectParams'),
    );
    // const projectConfigInfo = JSON.parse(
    //   localStorage.getItem('projectConfigInfo'),
    // );
    const ProjectConfigInfo = JSON.parse(
      localStorage.getItem('ProjectConfigInfo'),
    );
    // nodes是所有出现在画布上的算子组成的数组
    nodes.forEach((node) => {
      // 这块利用try catch来捕获用户未保存算子的错误并提示用户未保存算子
      // try {
      //如果是背景节点就不做处理跳过
      if (node.disableMove == false) return;
      const componentName = node.algorithm_name;
      const componentId = node.algorithm_id;
      console.log(
        node,
        '11111111111111111111111111111111111111111111111111111111111111111111',
      );
      // labelName为当前算子的名称
      const labelName = node.label;
      // const labelName = node.algorithm_name + node.label.slice(-2);
      const operator = selectedOperators.find(
        (item) =>
          item.algorithmId === componentId ||
          item.name === componentName ||
          item.name === componentName.replace(/(_\d+)$/, ''),
      );
      // const operatorParams = projectParams[labelName];

      const guestOperatorParams = guestProjectParams?.[labelName];
      // const operatorConfigInfo = projectConfigInfo[labelName];
      const OperatorConfigInfo = ProjectConfigInfo?.[labelName];
      console.log(operator, labelName, 'operator.name');

      componentArray.push({
        component_name: labelName,
        algorithm_id: operator.algorithmId,
        algorithm_name: operator.name,
        name_zh: operator.labelName + labelName.slice(-2),
        //赋值当前算子的坐标信息
        x: projectNodeCoord[labelName].x,
        y: projectNodeCoord[labelName].y,
      });
      // module
      _.set(
        info,
        `projectJson.job_dsl.components[${labelName}].module`,
        node.component_module,
      );

      _.set(dependencyData, `component_module[${labelName}]`, operator.module);

      if (
        OperatorConfigInfo !== '' &&
        JSON.stringify(OperatorConfigInfo) !== '{}'
      ) {
        try {
          _.set(
            info,
            `projectJson.job_runtime_conf.component_parameters.common[${labelName}]`,
            {
              ...JSON.parse(OperatorConfigInfo),
            },
          );
        } catch (error) {
          ElMessage.error('当前页面有算子的生效参数为空');
          throw new Error(error);
        }
      }

      // const operatorParamsName = [guestOperatorParams, hostOperatorParams]
      // const type = ['guest', 'host']
      // 处理guest的数据
      if (['reader', 'federated_training'].includes(operator.category)) {
        const guestDefaultParam = {};
        // operatorParamsName.forEach((operatorParams, i) => {
        guestOperatorParams?.forEach((operatorParam) => {
          console.log(operatorParam, 'zzzx');
          // 如果是level类型就看他的子参数有没有guest
          if (
            operatorParam.inputStyle === 'level' &&
            operatorParam.subParams.length > 0
          ) {
            operatorParam.subParams.forEach((item) => {
              if (item.isVitalParam && item.roleType.includes('guest')) {
                let result = formatSubParams(operatorParam.subParams, 'guest');
                const ParamInfo = JSON.stringify(result)
                  .trim()
                  .slice(1, -1)
                  .replaceAll(new RegExp('},+{', 'gm'), ',')
                  .replaceAll('[{', '{')
                  .replaceAll('}]', '}')
                  .replaceAll('[]', '{}');
                guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                  JSON.parse(ParamInfo);
              }
            });
            return;
          }
          if (!operatorParam.isVitalParam) return;
          const roleType = operatorParam.roleType;
          if (roleType.length > 0 && roleType.includes('guest')) {
            if (operatorParam.inputStyle === 'select') {
              if (
                operatorParam.defaultValue === '[]' ||
                operatorParam.defaultValue === ''
              ) {
                guestDefaultParam[operatorParam.key] = '';
              } else {
                const op = JSON.parse(operatorParam.options).find(
                  (option) =>
                    option.label === operatorParam.defaultValue ||
                    option.value === operatorParam.defaultValue,
                );
                if (op) {
                  guestDefaultParam[operatorParam.key] = op.value;
                } else {
                  guestDefaultParam[operatorParam.key] =
                    operatorParam.defaultValue;
                }
              }
            } else if (operatorParam.inputStyle === 'checkbox') {
              guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                JSON.parse(operatorParam.defaultValue);
            } else {
              // if (operatorParam.type === 'json') {
              //   operatorParam.defaultValue = JSON.stringify(operatorParam.defaultValue)
              //   guestDefaultParam[
              //     operatorParam.key.replace('_guest', '')
              //   ] = JSON.parse(operatorParam.defaultValue);
              // } else {
              guestDefaultParam[operatorParam.key] = operatorParam.defaultValue;
              // }
            }
          }
        });
        // })
        if (JSON.stringify(guestDefaultParam) !== '{}') {
          roleGuest[labelName] = {
            ...guestDefaultParam,
          };
        }
        // } else if (['data_transform'].includes(operator.category)) {
      } else if (['data_transform'].includes(operator.module)) {
        const guestDefaultParam = {};
        // operatorParamsName.forEach((operatorParams, i) => {
        guestOperatorParams.forEach((operatorParam) => {
          if (!operatorParam.isVitalParam) return;
          const roleType = operatorParam.roleType;
          if (roleType.length > 0 && roleType.includes('guest')) {
            if (operatorParam.inputStyle === 'select') {
              if (
                operatorParam.defaultValue === '[]' ||
                operatorParam.defaultValue === ''
              ) {
                guestDefaultParam[operatorParam.key.replace('_guest', '')] = '';
              } else {
                const op = operatorParam.options.find(
                  (option) =>
                    option.label === operatorParam.defaultValue ||
                    option.value === operatorParam.defaultValue,
                );
                if (op) {
                  guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                    op.value;
                } else {
                  guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                    operatorParam.defaultValue;
                }
              }
            } else {
              // if (operatorParam.type === 'json') {
              //   guestDefaultParam[
              //     operatorParam.key.replace('_guest', '')
              //   ] = JSON.parse(operatorParam.defaultValue);
              // } else {
              guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                operatorParam.defaultValue;
              // }
            }
          }
        });
        if (JSON.stringify(guestDefaultParam) !== '{}') {
          roleGuest[labelName] = {
            ...guestDefaultParam,
          };
        }
        // })
      } else {
        const guestDefaultParam = {};
        // operatorParamsName.forEach((operatorParams, i) => {
        guestOperatorParams.forEach((operatorParam) => {
          // 判断他的类型是不是level，如果是就以他子项的roleType为主
          if (
            operatorParam.inputStyle === 'level' &&
            operatorParam.subParams.length > 0
          ) {
            operatorParam.subParams.forEach((item) => {
              if (item.isVitalParam && item.roleType.includes('guest')) {
                let result = formatSubParams(operatorParam.subParams, 'guest');
                const ParamInfo = JSON.stringify(result)
                  .trim()
                  .slice(1, -1)
                  .replaceAll(new RegExp('},+{', 'gm'), ',')
                  .replaceAll('[{', '{')
                  .replaceAll('}]', '}')
                  .replaceAll('[]', '{}');
                guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                  JSON.parse(ParamInfo);
              }
            });
            return;
          }
          if (!operatorParam.isVitalParam) return;
          console.log(operatorParam, 'operatorParam');

          // const roleType = JSON.parse(operatorParam.roleType);
          const roleType = operatorParam.roleType;
          if (roleType.length > 0 && roleType.includes('guest')) {
            if (operatorParam.inputStyle === 'select') {
              if (
                operatorParam.defaultValue === '[]' ||
                operatorParam.defaultValue === ''
              ) {
                guestDefaultParam[operatorParam.key] = '';
              } else {
                const op = operatorParam.options.find(
                  (option) =>
                    option.label === operatorParam.defaultValue ||
                    option.value === operatorParam.defaultValue,
                );
                if (op) {
                  guestDefaultParam[operatorParam.key] = op.value;
                } else {
                  guestDefaultParam[operatorParam.key] =
                    operatorParam.defaultValue;
                }
              }
            } else if (operatorParam.inputStyle === 'checkbox') {
              guestDefaultParam[operatorParam.key.replace('_guest', '')] =
                JSON.parse(operatorParam.defaultValue);
            } else {
              // if (operatorParam.type === 'json') {
              //   guestDefaultParam[operatorParam.key] = JSON.parse(
              //     operatorParam.defaultValue,
              //   );
              // } else {
              guestDefaultParam[operatorParam.key] = operatorParam.defaultValue;
              // }
            }
          }
        });

        if (JSON.stringify(guestDefaultParam) !== '{}') {
          roleGuest[labelName] = {
            ...guestDefaultParam,
          };
        }
        // })
      }

      // } catch (error) {
      //   ElMessage.error('保存失败，有算子还未保存')
      //   throw new Error('有算子未保存')
      // }
    });

    // 处理host的数据
    for (let i = 0; i < hostParamsKey.length; i++) {
      let roleHost = {};
      nodes.forEach((node) => {
        //如果是背景节点就不处理跳过该次循环
        if (node.disableMove == false) return;
        // try {
        const componentName = node.algorithm_name;
        const labelName = node.label;
        // const labelName = node.component_name + node.label.slice(-2);
        const componentId = node.algorithm_id;
        // labelName为当前算子的名称
        const operator = selectedOperators.find(
          (item) =>
            item.algorithmId === componentId ||
            item.name === componentName ||
            item.name === componentName.replace(/(_\d+)$/, ''),
        );
        if (['reader', 'federated_training'].includes(operator.category)) {
          const hostDefaultParam = {};
          hostProjectParams[labelName][`hostVitalParamList${i}`].forEach(
            (operatorParam) => {
              // 如果是level类型就看他的子参数有没有host
              if (
                operatorParam.inputStyle === 'level' &&
                operatorParam.subParams.length > 0
              ) {
                operatorParam.subParams.forEach((item) => {
                  if (item.isVitalParam && item.roleType.includes('host')) {
                    let result = formatSubParams(
                      operatorParam.subParams,
                      'host',
                    );
                    const ParamInfo = JSON.stringify(result)
                      .trim()
                      .slice(1, -1)
                      .replaceAll(new RegExp('},+{', 'gm'), ',')
                      .replaceAll('[{', '{')
                      .replaceAll('}]', '}')
                      .replaceAll('[]', '{}');
                    console.log(ParamInfo, 'WWWWQ');
                    hostDefaultParam[operatorParam.key.replace('_host', '')] =
                      JSON.parse(ParamInfo);
                  }
                });
                return;
              }
              if (!operatorParam.isVitalParam) return;
              const roleType = operatorParam.roleType;
              if (roleType.length > 0 && roleType.includes('host')) {
                if (operatorParam.inputStyle === 'select') {
                  if (
                    operatorParam.defaultValue === '[]' ||
                    operatorParam.defaultValue === ''
                  ) {
                    hostDefaultParam[operatorParam.key] = '';
                  } else {
                    const op = JSON.parse(operatorParam.options).find(
                      (option) =>
                        option.label === operatorParam.defaultValue ||
                        option.value === operatorParam.defaultValue,
                    );
                    if (op) {
                      hostDefaultParam[operatorParam.key] = op.value;
                    } else {
                      hostDefaultParam[operatorParam.key] =
                        operatorParam.defaultValue;
                    }
                  }
                } else if (operatorParam.inputStyle === 'checkbox') {
                  hostDefaultParam[operatorParam.key.replace('_host', '')] =
                    JSON.parse(operatorParam.defaultValue);
                } else {
                  // if (operatorParam.type === 'json') {
                  //   operatorParam.defaultValue = JSON.stringify(operatorParam.defaultValue)
                  //   hostDefaultParam[
                  //     operatorParam.key.replace('_host', '')
                  //   ] = JSON.parse(operatorParam.defaultValue);
                  // } else {
                  hostDefaultParam[operatorParam.key] =
                    operatorParam.defaultValue;
                  // }
                }
              }
            },
          );
          // })
          if (JSON.stringify(hostDefaultParam) !== '{}') {
            roleHost[labelName] = {
              ...hostDefaultParam,
            };
          }
        } else if (['data_transform'].includes(operator.category)) {
          const hostDefaultParam = {};
          hostProjectParams[labelName][`hostVitalParamList${i}`].forEach(
            (operatorParam) => {
              if (!operatorParam.isVitalParam) return;
              const roleType = operatorParam.roleType;
              if (roleType.length > 0 && roleType.includes('host')) {
                if (operatorParam.inputStyle === 'select') {
                  if (
                    operatorParam.defaultValue === '[]' ||
                    operatorParam.defaultValue === ''
                  ) {
                    hostDefaultParam[operatorParam.key.replace('_host', '')] =
                      '';
                  } else {
                    const op = operatorParam.options.find(
                      (option) =>
                        option.label === operatorParam.defaultValue ||
                        option.value === operatorParam.defaultValue,
                    );
                    if (op) {
                      hostDefaultParam[operatorParam.key.replace('_host', '')] =
                        op.value;
                    } else {
                      hostDefaultParam[operatorParam.key.replace('_host', '')] =
                        operatorParam.defaultValue;
                    }
                  }
                } else {
                  // if (operatorParam.type === 'json') {
                  //   hostDefaultParam[
                  //     operatorParam.key.replace('_host', '')
                  //   ] = JSON.parse(operatorParam.defaultValue);
                  // } else {
                  hostDefaultParam[operatorParam.key.replace('_host', '')] =
                    operatorParam.defaultValue;
                  // }
                }
              }
            },
          );
          if (JSON.stringify(hostDefaultParam) !== '{}') {
            roleHost[labelName] = {
              ...hostDefaultParam,
            };
          }
        } else {
          const hostDefaultParam = {};
          hostProjectParams[labelName][`hostVitalParamList${i}`].forEach(
            (operatorParam) => {
              // 判断他的类型是不是level，如果是就以他子项的roleType为主
              if (
                operatorParam.inputStyle === 'level' &&
                operatorParam.subParams.length > 0
              ) {
                operatorParam.subParams.forEach((item) => {
                  if (item.isVitalParam && item.roleType.includes('host')) {
                    let result = formatSubParams(
                      operatorParam.subParams,
                      'host',
                    );
                    const ParamInfo = JSON.stringify(result)
                      .trim()
                      .slice(1, -1)
                      .replaceAll(new RegExp('},+{', 'gm'), ',')
                      .replaceAll('[{', '{')
                      .replaceAll('}]', '}')
                      .replaceAll('[]', '{}');
                    hostDefaultParam[operatorParam.key.replace('_host', '')] =
                      JSON.parse(ParamInfo);
                  }
                });
                return;
              }
              if (!operatorParam.isVitalParam) return;
              const roleType = operatorParam.roleType;
              if (roleType.length > 0 && roleType.includes('host')) {
                if (operatorParam.inputStyle === 'select') {
                  if (
                    operatorParam.defaultValue === '[]' ||
                    operatorParam.defaultValue === ''
                  ) {
                    hostDefaultParam[operatorParam.key] = '';
                  } else {
                    const op = operatorParam.options.find(
                      (option) =>
                        option.label === operatorParam.defaultValue ||
                        option.value === operatorParam.defaultValue,
                    );
                    if (op) {
                      hostDefaultParam[operatorParam.key] = op.value;
                    } else {
                      hostDefaultParam[operatorParam.key] =
                        operatorParam.defaultValue;
                    }
                  }
                } else if (operatorParam.inputStyle === 'checkbox') {
                  hostDefaultParam[operatorParam.key.replace('_host', '')] =
                    operatorParam.defaultValue;
                } else {
                  // if (operatorParam.type === 'json') {
                  //   hostDefaultParam[operatorParam.key] = JSON.parse(
                  //     operatorParam.defaultValue,
                  //   );
                  // } else {
                  hostDefaultParam[operatorParam.key] =
                    operatorParam.defaultValue;
                  // }
                }
              }
            },
          );

          if (JSON.stringify(hostDefaultParam) !== '{}') {
            roleHost[labelName] = {
              ...hostDefaultParam,
            };
          }
        }
        // } catch (error) {
        //   ElMessage.error('保存失败，有算子还未保存')
        //   throw new Error('有算子未保存')
        // }
      });
      roleHostList.push({ ...roleHost });
    }
    _.set(dependencyData, `component_list`, componentArray);
    _.set(
      info,
      `projectJson.job_runtime_conf.component_parameters.role.guest`,
      {
        0: {
          ...roleGuest,
        },
      },
    );
    roleHostList.forEach((item, i) => {
      if (info.projectJson.job_runtime_conf.component_parameters.role.host) {
        info.projectJson.job_runtime_conf.component_parameters.role.host[i] = {
          ...item,
        };
      } else {
        _.set(
          info,
          `projectJson.job_runtime_conf.component_parameters.role.host`,
          {
            [i]: {
              ...item,
            },
          },
        );
      }
    });
  }

  // createProject  这块创建新算子
  async function onSaveProject(selectedOperators, info, dependencyData) {
    console.log('dependencyData>>', dependencyData);
    console.log('selectedOperators>>', selectedOperators);
    console.log('info>>', info);
    console.log('projectJson>>', info.projectJson);
    let projectId;
    let loadingInstance = ElLoading.service({});
    // 因为他们的key都一样所以只获取一个的就行
    let hostProjectParams = JSON.parse(
      localStorage.getItem('hostProjectParamsObj'),
    );
    let guestProjectParams = JSON.parse(
      localStorage.getItem('guestProjectParams'),
    );
    let commonProjectParams = JSON.parse(
      localStorage.getItem('commonProjectParams'),
    );
    let arbiterProjectParams = JSON.parse(
      localStorage.getItem('arbiterProjectParams'),
    );
    let ProjectParamsKey = Object.keys(guestProjectParams);
    const hostParamsKey = Object.keys(hostProjectParams[ProjectParamsKey[0]]);
    const ProjectParams = {};
    ProjectParamsKey.forEach((key) => {
      ProjectParams[key] = [
        ...guestProjectParams[key],
        ...commonProjectParams[key],
        ...arbiterProjectParams[key],
      ];
      hostParamsKey.forEach((hostParamsKey) =>
        ProjectParams[key].unshift(...hostProjectParams[key][hostParamsKey]),
      );
    });
    if (sessionStorage.getItem('projectParamsVersion'))
      dependencyData.projectParamsVersion = sessionStorage.getItem(
        'projectParamsVersion',
      );
    console.log(ProjectParams, 'JKJKJK');
    // let algorithmParams = Base64.encode(JSON.stringify(ProjectParams));
    // info.projectJson = Base64.encode(JSON.stringify(info.projectJson));
    // dependencyData = Base64.encode(JSON.stringify(dependencyData));
    // let selectedAlgorithm = Base64.encode(JSON.stringify(selectedOperators));
    // console.log('algorithmParams>>', JSON.parse(algorithmParams));
    let configData = JSON.stringify(ProjectParams);
    let projectJson = JSON.stringify(info.projectJson);
    dependencyData = JSON.stringify(dependencyData);
    let edgeData = JSON.stringify(selectedOperators);
    try {
      projectId = projectInfo.value.id;

      // await updateProject({
      //   id: projectId,
      //   ...info,
      //   selectedAlgorithm,
      //   algorithmParams,
      //   dependencyData,
      // });
      let outterTaskId = {
        ...info.outterTaskId,
        configData,
        dependencyData,
        projectJson,
        edgeData,
        host: info.host,
      };
      console.log({ outterTaskId });
      localStorage.setItem('projectInfo', JSON.stringify(info));
      const res = await dpProjectTasks05Save({
        id: projectId,
        isNewRecord: false,
        outterTaskId: JSON.stringify(outterTaskId),
      });
       if(res.result =='login') {
         ElMessage.error(res.message);
         throw new Error(res.message)
      } else {
       ElMessage.success('应用修改成功');
      }
    } catch (error) {
      ElMessage.error('error');
    } finally {
      loadingInstance.close();
    }
  }

  return {
    getInEffectAlgorithmParams,
    selectParamVersion,
    changeParams,
    handleCheckChange,
    vitalParamList,
    commonVitalParamList,
    hostVitalParamList,
    hostVitalParamListObj,
    guestVitalParamList,
    arbiterVitalParamList,
    changeValues,
    staticParams,
    paramVersion,
    optionParamList,
    paramVersionList,
    defaultVitalParamList,
    canSelect,
    selected,
    constraintList,
    projectAlgorithmParams,
    optionParam,
    onSaveNode,
    onSaveGraphInfo,
  };
}
