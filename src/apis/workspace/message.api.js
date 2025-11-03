import request from './fateApiRequest';

export function getMessageList({
  currentPage = 1,
  size = 10,
  messageName = null,
  messageStatus = 999,
} = {}) {
  return request.post(
    `/messageCenter/msgList`,
    { messageName, messageStatus },
    { params: { currentPage, size } },
  );
}

export function messageStored(messageId) {
  return request.post(
    '/messageCenter/storedInDatabase',
    {},
    { params: { messageId } },
  );
}

export function messageUpdateReadStatus(messageId) {
  return request.post(
    '/messageCenter/updateReadStatus',
    {},
    { params: { messageId } },
  );
}

export function updateAllReadStatus() {
  return request.post('/messageCenter/updateAllReadStatus');
}

export function getUnreadCount() {
  return request.post('/messageCenter/unreadCount');
}

export function deleteMessage(messageId) {
  return request.post(`/messageCenter/delete/${messageId}`);
}
