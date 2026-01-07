<script setup>
import { reactive, onMounted, nextTick, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AlgorithmLibTree from './AlgorithmLibTree.vue';
// import CreateAlgorithmLibraryDialog from '../../../components/workspace/algorithm/CreateAlgorithmLibraryDialog.vue';
// import ImportAlgorithmLibraryDialog from '../../../components/workspace/algorithm/ImportAlgorithmLibraryDialog.vue';
import { getInEffectLibAndAlgList } from '../../../apis/workspace/algorithm.api';
import dictionary from '../../../utils/dictionary'

const route = useRoute();
const router = useRouter();
// const CreateAlgorithmLibraryDialogRef = ref(null);
// const ImportAlgorithmLibraryDialogRef = ref(null);
const state = reactive({
  search: {},
  libraryList: [],
});
const treeId = computed(() => route.query.id);

watch(
  () => treeId.value,
  async () => {
    // await renderTree();
  },
);
onMounted(async () => {
  await fetchTreeData();
  await renderTree();
});

// function onSearch() {
//   fetchTreeData();
// }

async function renderTree () {
  await nextTick();
  if (treeId.value) {
    const treeNode = document.querySelector(
      `.el-tree-node[data-key="${treeId.value}"]`,
    );
    treeNode?.click();
  } else {
    const treeNode = document.querySelector('.el-tree-node__children .el-tree-node');
    treeNode?.click();
  }
}

async function fetchTreeData () {
  try {
    state.loading = true;
    const libAndAlg = await getInEffectLibAndAlgList();
    if (libAndAlg) {
      // state.libraryList.push(libAndAlg);
      // state.libraryList.forEach((item) => {
      //   item.type = 'lib';
      // });
      libAndAlg.algorithmVersionList.forEach((alg, i) => {
        if (state.libraryList.find(item => item.name === alg.category)) {
          // alg.type = 'lib'
          state.libraryList.find(item => item.name === alg.category).children.push(alg)
        } else {
          // alg.type = 'lib'
          state.libraryList.push({
            name: alg.category,
            labelName: dictionary.arithmetic[alg.category],
            id: i,
            children: [alg]
          })
        }
      });
    }
    console.log(libAndAlg, 'GGGGGGGGGGGGGGGGG');

  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}

// 添加弹框显示
// function onAdd() {
//   CreateAlgorithmLibraryDialogRef.value.show();
// }
//
// function onImport() {
//   ImportAlgorithmLibraryDialogRef.value.show();
// }

function onViewAll () {
  router.push({
    name: route.name,
    query: { all: true },
  });
}

function onUpdateTreeData () {
  fetchTreeData();
}

// const handleAdd = async (val) => {
//   if (val == false) {
//     setTimeout(() => {
//       router.push({
//         path: '/algorithm',
//       });
//     }, 70);
//   }
// };
</script>

<template>
  <div class="catalog-wrapper">
    <div class="header-area background">
      <div class="title">算法库</div>
      <div class="right">
        <!--        <el-button type="text" class="import" @click="onImport">-->
        <!--          <el-icon-->
        <!--            ><img src="../../../assets/workspace/import.svg" alt=""-->
        <!--          /></el-icon>-->
        <!--          导入-->
        <!--        </el-button>-->
        <!--        <el-button type="text" class="add" @click="onAdd">-->
        <!--          <el-icon>-->
        <!--            <Plus />-->
        <!--          </el-icon>-->
        <!--          添加-->
        <!--        </el-button>-->

        <el-button type="text"
                   class="tree-switch"
                   @click="onViewAll">
          查看所有
          <el-icon>
            <ArrowRight />
          </el-icon>
        </el-button>
      </div>
    </div>
    <div class="main">
      <div class="actions">
        <!--        <div class="action-row">-->
        <!--          <el-input-->
        <!--            v-model.trim="state.search.name"-->
        <!--            clearable-->
        <!--            placeholder="算法库名称"-->
        <!--            @keydown.enter="onSearch"-->
        <!--            @clear="onSearch"-->
        <!--          >-->
        <!--            <template #suffix>-->
        <!--              <el-icon>-->
        <!--                <Search />-->
        <!--              </el-icon>-->
        <!--            </template>-->
        <!--          </el-input>-->
        <!--          <el-button type="text" class="tree-switch" @click="onViewAll">-->
        <!--            查看所有-->
        <!--            <el-icon>-->
        <!--              <ArrowRight />-->
        <!--            </el-icon>-->
        <!--          </el-button>-->
        <!--        </div>-->
        <!-- 左侧树形结构 -->
        <AlgorithmLibTree :data="state.libraryList"
                          @done="onUpdateTreeData" />
      </div>
    </div>
  </div>
  <!-- 添加弹框的子组件 -->
  <!--   @done="onUpdateTreeData" -->
  <!--  <CreateAlgorithmLibraryDialog-->
  <!--    ref="CreateAlgorithmLibraryDialogRef"-->
  <!--    @done="onUpdateTreeData"-->
  <!--    @handleAdd="handleAdd"-->
  <!--  />-->
  <!--  <ImportAlgorithmLibraryDialog-->
  <!--    ref="ImportAlgorithmLibraryDialogRef"-->
  <!--    @done="onUpdateTreeData"-->
  <!--  />-->
</template>

<style scoped lang="scss">
.catalog-wrapper {
  background-color: #fff;
  height: 100%;
  overflow: auto;
  border: 1px solid $headerBackgroundColor;
  &::-webkit-scrollbar {
    width: 0px;
  }
  .main {
    padding: 20px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.0390625rem;
  }

  .action-row {
    display: flex;
    gap: 0.5rem;

    .tab {
      display: flex;
      border-bottom: 1px solid rgba(67, 118, 255, 0.2);
      gap: 0.25rem;

      .el-button {
        border: 1px solid rgba(67, 118, 255, 0.2) !important;
        padding: 0.5rem;
        border-radius: 2px 2px 0 0;
        border-bottom: 0 !important;
        font-size: 14px;
        height: 24px;
        margin: 0;
      }

      .active {
        background: rgba(67, 118, 255, 0.1);
      }
    }

    .tree-switch {
      font-size: 12px;
      height: 24px;
    }
  }
}
</style>
