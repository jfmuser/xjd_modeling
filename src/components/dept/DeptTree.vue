<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const defaultProps = {
  label: 'name',
  id: 'id'
};
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  mine: {
    type: Boolean,
    required: false,
    default: false,
  },
  mySite: {
    type: Array,
    required: true
  }
});

function onTreeNodeClick(node) {
  router.push({
    name: route.name,
    query: {
      // institutions: node.__label,
      id: node.id,
      belong: props.mine ? 'me' : 'other',
    },
  });

  
  // if (!props.mine) {
  //   return;
  // }
  // router.push({
  //   name: route.name,
  //   query: {
  //     siteId: node.__data.siteId,
  //     id: node.__id,
  //     partyId: node.__data.partyId,
  //     federatedId: node.__federatedId,
  //   },
  // });
}
</script>

<template>
  <el-tree :data="props.data" default-expand-all :props="defaultProps" node-key="id" highlight-current
    @node-click="onTreeNodeClick">
    <!-- @node-click="onTreeNodeClick" style="background-color: transparent;color:#fff;font-size: 0.0625rem"> -->
    <template #default="{ node, data }">
      <div class="custom-tree-node">
        <div>
          {{ data.id === props.mySite.id ? data.name + '(本方)' : data.name }}
        </div>
        <div class="action">
          <el-link type="primary" :underline="false" @click.stop="onDelete(data)">
            <el-icon>
              <Delete></Delete>
            </el-icon>
          </el-link>
        </div>
      </div>
    </template>
  </el-tree>
</template>

<style scoped>
:deep .el-tree-node__content {
  /* height: 0.1015625rem; */
}


</style>
