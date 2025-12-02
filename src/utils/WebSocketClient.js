/**
 * WebSocket 客户端封装
 * - 负责：连接 / 自动重连 / 发送消息（可选等待响应）
 * - 精简：去掉外部基本不会用到的辅助方法和多余日志
 */
export default class WebSocketClient {
  /**
   * @param {string} url - WebSocket 连接地址
   * @param {Object} options - 配置选项
   * @param {boolean} options.autoReconnect - 是否自动重连，默认 true
   * @param {number} options.reconnectInterval - 重连间隔（毫秒），默认 3000
   * @param {number} options.maxReconnectAttempts - 最大重连次数，默认 5，0 表示无限重连
   * @param {number} options.timeout - 消息超时时间（毫秒），默认 30000
   * @param {Function} options.onOpen - 连接打开回调
   * @param {Function} options.onClose - 连接关闭回调
   * @param {Function} options.onError - 错误回调
   * @param {Function} options.onMessage - 消息回调
   */
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      timeout: 30000,
      onOpen: null,
      onClose: null,
      onError: null,
      onMessage: null,
      ...options,
    };

    this.ws = null;
    this.readyState = WebSocket.CLOSED;
    this.reconnectAttempts = 0;
    this.isManualClose = false;

    // 请求-响应模式需要的状态
    this.messageId = 0;
    this.pendingMessages = new Map(); // { messageId: { resolve, reject, timeout } }
  }

  /**
   * 连接 WebSocket
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      // 已连接
      if (this.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // 正在连接中，直接返回失败，外部可自行控制重试
      if (this.readyState === WebSocket.CONNECTING) {
        reject(new Error('WebSocket 正在连接中'));
        return;
      }

      this.isManualClose = false;
      this.readyState = WebSocket.CONNECTING;

      try {
        this.ws = new WebSocket(this.url);

        // 连接成功
        this.ws.onopen = (event) => {
          this.readyState = WebSocket.OPEN;
          this.reconnectAttempts = 0;

          if (this.options.onOpen) {
            this.options.onOpen(event);
          }
          resolve();
        };

        // 接收消息
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        // 连接关闭
        this.ws.onclose = (event) => {
          this.readyState = WebSocket.CLOSED;

          if (this.options.onClose) {
            this.options.onClose(event);
          }

          // 清理所有待响应的消息
          this.pendingMessages.forEach(({ reject, timeout }) => {
            clearTimeout(timeout);
            reject(new Error('WebSocket 连接已关闭'));
          });
          this.pendingMessages.clear();

          // 自动重连：这里不会 new WebSocketClient，只是复用当前实例重新 new WebSocket
          if (!this.isManualClose && this.options.autoReconnect) {
            this.reconnect();
          }
        };

        // 连接错误
        this.ws.onerror = (event) => {
          if (this.options.onError) {
            this.options.onError(event);
          }

          if (this.readyState === WebSocket.CONNECTING) {
            reject(new Error('WebSocket 连接失败'));
          }
        };
      } catch (error) {
        this.readyState = WebSocket.CLOSED;
        reject(error);
      }
    });
  }

  /**
   * 自动重连（内部使用）
   */
  reconnect() {
    if (this.isManualClose) return;

    const { maxReconnectAttempts, reconnectInterval } = this.options;

    if (maxReconnectAttempts > 0 && this.reconnectAttempts >= maxReconnectAttempts) {
      console.error('WebSocket 重连次数已达上限', maxReconnectAttempts);
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      if (!this.isManualClose && this.readyState !== WebSocket.OPEN) {
        this.connect().catch((error) => {
          console.error('WebSocket 重连失败', error);
        });
      }
    }, reconnectInterval);
  }

  /**
   * 处理接收到的消息
   * @param {MessageEvent} event
   */
  handleMessage(event) {
    let data;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (error) {
      data = event.data;
    }

    // 如果有 messageId，尝试匹配待响应的消息
    if (data && typeof data === 'object' && data.messageId !== undefined) {
      const pending = this.pendingMessages.get(data.messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingMessages.delete(data.messageId);
        pending.resolve(data);
        return;
      }
    }

    // 通用消息回调
    if (this.options.onMessage) {
      this.options.onMessage(data, event);
    }
  }

  /**
   * 发送消息
   * @param {any} data - 要发送的数据
   * @param {boolean} waitResponse - 是否等待响应，默认 false
   * @returns {Promise<any>} 如果 waitResponse 为 true，返回响应数据
   */
  send(data, waitResponse = false) {
    return new Promise((resolve, reject) => {
      if (this.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket 未连接'));
        return;
      }

      let messageToSend = data;
      let messageId = null;

      // 如果需要等待响应，添加 messageId
      if (waitResponse) {
        messageId = ++this.messageId;
        const messageData = typeof data === 'object' ? { ...data } : { data };
        messageData.messageId = messageId;
        messageToSend = messageData;
      }

      try {
        const messageStr =
          typeof messageToSend === 'string' ? messageToSend : JSON.stringify(messageToSend);

        this.ws.send(messageStr);

        // 不等待响应
        if (!waitResponse) {
          resolve();
          return;
        }

        // 设置超时
        const timeout = setTimeout(() => {
          this.pendingMessages.delete(messageId);
          reject(new Error(`消息超时 (${this.options.timeout}ms)`));
        }, this.options.timeout);

        // 存储待响应的消息
        this.pendingMessages.set(messageId, { resolve, reject, timeout });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 发送消息并等待响应（便捷方法）
   * @param {any} data - 要发送的数据
   * @returns {Promise<any>} 响应数据
   */
  sendAndWait(data) {
    return this.send(data, true);
  }

  /**
   * 关闭连接
   * @param {number} code - 关闭代码，默认 1000
   * @param {string} reason - 关闭原因
   */
  close(code = 1000, reason) {
    this.isManualClose = true;

    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }

    // 清理所有待响应的消息
    this.pendingMessages.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket 连接已关闭'));
    });
    this.pendingMessages.clear();
  }
}

