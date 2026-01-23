<template>
  <div :style="{ width:'100%'}">
    <el-form-item v-show="data.subParams?.length === 0 ? data.isVitalParam : true"
                  :label-width="data.roleType?.includes(roleType) && data.isVitalParam ?'100px':'0px'"
                  :error="errorMessage"
                  :rules="rules"
                  ref="ruleForm">
      <template #label>
        <el-tooltip effect="dark"
                    v-if="data.roleType?.includes(roleType) && data.isVitalParam"
                    placement="top-start"
                    :content="data.description + data.placeholder">
          <div>
            <div class="text-ellipsis">{{ data.label_zh }}</div>
            <div class="text-ellipsis">({{ data.label_en }}) </div>
          </div>
        </el-tooltip>
      </template>
      <!-- 1 -->
      <el-input v-if="data.inputStyle === 'input' && !isJSON(data.defaultValue) && data.roleType.includes(roleType) && data.isVitalParam"
                v-model="data.defaultValue"
                style="width: 100%"
                :placeholder="data.placeholder"
                @input="onValidate(data)"
                @blur="changeParam(data.key, data.defaultValue, operatorName)" />
      <!-- <el-input
        v-if="data.inputStyle === 'list' || data.inputStyle === 'json'"
        v-model="data.defaultValue"
        style="width: 60%"
        type="textarea"
        :placeholder="data.placeholder"
        @input="onValidate(data)"
        @blur="changeParam(data.keyPath, data.defaultValue, operatorName)"
      /> -->
      <!-- 2 -->
      <el-input v-if="data.inputStyle === 'input' && isJSON(data.defaultValue) && data.roleType.includes(roleType)&& data.isVitalParam"
                v-model="data.defaultValue"
                :autosize="{minRows:4, maxRows:8}"
                style="width: 100%"
                type="textarea"
                :placeholder="data.placeholder"
                @input="onValidateJSON(data)"
                @blur="changeParam(data.key, data.defaultValue, operatorName)" />
      <!-- 3 -->
      <el-select v-else-if="data.inputStyle === 'select' && data.roleType.includes(roleType)&& data.isVitalParam"
                 v-model="data.defaultValue"
                 @change="changeParam(data.key, data.defaultValue, operatorName)"
                 style="width: 100%">
        <el-option v-for="option in data.options"
                   :key="option.value"
                   :value="option.value"
                   :label="option.label" />
      </el-select>
      <!-- <el-select v-else-if="data.inputStyle === 'mult-select'" v-model="data.defaultValue" multiple
        @change="changeParam(data.keyPath, data.defaultValue, operatorName)">
        <el-option v-for="option in JSON.parse(data.options)" :key="option.value" :value="option.value"
          :label="option.value">
        </el-option>
      </el-select> -->
      <!-- 4 -->
      <el-checkbox-group v-else-if="data.inputStyle === 'checkbox' && data.roleType.includes(roleType)&& data.isVitalParam"
                         v-model="data.defaultValue"
                         @change="changeParam(data.key, data.defaultValue, operatorName, data)">
        <el-checkbox v-for="option in data.options"
                     :label="option.value"
                     :key="option.value"></el-checkbox>
      </el-checkbox-group>
      <template v-if="data.subParams && data.subParams.length > 0">
        <!-- 9999{{data.subParams[1].subParams}} -->
        <AlgorithmParamTree v-for="item in data.subParams"
                            :key="item.key"
                            :data="item"
                            :operatorName="operatorName"
                            :constraints="constraints"
                            :roleType="roleType"
                            @paramsChange="changeParams($event)">
        </AlgorithmParamTree>
      </template>
      <!-- <template v-if="data.subParams && data.subParams.length > 0">
        <AlgorithmParamTree
          v-for="item in data.subParams[1].subParams"
          :key="item.id"
          :data="item"
          :operatorName="operatorName"
          :constraints="constraints"
          @paramsChange="changeParams($event)"
        >
        </AlgorithmParamTree>
      </template> -->
    </el-form-item>
  </div>
</template>

<script>
import { onBeforeMount } from 'vue';
import { isJSON } from '../project/algorithmUtil'
export default {
  name: 'AlgorithmParamTree',
  props: {
    data: {
      type: Object,
      required: true,
    },
    constraints: {
      type: Array,
      required: true,
    },
    operatorName: {
      type: String,
      required: true,
    },
    roleType: {
      type: String,
      required: true
    }
  },
  setup (props) {
    onBeforeMount(() => {
      console.log({ data: props.data, roleType: props.roleType })
      if (props.roleType === 'host') {
        console.log(props.data, props.data.isVitalParam, '这是host');
      }
      if (props.data.inputStyle === 'checkbox' && !Array.isArray(props.data.defaultValue)) {
        props.data.defaultValue = JSON.parse(props.data.defaultValue)
      }
    })
    console.log({ data: props.data })
  },
  emits: ['paramsChange'],
  data () {
    return {
      errorMessage: '',
      isJSON: isJSON,
    };
  }, methods: {
    changeParam: function (keyPath, value, operatorName) {
      console.log('valuevaluevaluevalue1111', keyPath, value, operatorName);
      this.$emit('paramsChange', {
        keyPath: keyPath,
        value: value,
        operatorName: operatorName,
      });
    },
    async changeParams (vars) {
      console.log('valrs', vars);
      this.$emit('paramsChange', vars);
    },
    onValidate (data) {
      if (data && data.regx) {
        const regex = new RegExp(data.regx);
        if (!regex.test(data.defaultValue)) {
          this.errorMessage = data.errorMessage;
        } else {
          this.errorMessage = '';
        }
      }
      else {
        this.errorMessage = '';
      }
    },
    onValidateJSON (data) {
      if (!isJSON(data.defaultValue)) {
        this.errorMessage = '请输入正确的JSON格式';
      } else {
        this.errorMessage = ''
      }
    }
  },
}
</script>

<style scoped lang="scss">
:deep .asterisk-left {
  min-width: 300px;
}
.text-ellipsis {
  @include texthide;
}
</style>
