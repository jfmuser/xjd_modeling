import _ from 'lodash';

export function compare(var1, symbol, var2) {
  console.log(var1, symbol, var2, '898989898989');
  if (symbol === '=') {
    return var1 === var2;
  } else if (symbol === '!=') {
    return var1 !== var2;
  } else if (symbol === '>') {
    return var1 > var2;
  } else if (symbol === '<') {
    return var1 < var2;
  } else if (symbol === '>=') {
    return var1 >= var2;
  } else if (symbol === '<=') {
    return var1 <= var2;
  } else if (symbol === 'in') {
    return var1.includes(var2);
  } else if (symbol === 'not in') {
    return !var1.includes(var2);
  }
}

export function findDefaultValueParam(data, keyPath) {
  let result;
  if (!data) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    if (item.keyPath === keyPath) {
      result = item;
      break;
    } else if (item.subParams && item.subParams.length > 0) {
      result = findDefaultValueParam(item.subParams, keyPath);
      if (result) return result; // 如果找到，就直接返回，结束后面的循环
    }
  }
  return result;
}

export function findConstraint(data, keyPath, value) {
  let result;
  if (data.length <= 0) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    const controllerParams = item.controller_param_list;
    if (controllerParams.length > 0) {
      for (let j = 0; j < controllerParams.length; j++) {
        let controllerParam = controllerParams[j];
        if (
          controllerParam.param_key === keyPath &&
          compare(
            value,
            controllerParam.operator,
            controllerParam.param_value.toString(),
          )
        ) {
          result = item;
          if (result) return result;
        }
      }
    }
  }
  return result;
}

export function setParamConfig(data, influencedParam) {
  data.forEach((param) => {
    if (param.keyPath === influencedParam.param_key) {
      // param.isShowKey = influencedParam.is_show_key;
      param.isVitalParam = influencedParam.is_vital_param;
      param.options =
        influencedParam.options && influencedParam.options.length > 0
          ? JSON.stringify(influencedParam.options)
          : '[]';
      param.defaultValue = influencedParam.value ? influencedParam.value : '';
    }
    if (param.subParams && param.subParams.length > 0) {
      param.subParams = setParamConfig(param.subParams, influencedParam);
    }
  });
  return data;
}

export function resetParams(data, defaultValues, roleType) {
  data.forEach((param) => {
    defaultValues.forEach((defaultValue) => {
      if (param.keyPath === defaultValue.keyPath && defaultValue.roleType === roleType) {
        if (param.inputStyle === 'select') {
          param.defaultValue = _.cloneDeep(defaultValue.value);
        } else {
          param.defaultValue = defaultValue.value;
        }
      } else {
        if (param.subParams && param.subParams.length > 0) {
          param.subParams = resetParams(param.subParams, defaultValues, roleType)
        }
      }
    });
  });
  return data;
}

export function resetParam(data, keyPath, value) {
  data.forEach((param) => {
    if (param.keyPath === keyPath) {
      if (param.inputStyle === 'select') {
        param.defaultValue = [value];
      } else {
        param.defaultValue = value;
      }
      return data;
    } else {
      if (param.subParams && param.subParams.length > 0) {
        param.subParams = resetParam(param.subParams, keyPath, value);
      }
    }
  });
  return data;
}

export function checkConstraints(paramList, constraintList) {
  paramList.forEach((data) => {
    // 判断是否存在子参数为重要参数，父参数为非重要参数
    let optionParamCount = checkChildrenHasVitalParam(data, 0);
    if (optionParamCount > 0) {
      data.isVitalParam = true;
    } else if (optionParamCount === 0 && data.subParams?.length > 0) {
      data.isVitalParam = false;
    }
  });
  console.log('constraintList.length', constraintList);
  if (!constraintList || constraintList.length <= 0) {
    return paramList;
  }
  constraintList.forEach((constraint) => {
    const controller = constraint.controller_param_list;
    const influenced = constraint.influenced_param_list;
    let count = 0;
    controller.forEach((controllerParam) => {
      // 判断当前参数在控制参数列表中的条件
      count = countControllerParams(count, paramList, controllerParam);
    });
    // 控制参数列表是否全部满足条件
    if (controller.length === count) {
      // 设置影响参数的状态及默认值
      influenced.forEach((influencedParam) => {
        paramList = setParamConfig(paramList, influencedParam);
      });
      return paramList;
    }
  });
  return paramList;
}

