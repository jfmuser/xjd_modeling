<script>
import { h, reactive, computed, defineAsyncComponent } from 'vue';
import TabTable from '@/components/TableComponent/PaginationTable/index.vue';
import OriginTable from '@/components/TableComponent/OriginTable/index.vue';
import Linking from '@/components/TableComponent/CustomColumn/Linking/index.vue';
import Input from '@/components/FormComponent/Input/index.vue';
import CLegend from '@/components/FormComponent/Legend/index.vue';
import Weight from '@/components/TableComponent/CustomColumn/Weight/index.vue';
import CEchart from '../components/ChartComponent/EchartsInstance/index.vue';
import Ctitle from '@/components/FormComponent/Text/Title/index.vue';
import Cpearson from '@/components/CanvasComponent/pearsonDiagram/index.vue';

export default {
  components: { TabTable },
  setup() {
    return () => [
      h('div', {}, '-------'),
      // h(Weight, {}),
      h(CLegend, {
        choose: [{ label: 'loss', value: 'loss' }],
        onForm: (...args) => {
          console.log('onForm', args);
        },
        onChange: (...args) => {
          console.log('onChange', args);
        },
      }),
      // h(Cpearson, {}),
      h(Ctitle, { title: 'title' }),
      h('hr'),
      h(CEchart, {
        options: {
          color: [
            '#494ece',
            '#00d269',
            '#ff8103',
            '#00dfcf',
            '#f23ba9',
            '#0080ff',
            '#c13ce1',
            '#ffcd03',
            '#7c56ff',
            '#a7cf02',
            '#00d3ff',
            '#ff1414',
          ],
          backgroundColor: '#fbfbfc',
          tooltip: { axisPointer: { type: 'line' }, trigger: 'axis' },
          itemStyle: {},
          grid: {
            top: '10%',
            left: '3%',
            right: '10%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            splitLine: { show: false },
            axisTick: { alignWithLabel: true },
            name: 'iters',
            nameCap: 10,
            minInterval: 1,
          },
          yAxis: {
            type: 'value',
            name: 'loss',
            splitArea: { show: true, areaStyle: { color: ['#ffffff'] } },
          },
          series: [
            {
              name: 'loss',
              type: 'line',
              smooth: false,
              symbolSize: 1,
              itemStyle: { opacity: 1 },
              lineStyle: { opacity: 1 },
              data: [
                [0, 0.6423936860398055],
                [1, 0.12182160039002575],
                [2, 0.05663400168504933],
                [3, 0.046763899024753586],
              ],
              pairType: 'loss',
            },
          ],
        },
        width: '',
        height: '',
        containerHeight: '500px',
        noData: '无数据',
        noDataMissing: false,
        zoom: false,
        legend: true,
        className: '',
        class: 'chart__instance',
      }),
      h('hr'),
      // h(OriginTable, {
      //   data: [{ variable: 'x8', weight: '-0.134531' }],
      //   export: 'model_summary',
      //   header: [{ label: 'index', type: 'index', width: 100 }],
      //   change: () => {
      //     console.log('change');
      //   },
      //   refreshed: () => {
      //     console.log('refreshed');
      //   },
      // }),
      h('div', {}, '-------'),
    ];
  },
};
</script>
