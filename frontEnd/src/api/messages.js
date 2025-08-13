import { api } from "./client";

// 받은 쪽지 목록
export const getInbox = () => api("/api/messages", { method: "GET" });

// 보낸 쪽지 목록
export const getSent = () => api("/api/messages/sent", { method: "GET" });

// 쪽지 상세
export const getMessageDetail = (id) => api(`/api/messages/${id}`, { method: "GET" });

// 쪽지 보내기
export const sendMessage = (data) =>
  api("/api/messages/send", {
    method: "POST",
    body: JSON.stringify(data),
  });

// 쪽지 삭제
export const deleteMessage = (id) => api(`/api/messages/${id}`, { method: "DELETE" });

// 미읽음 개수
export const getUnreadCount = () => api("/api/messages/unread-count", { method: "GET" });
