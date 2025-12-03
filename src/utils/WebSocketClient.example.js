/**
 * WebSocketClient 使用示例
 */

import WebSocketClient from './WebSocketClient.js';

// ========== 示例 1: 基本使用 ==========
async function example1() {
  const ws = new WebSocketClient('ws://localhost:8080/ws');

  // 连接
  try {
    await ws.connect();
    console.log('连接成功');
  } catch (error) {
    console.error('连接失败', error);
    return;
  }

  // 发送消息（不等待响应）
  ws.send({ type: 'ping', data: 'hello' });

  // 发送消息并等待响应
  try {
    const response = await ws.sendAndWait({ type: 'getData', id: 123 });
    console.log('收到响应', response);
  } catch (error) {
    console.error('发送消息失败', error);
  }

  // 注册消息监听器
  const unsubscribe = ws.onMessage((data) => {
    console.log('收到消息', data);
  });

  // 取消监听
  // unsubscribe();

  // 关闭连接
  ws.close();
}

// ========== 示例 2: 带配置选项 ==========
function example2() {
  const ws = new WebSocketClient('ws://localhost:8080/ws', {
    autoReconnect: true,        // 自动重连
    reconnectInterval: 3000,     // 重连间隔 3 秒
    maxReconnectAttempts: 5,     // 最多重连 5 次
    timeout: 30000,              // 消息超时 30 秒
    onOpen: (event) => {
      console.log('连接打开', event);
    },
    onClose: (event) => {
      console.log('连接关闭', event);
    },
    onError: (event) => {
      console.error('连接错误', event);
    },
    onMessage: (data, event) => {
      console.log('收到消息', data);
    },
  });

  ws.connect();
}

// ========== 示例 3: 在 Vue 组件中使用 ==========
/*
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import WebSocketClient from '@/utils/WebSocketClient.js';

const ws = ref(null);
const messages = ref([]);
const isConnected = ref(false);

onMounted(async () => {
  ws.value = new WebSocketClient('ws://localhost:8080/ws', {
    autoReconnect: true,
    onOpen: () => {
      isConnected.value = true;
      console.log('WebSocket 已连接');
    },
    onClose: () => {
      isConnected.value = false;
      console.log('WebSocket 已断开');
    },
    onError: (error) => {
      console.error('WebSocket 错误', error);
    },
  });

  // 注册消息监听
  ws.value.onMessage((data) => {
    messages.value.push(data);
  });

  // 连接
  try {
    await ws.value.connect();
  } catch (error) {
    console.error('连接失败', error);
  }
});

onBeforeUnmount(() => {
  if (ws.value) {
    ws.value.close();
  }
});

// 发送消息
const sendMessage = async () => {
  try {
    const response = await ws.value.sendAndWait({
      type: 'message',
      content: 'Hello WebSocket',
    });
    console.log('收到响应', response);
  } catch (error) {
    console.error('发送失败', error);
  }
};
</script>

<template>
  <div>
    <p>连接状态: {{ isConnected ? '已连接' : '未连接' }}</p>
    <button @click="sendMessage">发送消息</button>
    <ul>
      <li v-for="(msg, index) in messages" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>
</template>
*/

// ========== 示例 4: 请求-响应模式 ==========
async function example4() {
  const ws = new WebSocketClient('ws://localhost:8080/ws');
  await ws.connect();

  // 发送请求并等待响应
  const request = {
    type: 'getUserInfo',
    userId: 123,
  };

  try {
    // 服务器应该返回包含相同 messageId 的响应
    const response = await ws.sendAndWait(request);
    console.log('用户信息', response);
  } catch (error) {
    console.error('获取用户信息失败', error);
  }
}

// ========== 示例 5: 处理不同类型的消息 ==========
function example5() {
  const ws = new WebSocketClient('ws://localhost:8080/ws');

  ws.onMessage((data) => {
    if (data.type === 'notification') {
      console.log('收到通知', data.content);
    } else if (data.type === 'update') {
      console.log('收到更新', data.payload);
    } else {
      console.log('其他消息', data);
    }
  });

  ws.connect();
}

export { example1, example2, example4, example5 };