export function countControllerParams(count, paramList, controllerParam) {
  const controllerParamKey = controllerParam.param_key;
  const controllerParamValue = JSON.stringify(controllerParam.param_value);
  const controllerParamOperator = controllerParam.operator;
  paramList.forEach((params) => {
    const currKeyPath = params.keyPath;
    let defaultValue = params.defaultValue;
    if (typeof defaultValue !== 'string') {
      defaultValue = JSON.stringify(defaultValue);
    }

    // 进行转换 默认初始进来进行转换

    if (params.inputStyle === 'select') {
      if (params.defaultValue === '[]' || params.defaultValue === '') {
        params[params.key] = '';
      } else {
        const op = JSON.parse(params.options).find(
          (option) => option.label === params.defaultValue,
        );
        if (op) {
          params[params.key] = op.value;
        } else {
          params[params.key] = params.defaultValue;
        }
      }

    }
    if (
      controllerParamKey === currKeyPath &&
      compare(defaultValue, controllerParamOperator, controllerParamValue)
    ) {
      count = count + 1;
      return count;
    }
    if (params.subParams && params.subParams.length > 0) {
      count = countControllerParams(count, params.subParams, controllerParam);
    }
  });
  return count;
}
//转换json
export function formatJsonValue(dataList) {
  if (dataList?.length > 0) {
    dataList.forEach((item) => {
      if (item.defaultValue) {
        if (item.defaultValue != '') {
          item.defaultValue = item.defaultValue;
          return
        }
      }
      item.subParams = formatJsonValue(item.subParams);
    });
  }
  return dataList;
}
export function formatParamList(dataList) {
  if (dataList?.length > 0) {
    dataList.forEach((item) => {
      if (item.inputStyle === 'select') {
        let defaultValue =
          item.defaultValue === undefined ? '' : item.defaultValue;
        let value = defaultValue
          .toString()
          .replace('["', '')
          .replace('"]', '')
          .replace('[', '')
          .replace(']', '');
        try {
          if (typeof value === 'string' && value !== '') {
            console.log(item, 'IATM');
            const op = item.options.find(
              (option) =>
                option.value.toString().toLowerCase() === value.toLowerCase() ||
                option.label.toString().toLowerCase() === value.toLowerCase(),
            );
            if (op) {
              item.defaultValue = op.label;
            }
          } else if (typeof value === 'boolean') {
            const op = JSON.parse(item.options).find(
              (option) =>
                option.value === value || option.label.toString() === value,
            );
            if (op) {
              item.defaultValue = op.label;
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else if (item.inputStyle === 'input') {
        if (isJSON(item.defaultValue)) {
          item.defaultValue = JSON.parse(item.defaultValue)
          item.defaultValue = JSON.stringify(item.defaultValue, null, 4)
        }
        if (typeof item.defaultValue === 'object') {
          item.defaultValue = JSON.stringify(item.defaultValue, null, 4)
        }
      }
      item.subParams = formatParamList(item.subParams);
    });
  }
  return dataList;
}

export function setDefaultVital(dataList, flag) {
  if (dataList?.length > 0) {
    dataList.forEach((item) => {
      if (item.isDefaultVital === undefined) {
        item.isDefaultVital = item.isVitalParam;
      }
      if (item.subParams?.length > 0) {
        let optionParamCount = checkChildrenIsDefaultVitalParam(item, 0);
        let paramCount = checkChildrenIsVitalParam(item, 0);
        if (flag) {
          if (optionParamCount > 0) {
            item.isDefaultVital = 0;
          } else {
            item.isDefaultVital = 1;
          }
        } else {
          if (paramCount > 0) {
            item.isDefaultVital = 0;
          } else {
            item.isDefaultVital = 1;
          }
        }
      }
      item.subParams = setDefaultVital(item.subParams, flag);
    });
  }
  return dataList;
}

export function getOptionParamList(vitalParamList, optionParamList) {
  console.log(vitalParamList, optionParamList, '有错没');
  vitalParamList.forEach((vitalParam) => {
    let optionParam = {};
    optionParam = JSON.parse(JSON.stringify(vitalParam));
    optionParam.subParams = [];
    if (
      vitalParam.inputStyle === 'level' ||
      vitalParam.subParams?.length > 0
    ) {
      optionParam.subParams = getOptionParamList(vitalParam.subParams, []);
    }
    if (!optionParamList.some(item => item.key === optionParam.key)) {
      optionParamList.push(optionParam);
    }
  });
  return optionParamList;
}

export function getDefaultVitalParamList(
  optionParamList,
  defaultVitalParamList,
) {
  optionParamList.forEach((optionParam) => {
    if (!!optionParam.isVitalParam && optionParam.subParams.length <= 0) {
      defaultVitalParamList.push(optionParam.key);
    }
    if (optionParam.subParams?.length > 0) {
      getDefaultVitalParamList(optionParam.subParams, defaultVitalParamList);
    }
  });
  return defaultVitalParamList;
}

export function setParamConfigChecked(data, id, checked) {
  console.log(data, '酷酷的');
  data.forEach((vitalParam) => {
    if (vitalParam.key === id) {
      if (vitalParam.subParams?.length === 0) {

        vitalParam.isVitalParam = checked;

      }
      else {
        vitalParam.isVitalParam = checked;
      }
    } else {
      if (!vitalParam.subParams?.length > 0) return
      setParamConfigChecked(vitalParam.subParams, id, checked);
    }
  });

  return data;
}

export function formattedFormResult(dataList) {
  console.log(dataList, '1111DATELIST');
  const result = [];
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].inputStyle === 'level') {
      dataList[i].subParams = formattedFormResult(dataList[i].subParams);
      dataList[i][dataList[i].key] = dataList[i].subParams;
      if (dataList[i].subParams.length === 0) continue
      result.push(_.pick(dataList[i], [dataList[i].key]));
    } else {
      const roleType = dataList[i].roleType;
      if (roleType.length > 0 && !roleType.includes('common')) {
        dataList.splice(i, 1);
        i--
      } else {
        if (dataList[i].isVitalParam) {
          if (dataList[i].inputStyle === 'select') {
            if (dataList[i].defaultValue === '[]' || dataList[i].defaultValue === '') {
              dataList[i][dataList[i].key] = '';
            } else {
              const op = dataList[i].options.find(
                (option) => option.label === dataList[i].defaultValue,
              );
              if (op) {
                dataList[i][dataList[i].key] = op.value;
              } else {
                dataList[i][dataList[i].key] = dataList[i].defaultValue;
              }
            }
          } else if (dataList[i].inputStyle === 'checkbox') {
            if (isJSON(dataList[i].defaultValue)) {
              dataList[i][dataList[i].key] = JSON.parse(dataList[i].defaultValue);
            } else {
              dataList[i][dataList[i].key] = dataList[i].defaultValue
            }
          }
          else {
            // if (dataList[i].type === 'list') {
            //   let value = [];
            //   if (!dataList[i].defaultValue || dataList[i].defaultValue === 'null') {
            //   } else if (dataList[i].defaultValue === '-1') {
            //     value = -1;
            //   } else {
            //     if (Array.isArray(dataList[i].defaultValue)) {
            //       value = dataList[i].defaultValue
            //     } else {
            //       const defaultValue = dataList[i].defaultValue
            //         .replaceAll('"', '')
            //         .trim()
            //         .slice(1, -1)
            //         .split(',');
            //       for (let i = 0; i < defaultValue.length; i++) {
            //         let val = defaultValue[i].trim();
            //         if (!isNaN(Number(val))) {
            //           val = Number(val);
            //         } else if (val === 'true') {
            //           val = true;
            //         } else if (val === 'false') {
            //           val = false;
            //         }
            //         value.push(val);
            //       }
            //     }
            //   }
            //   dataList[i][dataList[i].key] = value;
            // } else 
            if (dataList[i].type === 'number') {
              dataList[i][dataList[i].key] = Number(dataList[i].defaultValue);
              // } else if (dataList[i].type === 'int') {
              //   dataList[i][dataList[i].key] = parseInt(dataList[i].defaultValue);
              // } else if (dataList[i].type === 'float') {
              //   dataList[i][dataList[i].key] = parseFloat(dataList[i].defaultValue);
            } else {
              if (isJSON(dataList[i].defaultValue)) {
                dataList[i][dataList[i].key] = JSON.parse(dataList[i].defaultValue);
              } else {
                dataList[i][dataList[i].key] = dataList[i].defaultValue
              }
            }
          }
          result.push(_.pick(dataList[i], [dataList[i].key]));
        }
      }
    }
  }
  return result;
}

export function setDefaultValue(dataList1, dataList2) {
  dataList1.forEach((data1) => {
    if (data1.inputStyle === 'level') {
      data1.subParams = setDefaultValue(data1.subParams, dataList2);
    } else {
      dataList2.forEach((data2) => {
        if (data1.id === data2.paramId) {
          data1.defaultValue = data2.defaultValue;
        }
      });
    }
  });
  return dataList1;
}

export function formatSubParams(dataList, type) {
  const result = [];
  dataList.forEach(function (data) {
    if (!data.isVitalParam) return
    if (data.subParams?.length > 0) {
      data.subParams = formattedFormResult(data.subParams);
      data[data.key] = data.subParams;
      result.push(_.pick(data, [data.key]));
    } else {
      if (!data.roleType.includes(type)) return
      if (data.inputStyle === 'select') {
        if (data.defaultValue === '[]' || data.defaultValue === '') {
          data[data.key] = '';
        } else {
          const op = data.options.find(
            (option) => option.label === data.defaultValue,
          );
          if (op) {
            data[data.key] = op.value;
          } else {
            data[data.key] = data.defaultValue;
          }
        }
      } else {
        // if (data.type === 'list') {
        //   let value = [];
        //   if (Array.isArray(data.defaultValue)) {
        //     value = data.defaultValue
        //   } else {
        //     const defaultValue = data.defaultValue
        //       .replaceAll('"', '')
        //       .trim()
        //       .slice(1, -1)
        //       .split(',');
        //     for (let i = 0; i < defaultValue.length; i++) {
        //       value.push(defaultValue[i].trim());
        //     }
        //   }
        //   data[data.key] = value;
        // } else 
        if (data.type === 'number') {
          data[data.key] = Number(data.defaultValue);
          // } else if (data.type === 'int') {
          //   data[data.key] = parseInt(data.defaultValue);
          // } else if (data.type === 'float') {
          //   data[data.key] = parseFloat(data.defaultValue);
        } else {
          data[data.key] = data.defaultValue;
        }
      }
      result.push(_.pick(data, [data.key]));
    }
  });
  return result;
}

export function setReaderOptions(
  currentVersionParams,
  options,
  key,
  roleType,
) {
  console.log({currentVersionParams,
  options,
  key})
  for (let i = 0; i < currentVersionParams.length; i++) {
    const param = currentVersionParams[i];
    const subParams = param.subParams;
    if (param.inputStyle === 'level' && subParams.length > 0) {
      for (let j = 0; j < subParams.length; j++) {
        const subParam = subParams[j];
        if (
          subParam.label_en === key
        ) {
          subParam.options = options;
        }
      }
    }
  }
  return currentVersionParams;
}

export function getDefaultValueByKeyPath(dataList, keyPath, roleType) {
  let value;
  for (let i = 0; i < dataList.length; i++) {
    const data = dataList[i];
    console.log(data, 'KEYKEYKEYKEYKEY');
    if (data.keyPath === keyPath) {
      value = data.defaultValue;
      break;
    }
    if (data.subParams?.length > 0) {
      value = getDefaultValueByKeyPath(data.subParams, keyPath);
      if (value) return value;
    }
  }
  return value;
}

// 判断子参数是否全部为重要参数 (返回非重要参数个数)
export function checkChildrenIsVitalParam(data, count) {
  data.subParams.forEach((subParam) => {
    if (!subParam.isVitalParam) {
      count += 1;
    }
    if (subParam.subParams?.length > 0) {
      count += checkChildrenIsVitalParam(subParam, count);
    }
  });
  return count;
}

// 判断子参数是否全部为默认重要参数 (返回默认非重要参数个数)
export function checkChildrenIsDefaultVitalParam(data, count) {
  data.subParams.forEach((subParam) => {
    if (!subParam.isDefaultVital) {
      count += 1;
    }
    if (subParam.subParams?.length > 0) {
      count += checkChildrenIsDefaultVitalParam(subParam, count);
    }
  });
  return count;
}

// 判断子参数是否存在重要参数  返回重要参数数量
export function checkChildrenHasVitalParam(data, count) {
  if (!data.subParams || data.subParams.length <= 0) {
    return count;
  }
  data.subParams.forEach((subParam) => {
    if (subParam.isVitalParam) {
      count += 1;
    }
    if (subParam.subParams?.length > 0) {
      count += checkChildrenHasVitalParam(subParam, count);
    }
  });
  console.log(count, 'COUNT');
  return count;
}

export function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

