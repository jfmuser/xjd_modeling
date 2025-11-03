import { createHeader } from '../fn/common.js';
import { each, sortByName } from '../fn/uitls';

const getHeader = () => {
  return [
    { type: 'index', label: '序号' },
    createHeader('变量', 'variable', { sortable: true }),
    createHeader('样例', 'samples'),
  ];
};

const fn = (response) => {
  const tableInfo = response.reader_name.meta.table_info;
  const tableData = [];
  each(tableInfo, (samples, variable) => {
    const dataItem = {};
    dataItem['variable'] = variable;
    dataItem['samples'] = samples;
    tableData.push(dataItem);
  });

  sortByName(tableData, 'variable');
  const group = [];
  const meta = response.reader_name && response.reader_name.meta;
  if (meta) {
    if (meta.file_path) {
      group.push({
        type: 'text',
        props: {
          content: '文件路径: ' + meta.file_path,
          className: 'small-form-text',
        },
      });
    }
    if (meta.file_count) {
      group.push({
        type: 'text',
        props: {
          content: '文件行数: ' + meta.file_count,
          className: 'small-form-text',
        },
      });
    }
    group.push(
      ...[
        {
          type: 'text',
          props: {
            content: '命名空间: ' + response.reader_name.meta.namespace,
            className: 'small-form-text',
          },
        },
        {
          type: 'text',
          props: {
            content: '数据名称: ' + response.reader_name.meta.table_name,
            className: 'small-form-text',
          },
        },
      ],
    );
    if (meta.count) {
      group.push({
        type: 'text',
        props: {
          content: '行数: ' + meta.count,
          className: 'small-form-text',
        },
      });
    }
    group.push(
      ...[
        {
          type: 'text',
          props: {
            content: '分区数: ' + response.reader_name.meta.partitions,
            className: 'small-form-text',
          },
        },
        {
          type: 'text',
          props: {
            content: '存储引擎: ' + response.reader_name.meta.storage_engine,
            className: 'small-form-text',
          },
        },
      ],
    );
    if (tableData.length > 0) {
      group.push(
        ...[
          {
            type: 'form',
            props: {
              form: [{ type: 'search' }],
            },
          },
          {
            type: 'table',
            props: {
              data: tableData,
              header: getHeader(),
              zeroFormat: '0',
              export: response.reader_name.meta.table_name,
              pageSize: -1,
            },
          },
        ],
      );
    }
  }
  return group;
};

export default fn;
