<script>
import { hh } from '@/utils';
import { ElTableColumn } from 'element-plus';
export default {
  name: 'CustomCol',
  data() {
    return {
      minWidth: 120,
      showOverflowTooltip: true,
    };
  },
  methods: {
    column(h) {
      const variable = {
        props: Object.assign(
          {
            minWidth: this.minWidth,
            showOverflowTooltip: this.showOverflowTooltip,
          },
          this.$attrs,
        ),
        scopedSlots: {
          default: (cell) => {
            // TODO
            if (this.$scopedSlots['default']) {
              return this.$scopedSlots['default'](cell);
            } else {
              return cell.row[cell.column.property];
            }
          },
        },
      };
      return h(ElTableColumn, variable);
    },
  },
  render() {
    return this.column(hh);
  },
};
</script>

<style lang="" scoped></style>
