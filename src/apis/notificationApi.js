// 알림 관련 api 모음

import api from "../utils/api";

// 알림 내역 전체 조회
export async function fetchNotificationList() {
  const res = await api.get(`/common/notification`);
  return res.data?.data || [];
}

// 알림 읽음 처리
export async function readNotification(notificationId) {
  const res = await api.patch(`/common/notification/${notificationId}`);
  return res.data;
}

// 알림 삭제 처리 
export async function deleteNotification(notificationId){
  const res = await api.delete(`/common/notification/${notificationId}`);
  return res.data;
}