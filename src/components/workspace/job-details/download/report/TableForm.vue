<template>
  <div>
    <el-table
      :data="paginatedData"
      size="mini"
      style="margin-bottom: 15px"
      header-cell-class-name="header-section-style default-cell-summary-font"
    >
      <el-table-column
        type="index"
        label="index"
        width="100"
        align="center"
        header-align="center"
        class-name="default-cell-style default-cell-first-col-style"
      />
      <el-table-column
        prop="origin"
        label="original variable"
        align="center"
        header-align="center"
        class-name="default-cell-style"
      />
      <el-table-column
        prop="modified"
        label="modified variable"
        align="center"
        header-align="center"
        class-name="default-cell-style"
      >
        <template #default="{ row }">
          <input
            :value="row.modified"
            class="simple-input"
            @input="handleInput($event, row.origin)"
            @keyup.enter="handleInputEnter"
          />
        </template>
      </el-table-column>
    </el-table>
    <div v-show="data.length > 0" class="flex flex-end">
      <el-pagination
        v-bind="page"
        :total="data.length"
        background
        @current-change="handleCurrentPageChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:data'],
  data() {
    return {
      page: {
        currentPage: 1,
        pageSize: 10,
        layout: 'total, prev, pager, next, jumper',
      },
    };
  },
  computed: {
    paginatedData() {
      const { currentPage, pageSize } = this.page;
      return this.data.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      );
    },
  },
  methods: {
    handleCurrentPageChange(val) {
      this.page.currentPage = val;
    },
    handleInput(event, variable) {
      const data = this.data.map((item) => {
        if (item.origin === variable) {
          return {
            ...item,
            modified: event.target.value,
          };
        }
        return item;
      });
      this.$emit('update:data', data);
    },
    handleInputEnter(event) {
      event.target.blur();
    },
    tableDownload() {
      // 映射表下载
      const data = this.data;
      const header = ['origin', 'modified'];
      return {
        default: {
          'variable_modify.csv': {
            header,
            data,
          },
        },
      };
    },
  },
};
</script>

<style lang="scss" scope>
@import '../../../../../styles/common/table.scss';
.simple-input {
  display: block;
  width: 100%;
  background: transparent;
  font-size: 12px;
  color: inherit;
  -webkit-appearance: none;
  border: 0;
  outline: 0;
  padding: 3px 7px;
  text-align: center;
  &:focus {
    text-align: left;
  }
}
</style>
