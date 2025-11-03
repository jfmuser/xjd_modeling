<script setup>
import { reactive, computed } from 'vue';
import { nanoid } from 'nanoid';
import { ElMessage } from 'element-plus';
// import { checkWeb } from '../../apis/org/site.api';
import { checkNet } from '../../apis/dept/site.api';
import { IPRegExp } from '../../utils/regExp';
import { useRoute } from 'vue-router';

const route = useRoute();
const state = reactive({
  visible: false,
  lines: [],
  networkAccessType: '',
  isIndeterminate: false,
  checkAll: false,
  checkedLines: [],
});

class Line {
  constructor({ text = '', isValid = false } = {}) {
    this.id = nanoid();
    this.text = text;
    this.message = '';
    this.isValid = isValid;
    this.loading = false;
  }
}

const submitEnable = computed(
  () =>
    state.checkedLines.length > 0 &&
    state.checkedLines.every((item) => item.text !== '' && item.isValid),
);

function onDeleteLine(id) {
  state.lines = state.lines.filter((item) => item.id !== id);
}

function onAddLine() {
  state.lines.push(new Line());
}

async function onCheck(line) {
  try {
    line.loading = true;
    const [ip, port] = line.text.split(':');
    const data = {
      ip,
      port: Number(port),
    };
    data.partyId = Number(route.query.partyId);
    data.federatedId = Number(route.query.federatedId);
    await checkNet(data);


    line.isValid = true;
    ElMessage.success(line.text);
  } catch (error) {
    line.isValid = false;
    line.message = error;
  } finally {
    line.loading = false;
  }
}

function onInput(line) {
  line.isValid = false;
  if (IPRegExp.test(line.text)) {
    line.message = '';
  } else {
    line.message = '参数格式错误';
  }
}

function show(val, type) {
  state.networkAccessType = type;
  state.lines = val
    ? val
      .split(';')
      .filter(Boolean)
      .map((item) => new Line({ text: item, isValid: true }))
    : [];
  state.visible = true;
}

function onClose() {
  state.lines = [];
  state.visible = false;
  state.checkAll = false;
  state.checkedLines = [];
}

defineExpose({ show });
const emits = defineEmits(['done']);

function onSave() {
  emits('done', {
    networkAccessType: state.networkAccessType,
    data: state.checkedLines.map((item) => `${item.text};`).join(''),
  });
  onClose();
}

function onCheckAll(val) {
  state.checkedLines = val ? state.lines : [];
  state.isIndeterminate = false;
}

function onCheckChange(value) {
  const checkedCount = value.length;
  state.checkAll = checkedCount === state.lines.length;
  state.isIndeterminate = checkedCount > 0 && checkedCount < state.lines.length;
}
</script>

<template>
  <el-dialog v-model="state.visible" :before-close="onClose" width="550px" :show-close="false"
    custom-class="network-dialog" append-to-body>
    <template #title>
      <div class="tool-area">
        <el-checkbox v-model="state.checkAll" :indeterminate="state.isIndeterminate" @change="onCheckAll">全选
        </el-checkbox>
        <el-button type="text" class="add" @click="onAddLine">
          <el-icon>
            <Plus></Plus>
          </el-icon>
          添加
        </el-button>
      </div>
    </template>

    <el-checkbox-group v-model="state.checkedLines" @change="onCheckChange">
      <div v-for="line in state.lines" :key="line.id" v-loading="line.loading" class="line-item">
        <el-checkbox :label="line">{{}}</el-checkbox>
        <el-input v-model="line.text" placeholder="请输入网关地址, 如: 127.0.0.1:8080" @input="() => onInput(line)">
          <template #suffix>
            <el-link :underline="false" :disabled="!line.text || line.message !== ''"
              :type="line.isValid ? 'success' : 'default'" @click="() => onCheck(line)">测试连接
            </el-link>
            <el-link type="danger" :underline="false" @click="() => onDeleteLine(line.id)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-link>
          </template>
        </el-input>
        <el-alert v-if="line.message" :title="line.message" type="error" :closable="false">
        </el-alert>
      </div>
    </el-checkbox-group>
    <template #footer>
      <el-button type="primary" :disabled="!submitEnable" @click="onSave">确定
      </el-button>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.network-dialog {
  .tool-area {
    display: flex;

    .add {
      margin-left: auto;
    }
  }

  .line-item {
    display: flex;
    flex-wrap: wrap;
    margin: 5px 0;

    .el-input {
      width: 90%;
    }

    .el-link--inner {
      display: flex;
    }
  }
}
</style>
