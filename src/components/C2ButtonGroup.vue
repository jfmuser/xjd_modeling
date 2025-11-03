<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
});

const current = computed(() => {
  return route.query.type || props.tabs[0];
});

const emits = defineEmits(['change']);

function onSwitchTab(type) {
  router.replace({
    name: route.name,
    query: {
      ...route.query,
      type,
    },
  });
  emits('change', type);
}
</script>

<template>
  <el-button-group>
    <el-button
      v-for="(item, index) in props.tabs"
      :key="index"
      :type="current === item ? 'primary' : ''"
      @click="() => onSwitchTab(item)"
      >{{ item }}
    </el-button>
  </el-button-group>
</template>

<style scoped></style>
