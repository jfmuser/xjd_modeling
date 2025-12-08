export const modifyDataStructure = (
  resultObj,
  componentName,
) => {
  console.log('来了')
  const result = resultObj.divs[0]?.children[0];
  if (result?.type === 'descriptions') {
    const records = resultObj.divs
      ?.reduce(
        (ret, div) =>
          div?.children
            ? ret.concat(
                div.children.reduce(
                  (
                    childrenRet,
                    {
                      descriptions,
                      type,
                    },
                  ) =>
                    type === 'descriptions' &&
                    descriptions &&
                    descriptions?.items
                      ? childrenRet.concat(descriptions.items)
                      : childrenRet,
                  [],
                ),
              )
            : ret,
        [],
      )
      .map((item) => {
        let value = '-';
        if (item.type === 'AT_INT' || item.type === 'int') {
          value = item.value?.i64 ?? '-';
        }
        if (item.type === 'float' || item.type === 'AT_FLOAT') {
          value = item.value?.f ?? '-';
        }
        if (item.type === 'str' || item.type === 'AT_STRING') {
          value = item.value?.s ?? '-';
        }
        if (item.type === 'bool' || item.type === 'AT_BOOL') {
          value = item.value?.b ?? '-';
        }
        return {
          name: item.name,
          value,
        };
      });
    const schemaHeader = result.descriptions.items.map((item) => ({
      name: item.name,
      type: item.type,
    }));
    return {
      records: records || [],
      schema: schemaHeader,
      type: 'descriptions',
    };
  }

  if (result?.type === 'table') {
    const arr = result.table;
    const recordList = arr.rows.map((row, i) => {
      const { items, name = i } = row;
      const rowData = items.map((item, index) => {
        const { type } = arr.headers[index];
        let value= '-';

        if (type === 'float' || type === 'AT_FLOAT') {
          value = item.f ?? '-';
        } else if (type === 'str' || type === 'AT_STRING') {
          value = item.s ?? '-';
        } else if (type === 'int' || type === 'AT_INT') {
          value = item.i64 ?? '-';
        } else if (type === 'bool' || type === 'AT_BOOL') {
          value = item.b ?? '-';
        }

        return value;
      });
      return [name, ...rowData];
    });

    // 自定义scql分析算子(stats/scql_analysis)不需要自动加 name
    const schemaList =
      componentName && componentName === 'stats/scql_analysis'
        ? [...arr.headers]
        : [{ name: 'name', type: 'str' }, ...arr.headers];

    return { records: recordList, schema: schemaList, type: 'table' };
  }
  return {
    records: [],
    schema: [],
  };
};


  // 去除导出数据时手动加入的key
 export const convertDownDataSource = (dataList) => {
    return dataList.map((item) => {
      delete item.key;
      return item;
    });
  };

 export const getFullCsvDataForStatsPSI = (allTableInfo) => {
  const tableInfoMap = {};
  const _allTableInfo = [...allTableInfo];
  _allTableInfo.shift();
  _allTableInfo.forEach((info) => {
    tableInfoMap[info.name] = modifyDataStructure(info);
  });

  const csvFullData = [
    [
      'name (feature)',
      'feature',
      'PSI (feature)',
      'name (Label)',
      'Label',
      'PSI (Label)',
      'Base Ratio',
      'Test Ratio',
    ],
  ];

  const summaryInfo = modifyDataStructure(allTableInfo[0]);

  (summaryInfo?.records||[]).forEach((record) => {
    csvFullData.push(record);

    const key = record?.[1];
    const processedRecord = tableInfoMap?.[key]?.records?.map((item) => {
      (item ||[]).unshift(...['', '', '']);
      return item;
    }) ;
    csvFullData?.push(...processedRecord);
  });

  return csvFullData;
};

export const getFullCsvDataForSample = (allTableInfo) => {
  const allTableInfoList =
    allTableInfo?.map((info) => ({
      name: info.name,
      ...modifyDataStructure(info),
    })) || [];

  const csvFullData = [
    ['sample_name', 'num_before_sample', 'num_after_sample', 'sample_rate'],
  ];

  allTableInfoList.forEach((record) => {
    const num_before_sample = record?.records?.find(
      (item) => item?.name === 'num_before_sample',
    )?.value;

    const num_after_sample = record?.records?.find(
      (item) => item.name === 'num_after_sample',
    )?.value;

    const sample_rate = record?.records?.find(
      (item) => item.name === 'sample_rate',
    )?.value;

    csvFullData.push([record.name, num_before_sample, num_after_sample, sample_rate]);
  });

  return csvFullData;
};