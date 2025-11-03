import md5 from 'js-md5';
function changeParams(params) {
  let path = [];
  for (let k in params) {
    if (typeof params[k] == 'object') {
      console.log(params);

      if (!Array.isArray(params[k])) {

        params[k] = sortJson(params[k]);
      } else {
        console.log(params[k], 'params[k]');
        params[k] = arrObjSort(params[k])
      }
      console.log('是否进行了排序', params[k]);
      params[k] = JSON.stringify(params[k]);
    }
    const str = k + '=' + params[k];

    path.push(str);
  }
  if (path[0] === 'type=') {
    path.shift();
  }

  path.sort((a, b) => {
    return (a + '').localeCompare(b + '');
  });

  path = path.join('&');
  console.log(path, 'PATH');
  return path;
}

function arrObjSort(list) {
  if (!typeof list[0] === 'object') return list
  list.forEach(item => {
    item = sortJson(item)
  })
  return list
}

function sortJson(list) {
  const finishObj = {};
  let arr = [];
  console.log(list, 'LIST');
  console.log(list);
  // debugger
  const acquirekey = Object.keys(list);
  acquirekey.sort((a, b) => {
    return (a + '').localeCompare(b + '');
  });
  let sortKeys = Object.keys(list).sort((a, b) => {
    return list[a] - list[b];
  });
  console.log(JSON.stringify(acquirekey), JSON.stringify(sortKeys), 'JAJAJA');
  for (var sortIndex in sortKeys) {
    arr.push(list[sortKeys[sortIndex]]);
  }
  acquirekey.forEach((item, index) => {
    finishObj[item] = arr[index];
  });
  return finishObj;
}
// 加密后的Path
function Encryptions(config, encript) {
  console.log(config, 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
  let Path = '';
  if (
    config.params ||
    config.url === '/getConfigInfo' ||
    config.url === '/messageCenter/unreadCount'
  ) {
    const allData = config.params || {};
    allData['timestamp'] = config.headers.timestamp;
    allData['FromRoute'] = config.headers['FromRoute'] ?? '';
    allData['referer'] = config.headers['ref'] ?? '';
    const Params = changeParams(allData);
    Path = `${config.baseURL}${config.url}&${Params}&${encript}`;
  }

  if (config.url === '/role/page/1/10') {
    const pdata = JSON.parse(JSON.stringify(config.data));
    const allData = { ...pdata };
    allData['timestamp'] = config.headers.timestamp;
    allData['FromRoute'] = config.headers['FromRoute'] ?? '';
    allData['referer'] = config.headers['ref'] ?? '';
    const Params = changeParams(allData);
    Path = `${config.baseURL}${config.url}&${Params}&${encript}`;
  }
  if (!config.params && config.data) {
    const pdata = JSON.parse(JSON.stringify(config.data));
    const allData = { ...pdata };

    allData['timestamp'] = config.headers.timestamp;
    allData['FromRoute'] = config.headers['FromRoute'] ?? '';
    allData['referer'] = config.headers['ref'] ?? '';
    const Params = changeParams(allData);
    console.log('params', Params);
    Path = `${config.baseURL}${config.url}&${Params}&${encript}`;
  }
  if (!config.params && !config.data) {
    const allData = {};
    allData['timestamp'] = config.headers.timestamp;
    allData['FromRoute'] = config.headers['FromRoute'] ?? '';
    allData['referer'] = config.headers['ref'] ?? '';
    if (config.url.includes('?')) {
      const splitUrl = config.url.split('?')
      const url = splitUrl[0]
      const paramList = splitUrl[1].split('=')
      for (let i = 0; i < paramList.length; i++) {
        allData[paramList[i]] = paramList[i + 1]
        i++
      }
      const Params = changeParams(allData);
      Path = `${config.baseURL}${url}&${Params}&${encript}`;

    } else {
      const Params = changeParams(allData);
      Path = `${config.baseURL}${config.url}&${Params}&${encript}`;
    }
  }
  if (config.params && config.data) {
    const pdata = JSON.parse(JSON.stringify(config.data));
    const allData = { ...pdata, ...config.params };
    for (let k in allData) {
      if (allData[k] == null) {
        allData[k] = '';
      }
    }
    allData['timestamp'] = config.headers.timestamp;
    allData['FromRoute'] = config.headers['FromRoute'] ?? '';
    allData['referer'] = config.headers['ref'] ?? '';
    const Params = changeParams(allData);
    Path = `${config.baseURL}${config.url}&${Params}&${encript}`;
  }


  console.log(Path, '这是PATH');

  return Path;
}

function getTime() {
  let time = parseInt(new Date().getTime() / 1000) + '';
  return time;
}

function encrypt(params) {
  let encoded = params;
  let md5Str = md5(encoded);
  return { encoded, md5Str };
}

function getConfig(config, signs) {

  let sign = '';
  if (
    config.url != '/user/login' &&
    config.url != '/user/currentUser' &&
    config.url != '/user/getDetail'
  ) {
    const FINISH = Encryptions(config, signs);
    const rs = encrypt(FINISH);
    sign = rs.md5Str;
  }
  return sign;
}
export default {
  changeParams,
  Encryptions,
  getTime,
  encrypt,
  getConfig,
};
