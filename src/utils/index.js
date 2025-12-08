// @ts-nocheck
import { h } from 'vue';
import dayjs from 'dayjs';
import _ from 'lodash';
import jschardet from 'jschardet';
import Papa from 'papaparse';
/**
 *
 * @param {*} date
 * @param {*} template
 * @returns
 */
export const formatDateTime = (date, template = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) {
    return '';
  }
  const result = dayjs(date);
  if (!result.isValid()) {
    return '';
  }
  return result.format(template);
};

function pad(val, maxLength = 2, fillString = '0') {
  return `${val}`.padStart(maxLength, fillString);
}

export function formatSeconds(seconds, milliSecond = true) {
  if (isNaN(seconds)) {
    return '--:--:--';
  }
  const ss = milliSecond ? (seconds /= 1000) : seconds;
  const h = Math.floor(ss / 60 / 60);
  const m = Math.floor((ss / 60) % 60);
  const s = Math.floor(ss % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 *
 * @param {*} val
 * @param {*} fractionDigits
 * @returns
 */
export function percent(val, fractionDigits = 1) {
  if (`${val}`.includes('%')) {
    return val;
  }
  let result = '0.0%';
  if (!val) {
    return result;
  }
  return `${(val * 100).toFixed(fractionDigits)}%`;
}

/**
 * NOT Recommend
 * Recommend: SiteRole
 * @param {*} val
 * @returns
 */
export function formatScenarioType(val) {
  switch (val) {
    case '1':
      return '';
    case '2':
      return '应用方';
    default:
      return '数据源';
  }
}

/**
 *
 * @param {*} str
 * @returns
 */
export function isJSONString(str) {
  if (typeof str !== 'string') {
    return false;
  }
  try {
    const obj = JSON.parse(str);
    return !!(typeof obj == 'object' && obj);
  } catch (e) {
    return false;
  }
}

/**
 * [{ leftRegion: 1, rightRegion: 2 }]-> '1~2'
 * @param {*} val
 * @param {*} connector
 * @param {*} separator
 * @returns
 */
export function formatRange(val, connector = '~', separator = ';') {
  if (!Array.isArray(val)) {
    return '';
  }
  const result = val.reduce((result, current) => {
    const { leftRegion, rightRegion } = current;
    if (leftRegion === rightRegion) {
      result.push(leftRegion);
    } else {
      result.push(`${leftRegion}${connector}${rightRegion}`);
    }
    return result;
  }, []);
  return result.join(separator);
}

export function initWebSocket(url, onopen, onmessage) {
  const baseUrl = window.location.origin;
  const baseWsUrl = baseUrl.replace(/http|https/g, 'ws');
  const instance = new WebSocket(baseWsUrl + url);
  instance.onopen = onopen;
  instance.onmessage = onmessage;
  instance.onerror = () => {
    try {
      this.initWebSocket(url, onopen, onmessage, (onclose = null));
    } catch (e) {
      console.log('websoket error:', e);
    }
  };
  instance.onclose = function () {};
  return instance;
}

export function deepClone(val) {
  return _.cloneDeep(val);
}

/**
 * FIXME
 * @param {*} num
 * @param {*} fixed
 * @returns
 */
export function formatFloat(num, fixed = 6) {
  if (typeof num !== 'number') {
    num = parseFloat(num) || 0;
  }
  const parseIntNum = Number.parseInt(num);
  if (isNaN(parseIntNum)) {
    return 0;
  } else {
    if (parseIntNum === num) {
      return num;
    } else {
      return num.toFixed(fixed);
    }
  }
}

export function hh(type, props, children) {
  const event = props.on || {};

  const events = Object.keys(event).reduce((result, current) => {
    let key;
    if (current.startsWith('on')) {
      key = current;
    } else {
      key = `on${current.slice(0, 1).toUpperCase()}${current.slice(1)}`;
    }
    result[key] = event[current];
    return result;
  }, {});
  const hProps = {
    ..._.omit(props, ['on', 'props']),
    ...events,
    ...props.props,
  };

  return h(type, hProps, children);
}

export function fromEntries(entries) {
  if (!Array.isArray(entries)) {
    return;
  }
  const result = {};
  entries.forEach(([key, value]) => {
    result[key] = value;
  });
  return result;
}

export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}

export function downloadFile(url) {
  const ele = document.createElement('a');
  ele.href = url;
  ele.setAttribute('download', '');
  ele.click();
}

// 转换时间(格式:2023-10-07T06:11:53+08:00)
export const formatTimestamp = (timestamp) => {
  const min = new Date(timestamp).getTime() / 1000 / 60;
  const localNow = new Date().getTimezoneOffset();

  const localTime = min - localNow;

  return dayjs(new Date(localTime * 1000 * 60)).format('YYYY-MM-DD HH:mm:ss');
};

export const getTimeCost = (createTime, finishedTime) => {
  const start = new Date(createTime);
  const end = new Date(finishedTime);
  const timeDiff = end.getTime() - start.getTime();
  const hours = Math.floor(timeDiff / (3600 * 1000));
  const hourLeft = timeDiff % (3600 * 1000);
  const minutes = Math.floor(hourLeft / (60 * 1000));
  const minLeft = timeDiff % (60 * 1000);
  const seconds = Math.floor(minLeft / 1000);

  if (hours !== 0) return `${hours}h ${minutes}min ${seconds}s`;
  if (minutes !== 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
};

// 针对csv文件的解析
const checkEncoding = (base64Str) => {
  const str = atob(base64Str.split(';base64,')[1]); // atob  方法 Window 对象 定义和用法 atob() 方法用于解码使用 base-64 编码的字符
  let encoding = jschardet.detect(str);
  encoding = encoding.encoding;
  if (encoding === 'windows-1252') {
    encoding = 'GB2312';
  }
  if (encoding === 'ISO-8859-2') {
    encoding = 'GB2312';
  }
  return encoding;
};

export const analysisCsv = async (originFileObj, limit) => {
  const fReader = new FileReader();
  fReader.readAsDataURL(originFileObj.slice(0, 200)); //  readAsDataURL 读取本地文件 获得的是一个base64值
  return new Promise((resolve, reject) => {
    fReader.onload = (evt) => {
      // 读取文件成功
      const data = evt?.target?.result;
      const encoding = typeof data === 'string' ? checkEncoding(data) : '';

      const parseOptions = {
        encoding,
        delimiter: ',',
        complete: (csvData) => {
          return;
        },
        chunk: function (results) {
          resolve(results);
        },
        header: true,
      };

      if (limit) {
        parseOptions.preview = 5;
      }

      Papa.parse(originFileObj, parseOptions);
    };
    fReader.onerror = () => {
      reject();
    };

    // 读取本地文件超时
    setTimeout(() => {
      reject();
    }, 5000);
  });
};

// 根据值进行类型分类
export const parseDataTableColumns = (csvData) => {
  const { meta, data } = csvData;
  const { fields = [] } = meta;
  const parseResult = fields.map((field) => {
    console.log(field);

    const dataItem = data[0];
    if (!dataItem) return { col: field, type: 'float' };
    let type = 'float';
    if (Number.isInteger(Number(dataItem[field]))) {
      type = 'int';
    } else if (!isNaN(Number(dataItem[field]))) {
      type = 'float';
    } else {
      type = 'str';
    }
    return {
      type,
      col: field,
    };
  });

  return parseResult;
};

//引擎类型
export const engineType = {
  0: '联邦学习',
  1: '多方计算',
};


export const exportCsv = (data, fieldName) => {
  let csv = Papa.unparse(data);
  let content = new Blob([csv]);
  let urlObject = window.URL || window.webkitURL || window;
  let url = urlObject.createObjectURL(content);
  let el = document.createElement('a');
  el.href = url;
  el.download = `${fieldName}.csv`;
  el.click();
  urlObject.revokeObjectURL(url);
};
