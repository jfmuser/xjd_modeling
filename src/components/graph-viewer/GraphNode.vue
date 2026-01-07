<script setup>
import {
  computed,
  ref,
  inject,
  onMounted,
  reactive,
  watch,
  onBeforeUnmount,
} from 'vue';
import { CircleCheck, CircleClose } from '@element-plus/icons-vue';
import useJobComponentStore from '../../stores/workspace/jobComponent.store';
import { formatSeconds } from '../../utils';
import dictionary from '../../utils/dictionary';
import useSecretflowStore from '../../stores/secretflow/secretflowInfo.store';
import { getInEffectLibAndAlgList } from '../../apis/workspace/algorithm.api';

const secretflowStore = useSecretflowStore();
const jobComponentStore = useJobComponentStore();
const props = defineProps({ info: { type: Object, default: null } })
const state = reactive({ label: '', active: false, time: 0 });
const getNode = inject('getNode');
const node = getNode ? getNode() : null;

const label = node?.store.data.data?.label;
const name_zh = node?.store.data.data?.name_zh;
console.log(node, 'kaskdksadkn')
let nodeStatus = ref(false);

let timer;
watch(
  () => jobComponentStore.current,
  (val) => {
    const node = getNode();
    state.active = val.node.id === node.id;
  },
);

const nodeData = computed(() => {
  const node = getNode();
  return node.store.data.data;
});

const status = computed(() => {
  return nodeData.value.status;
});
const isStartNode = computed(() => {
  return state.type === 'start';
});

onMounted(async () => {
  const node = getNode();
  const { type, role, label, time, name_zh } = node.store.data.data;
  console.log(node, 'NODEA');

  state.type = type;
  state.role = role || 'guest';
  state.label = label;
  state.name_zh = name_zh;
  console.log({ label: state.label })
  // 设置隐语算法的名称
  // const algorithmVersionList = []
  // const { algorithmVersionList } = await getInEffectLibAndAlgList();
  // // for (let k in secretflowStore.i18n) {
  // algorithmVersionList.forEach((alg) => {
  //   console.log(window.nodeIndex, 'WINDOWINDEX');

  //   if (alg.module === state.label) {
  //     console.log(alg, 'alg.labelName');
  //     // state.label = secretflowStore.i18n[k][state.label]
  //     state.label = alg.labelName;
  //   }
  // });
  //   console.log(state.label.slice(0,-2),state.label,'瞎水道');
  //   if (k.includes(state.label.slice(0,-2))) {
  //   state.label = secretflowStore.i18n[k][state.label.slice(0,-2)]
  // }
  // }
  if (props.info.module === state.label) {
    console.log(props.info, 'alg.labelName');
    state.label = props?.info?.labelName;
  }
  if (status.value === 'running') {
    // FIXME:
    console.log(Date.now() - time);
    state.time = formatSeconds(Math.max(0, Date.now() - time));
    timer = setInterval(() => {
      state.time = formatSeconds(Math.max(0, Date.now() - time));
    }, 1e3);
  }

  node.on('change:data', (...args) => {
    console.info('change:data', args);
  });
});

onBeforeUnmount(() => {
  clearInterval(timer);
});

function changeNodeStatus () {
  nodeStatus.value = true;
}
</script>

<template>
  <div class="graph-node-wrapper"
       :class="{
      [state.role]: true,
      [state.type]: true,
      'common-node': true,
      [status]: true,
      active: !isStartNode && state.active,
      success: nodeStatus,
    }">
    <div class="content">
      <template v-if="isStartNode">
        <img v-if="state.role === 'host'"
             src="../../assets/host_node.png"
             alt="" />
        <img v-else-if="state.role === 'guest'"
             src="../../assets/guest_node.png"
             alt="" />
      </template>
      <div class="text">
        <!-- <div>{{ state.label }}</div> -->
        <!-- <div>{{ state.name_zh ?? state.label }}</div> -->
        <div>{{ name_zh ?? label }}</div>
        <div v-if="status === 'running'">{{ state.time }}</div>
      </div>
    </div>
    <!-- <el-icon :class="{ status: true, [status]: true }">
      <CircleCheck v-if="status === 'success'" />
      <CircleClose v-if="status === 'failed'" />
    </el-icon> -->
  </div>
  <el-progress v-if="status === 'running'"
               :percentage="100"
               :indeterminate="true"
               :duration="3"
               :show-text="false" />
</template>

<style  lang="scss">
@keyframes activeKeyframe {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

.step {
  background: rgba(67, 118, 255, 0.05);
  border: 1px solid rgba(67, 118, 255, 0.3);
}

.graph-node-wrapper {
  width: 250px;
  height: 45px;
  background-color: #ffffff;
  box-shadow: 0px 8px 14px 0px rgba(50, 91, 183, 0.1);
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  &.active {
    animation: 1s ease-in activeKeyframe infinite;
  }

  .content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .status {
    position: absolute;
    right: 20px;

    &.waiting {
      color: $color-warning;
    }

    &.failed {
      color: $color-error;
    }
  }

  &.host {
    color: #2f78ffff;
  }

  &.guest {
    color: #2a50ec;
  }

  &.arbiter {
    color: $color-info;
  }

  &.start {
    border-radius: 6px;
  }

  &.common-node {
    @extend .step;
    border-radius: 11px;
  }

  &.Reader {
    @extend .step;
    border-radius: 11px;
  }

  &.DataIO,
  &.DataTransform {
    @extend .step;
    border-radius: 0;
  }

  &.FeatureScale {
    @extend .step;
    transform: skewX(-15deg);

    & > * {
      transform: skewX(15deg);
    }
  }

  &.Evaluation {
    @extend .step;
    border-radius: 21px;
  }

  &.waiting {
    background: lighten($color-info, 60%);
  }
}

.graph-area .graph-node-wrapper {
  border-bottom: 6px solid #ccc;
}
</style>
